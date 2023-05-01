# frozen_string_literal: true

module Banzai
  module Filter
    # See comments in MarkdownPreEscapeFilter for details on strategy
    class MarkdownPostEscapeFilter < HTML::Pipeline::Filter
      LITERAL_KEYWORD   = MarkdownPreEscapeFilter::LITERAL_KEYWORD
      LITERAL_REGEX     = %r{#{LITERAL_KEYWORD}-(.*?)-#{LITERAL_KEYWORD}}.freeze
      NOT_LITERAL_REGEX = %r{#{LITERAL_KEYWORD}-((%5C|\\).+?)-#{LITERAL_KEYWORD}}.freeze
      SPAN_REGEX        = %r{<span data-escaped-char>(.*?)</span>}.freeze

      XPATH_A            = Gitlab::Utils::Nokogiri.css_to_xpath('a').freeze
      XPATH_LANG_TAG     = Gitlab::Utils::Nokogiri.css_to_xpath('pre').freeze
      XPATH_ESCAPED_CHAR = Gitlab::Utils::Nokogiri.css_to_xpath('span[data-escaped-char]').freeze

      def call
        return doc unless result[:escaped_literals]

        new_html = unescaped_literals(doc.to_html)
        new_html = add_spans(new_html)

        @doc = parse_html(new_html)

        remove_spans_in_certain_attributes
        remove_unnecessary_escapes

        doc
      end

      private

      # For any literals that actually didn't get escape processed
      # (for example in code blocks), remove the special sequence.
      def unescaped_literals(html)
        html.gsub!(NOT_LITERAL_REGEX) do |match|
          last_match = ::Regexp.last_match(1)
          last_match_token = last_match.sub('%5C', '\\')

          escaped_item = Banzai::Filter::MarkdownPreEscapeFilter::ESCAPABLE_CHARS.find { |item| item[:token] == last_match_token }
          escaped_char = escaped_item ? escaped_item[:escaped] : last_match

          escaped_char = escaped_char.sub('\\', '%5C') if last_match.start_with?('%5C')

          escaped_char
        end

        html
      end

      # Replace any left over literal sequences with `span` so that our
      # reference processing is short-circuited
      def add_spans(html)
        html.gsub!(LITERAL_REGEX) do |match|
          last_match = ::Regexp.last_match(1)
          last_match_token = "\\#{last_match}"

          escaped_item = Banzai::Filter::MarkdownPreEscapeFilter::ESCAPABLE_CHARS.find { |item| item[:token] == last_match_token }
          escaped_char = escaped_item ? escaped_item[:char] : ::Regexp.last_match(1)

          "<span data-escaped-char>#{escaped_char}</span>"
        end

        html
      end

      # Since literals are converted in links, we need to remove any surrounding `span`.
      def remove_spans_in_certain_attributes
        doc.xpath(XPATH_A).each do |node|
          node.attributes['href'].value  = node.attributes['href'].value.gsub(SPAN_REGEX, '\1') if node.attributes['href']
          node.attributes['title'].value = node.attributes['title'].value.gsub(SPAN_REGEX, '\1') if node.attributes['title']
        end

        doc.xpath(XPATH_LANG_TAG).each do |node|
          node.attributes['lang'].value  = node.attributes['lang'].value.gsub(SPAN_REGEX, '\1') if node.attributes['lang']
        end
      end

      def remove_unnecessary_escapes
        doc.xpath(XPATH_ESCAPED_CHAR).each do |node|
          escaped_item = Banzai::Filter::MarkdownPreEscapeFilter::ESCAPABLE_CHARS.find { |item| item[:char] == node.content }

          next unless escaped_item

          if node.parent.name == 'code'
            # For any `data-escaped-char` that makes it into a `<code>` element,
            # convert back to the escaped character, such as `\$`. Usually this would
            # only happen for dollar math
            content = +escaped_item[:escaped]
          elsif escaped_item[:latex] && !escaped_item[:reference]
            # Character only used in latex, since it's outside of a code block we can
            # transform into the regular character
            content = +escaped_item[:char]
          else
            # Escaped reference character, so leave as is. This is so that our normal
            # reference processing can be short-circuited by escaping the reference,
            # like \@username
            next
          end

          merge_adjacent_text_nodes(node, content)
        end
      end

      def text_node?(node)
        node.is_a?(Nokogiri::XML::Text)
      end

      # Merge directly adjacent text nodes and replace existing node with
      # the merged content. For example, the document could be
      #   #(Text "~c_bug"), #(Element:0x57724 { name = "span" }, children = [ #(Text "_")] })]
      # Our reference processing requires a single string of text to match against. So even if it was
      #   #(Text "~c_bug"), #(Text "_")
      # it wouldn't match.  Merging together will give
      #   #(Text "~c_bug_")
      def merge_adjacent_text_nodes(node, content)
        if text_node?(node.previous)
          content.prepend(node.previous.content)
          node.previous.remove
        end

        if text_node?(node.next)
          content.concat(node.next.content)
          node.next.remove
        end

        node.replace(content)
      end
    end
  end
end

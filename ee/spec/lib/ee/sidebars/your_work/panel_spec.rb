# frozen_string_literal: true

require 'spec_helper'

RSpec.describe Sidebars::YourWork::Panel, feature_category: :navigation do
  let_it_be(:user) { create(:user) }

  let(:context) { Sidebars::Context.new(current_user: user, container: nil) }

  subject(:panel) { described_class.new(context) }

  it 'renders Workspaces' do
    expect(contains_menu?(::Sidebars::YourWork::Menus::WorkspacesMenu)).to be(true)
  end

  it 'renders Environments dashboard' do
    expect(contains_menu?(::Sidebars::YourWork::Menus::EnvironmentsDashboardMenu)).to be(true)
  end

  it 'renders Operations dashboard' do
    expect(contains_menu?(::Sidebars::YourWork::Menus::OperationsDashboardMenu)).to be(true)
  end

  it 'renders Security menu' do
    expect(contains_menu?(::Sidebars::YourWork::Menus::SecurityDashboardMenu)).to be(true)
  end

  def contains_menu?(menu)
    panel.instance_variable_get(:@menus).any?(menu)
  end
end

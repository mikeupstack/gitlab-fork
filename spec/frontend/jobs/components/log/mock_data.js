export const jobLog = [
  {
    offset: 1000,
    content: [{ text: 'Running with gitlab-runner 12.1.0 (de7731dd)' }],
  },
  {
    offset: 1001,
    content: [{ text: ' on docker-auto-scale-com 8a6210b8' }],
  },
  {
    offset: 1002,
    content: [
      {
        text: 'Using Docker executor with image dev.gitlab.org3',
      },
    ],
    section: 'prepare-executor',
    section_header: true,
  },
  {
    offset: 1003,
    content: [{ text: 'Starting service postgres:9.6.14 ...', style: 'text-green' }],
    section: 'prepare-executor',
  },
  {
    offset: 1004,
    content: [
      {
        text: 'Restore cache',
        style: 'term-fg-l-cyan term-bold',
      },
    ],
    section: 'restore-cache',
    section_header: true,
    section_options: {
      collapsed: 'true',
    },
  },
  {
    offset: 1005,
    content: [
      {
        text: 'Checking cache for ruby-gems-debian-bullseye-ruby-3.0-16...',
        style: 'term-fg-l-green term-bold',
      },
    ],
    section: 'restore-cache',
  },
];

export const utilsMockData = [
  {
    offset: 1001,
    content: [{ text: ' on docker-auto-scale-com 8a6210b8' }],
  },
  {
    offset: 1002,
    content: [
      {
        text:
          'Using Docker executor with image dev.gitlab.org:5005/gitlab/gitlab-build-images:ruby-2.6.6-golang-1.14-git-2.28-lfs-2.9-chrome-84-node-12.x-yarn-1.21-postgresql-11-graphicsmagick-1.3.34',
      },
    ],
    section: 'prepare-executor',
    section_header: true,
  },
  {
    offset: 1003,
    content: [{ text: 'Starting service postgres:9.6.14 ...' }],
    section: 'prepare-executor',
  },
  {
    offset: 1004,
    content: [{ text: 'Pulling docker image postgres:9.6.14 ...', style: 'term-fg-l-green' }],
    section: 'prepare-executor',
  },
  {
    offset: 1005,
    content: [],
    section: 'prepare-executor',
    section_duration: '10:00',
  },
];

export const originalTrace = [
  {
    offset: 1,
    content: [
      {
        text: 'Downloading',
      },
    ],
  },
];

export const regularIncremental = [
  {
    offset: 2,
    content: [
      {
        text: 'log line',
      },
    ],
  },
];

export const regularIncrementalRepeated = [
  {
    offset: 1,
    content: [
      {
        text: 'log line',
      },
    ],
  },
];

export const headerTrace = [
  {
    offset: 1,
    section_header: true,
    content: [
      {
        text: 'log line',
      },
    ],
    section: 'section',
  },
];

export const headerTraceIncremental = [
  {
    offset: 1,
    section_header: true,
    content: [
      {
        text: 'updated log line',
      },
    ],
    section: 'section',
  },
];

export const collapsibleTrace = [
  {
    offset: 1,
    section_header: true,
    content: [
      {
        text: 'log line',
      },
    ],
    section: 'section',
  },
  {
    offset: 2,
    content: [
      {
        text: 'log line',
      },
    ],
    section: 'section',
  },
];

export const collapsibleTraceIncremental = [
  {
    offset: 2,
    content: [
      {
        text: 'updated log line',
      },
    ],
    section: 'section',
  },
];

export const collapsibleSectionClosed = {
  offset: 5,
  section_header: true,
  isHeader: true,
  isClosed: true,
  line: {
    content: [{ text: 'foo' }],
    section: 'prepare-script',
    lineNumber: 1,
  },
  section_duration: '00:03',
  lines: [
    {
      offset: 80,
      content: [{ text: 'this is a collapsible nested section' }],
      section: 'prepare-script',
      lineNumber: 3,
    },
  ],
};

export const collapsibleSectionOpened = {
  offset: 5,
  section_header: true,
  isHeader: true,
  isClosed: false,
  line: {
    content: [{ text: 'foo' }],
    section: 'prepare-script',
    lineNumber: 1,
  },
  section_duration: '00:03',
  lines: [
    {
      offset: 80,
      content: [{ text: 'this is a collapsible nested section' }],
      section: 'prepare-script',
      lineNumber: 3,
    },
  ],
};

export const MOCK_BRANCHES = [
  {
    default: true,
    name: 'main',
    value: undefined,
  },
  {
    default: false,
    name: 'test1',
    value: undefined,
  },
  {
    default: false,
    name: 'test2',
    value: undefined,
  },
];

export const MOCK_TAGS = [
  {
    name: 'test_tag',
    value: undefined,
  },
  {
    name: 'test_tag2',
    value: undefined,
  },
];

export const MOCK_COMMITS = [
  {
    name: 'test_commit',
    value: undefined,
  },
];

export const FORMATTED_BRANCHES = {
  text: 'Branches',
  options: [
    {
      default: true,
      text: 'main',
      value: 'main',
    },
    {
      default: false,
      text: 'test1',
      value: 'test1',
    },
    {
      default: false,
      text: 'test2',
      value: 'test2',
    },
  ],
};

export const FORMATTED_TAGS = {
  text: 'Tags',
  options: [
    {
      text: 'test_tag',
      value: 'test_tag',
      default: undefined,
    },
    {
      text: 'test_tag2',
      value: 'test_tag2',
      default: undefined,
    },
  ],
};

export const FORMATTED_COMMITS = {
  text: 'Commits',
  options: [
    {
      text: 'test_commit',
      value: 'test_commit',
      default: undefined,
    },
  ],
};

export const MOCK_ERROR = {
  error: new Error('test_error'),
};

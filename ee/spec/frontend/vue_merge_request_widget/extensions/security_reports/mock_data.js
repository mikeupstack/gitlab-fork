export const fixedResponse = () => ({
  base_report_created_at: '2022-05-03T08:07:55.533Z',
  base_report_out_of_date: false,
  head_report_created_at: '2022-05-04T09:50:30.744Z',
  added: [],
  fixed: [
    {
      id: null,
      report_type: 'sast',
      name: 'TLS MinVersion too low.',
      severity: 'high',
      confidence: 'high',
      scanner: {
        external_id: 'gosec',
        name: 'Gosec',
        vendor: 'GitLab',
      },
      identifiers: [
        {
          external_type: 'gosec_rule_id',
          external_id: 'G402',
          name: 'Gosec Rule ID G402',
          url: null,
        },
        {
          external_type: 'CWE',
          external_id: '295',
          name: 'CWE-295',
          url: 'https://cwe.mitre.org/data/definitions/295.html',
        },
      ],
      project_fingerprint: 'a4e204904b34eba2448fc9ccfbceb645f8bde1e0',
      uuid: 'f07e9c29-5b5a-5d05-9c0b-d60376eb3d20',
      create_jira_issue_url: null,
      false_positive: false,
      create_vulnerability_feedback_issue_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_merge_request_path:
        '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_dismissal_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      project: {
        id: 278964,
        name: 'GitLab',
        full_path: '/gitlab-org/gitlab',
        full_name: 'GitLab.org / GitLab',
      },
      dismissal_feedback: null,
      issue_feedback: null,
      merge_request_feedback: null,
      description: 'The software does not validate, or incorrectly validates, a certificate.',
      description_html:
        '<p data-sourcepos="1:1-1:72" dir="auto">The software does not validate, or incorrectly validates, a certificate.</p>',
      links: [],
      location: {
        file: 'workhorse/internal/api/channel_settings.go',
        start_line: 47,
      },
      remediations: null,
      solution: null,
      evidence: null,
      request: null,
      response: null,
      evidence_source: null,
      supporting_messages: null,
      assets: [],
      details: {},
      state: 'resolved',
      scan: {
        type: 'sast',
        status: 'success',
        start_time: '2022-05-03T08:07:34',
        end_time: '2022-05-03T08:07:48',
      },
      blob_path:
        '/gitlab-org/gitlab/-/blob/12da18c64d983144286a3347230d31545be8abbe/workhorse/internal/api/channel_settings.go#L47',
    },
    {
      id: null,
      report_type: 'sast',
      name: 'TLS MinVersion too low.',
      severity: 'high',
      confidence: 'high',
      scanner: {
        external_id: 'gosec',
        name: 'Gosec',
        vendor: 'GitLab',
      },
      identifiers: [
        {
          external_type: 'gosec_rule_id',
          external_id: 'G402',
          name: 'Gosec Rule ID G402',
          url: null,
        },
        {
          external_type: 'CWE',
          external_id: '295',
          name: 'CWE-295',
          url: 'https://cwe.mitre.org/data/definitions/295.html',
        },
      ],
      project_fingerprint: '4e2fd3fbceca716761fcfa3d7d1883d7359bbbe6',
      uuid: '9a44ec92-848e-536a-a3af-6e4fe63999be',
      create_jira_issue_url: null,
      false_positive: false,
      create_vulnerability_feedback_issue_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_merge_request_path:
        '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_dismissal_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      project: {
        id: 278964,
        name: 'GitLab',
        full_path: '/gitlab-org/gitlab',
        full_name: 'GitLab.org / GitLab',
      },
      dismissal_feedback: null,
      issue_feedback: null,
      merge_request_feedback: null,
      description: 'The software does not validate, or incorrectly validates, a certificate.',
      description_html:
        '<p data-sourcepos="1:1-1:72" dir="auto">The software does not validate, or incorrectly validates, a certificate.</p>',
      links: [],
      location: {
        file: 'workhorse/internal/server/server.go',
        start_line: 100,
        end_line: 104,
      },
      remediations: null,
      solution: null,
      evidence: null,
      request: null,
      response: null,
      evidence_source: null,
      supporting_messages: null,
      assets: [],
      details: {},
      state: 'detected',
      scan: {
        type: 'sast',
        status: 'success',
        start_time: '2022-05-03T08:07:34',
        end_time: '2022-05-03T08:07:48',
      },
      blob_path:
        '/gitlab-org/gitlab/-/blob/12da18c64d983144286a3347230d31545be8abbe/workhorse/internal/server/server.go#L100-104',
    },
    {
      id: null,
      report_type: 'sast',
      name: 'Profiling endpoint is automatically exposed on /debug/pprof',
      severity: 'high',
      confidence: 'high',
      scanner: {
        external_id: 'gosec',
        name: 'Gosec',
        vendor: 'GitLab',
      },
      identifiers: [
        {
          external_type: 'gosec_rule_id',
          external_id: 'G108',
          name: 'Gosec Rule ID G108',
          url: null,
        },
        {
          external_type: 'CWE',
          external_id: '200',
          name: 'CWE-200',
          url: 'https://cwe.mitre.org/data/definitions/200.html',
        },
      ],
      project_fingerprint: 'f00e8b99ea60d236177d92207d8963698a68b5c9',
      uuid: '9aa37053-12e7-524c-9162-bfc2592d1a43',
      create_jira_issue_url: null,
      false_positive: false,
      create_vulnerability_feedback_issue_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_merge_request_path:
        '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_dismissal_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      project: {
        id: 278964,
        name: 'GitLab',
        full_path: '/gitlab-org/gitlab',
        full_name: 'GitLab.org / GitLab',
      },
      dismissal_feedback: null,
      issue_feedback: null,
      merge_request_feedback: null,
      description:
        'Separate mistakes or weaknesses could inadvertently make the sensitive information available to an attacker, such as in a detailed error message that can be read by an unauthorized party',
      description_html:
        '<p data-sourcepos="1:1-1:186" dir="auto">Separate mistakes or weaknesses could inadvertently make the sensitive information available to an attacker, such as in a detailed error message that can be read by an unauthorized party</p>',
      links: [],
      location: {
        file: 'workhorse/main.go',
        start_line: 10,
      },
      remediations: null,
      solution: null,
      evidence: null,
      request: null,
      response: null,
      evidence_source: null,
      supporting_messages: null,
      assets: [],
      details: {},
      state: 'resolved',
      scan: {
        type: 'sast',
        status: 'success',
        start_time: '2022-05-03T08:07:34',
        end_time: '2022-05-03T08:07:48',
      },
      blob_path:
        '/gitlab-org/gitlab/-/blob/12da18c64d983144286a3347230d31545be8abbe/workhorse/main.go#L10',
    },
  ],
});

export const addedResponse = () => ({
  base_report_created_at: '2022-05-03T08:07:55.533Z',
  base_report_out_of_date: false,
  head_report_created_at: '2022-05-04T09:50:30.744Z',
  fixed: [],
  added: [
    {
      id: null,
      report_type: 'sast',
      name: 'TLS MinVersion too low.',
      severity: 'high',
      confidence: 'high',
      scanner: {
        external_id: 'gosec',
        name: 'Gosec',
        vendor: 'GitLab',
      },
      identifiers: [
        {
          external_type: 'gosec_rule_id',
          external_id: 'G402',
          name: 'Gosec Rule ID G402',
          url: null,
        },
        {
          external_type: 'CWE',
          external_id: '295',
          name: 'CWE-295',
          url: 'https://cwe.mitre.org/data/definitions/295.html',
        },
      ],
      project_fingerprint: 'a4e204904b34eba2448fc9ccfbceb645f8bde1e0',
      uuid: 'f07e9c29-5b5a-5d05-9c0b-d60376eb3d20',
      create_jira_issue_url: null,
      false_positive: false,
      create_vulnerability_feedback_issue_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_merge_request_path:
        '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_dismissal_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      project: {
        id: 278964,
        name: 'GitLab',
        full_path: '/gitlab-org/gitlab',
        full_name: 'GitLab.org / GitLab',
      },
      dismissal_feedback: null,
      issue_feedback: null,
      merge_request_feedback: null,
      description: 'The software does not validate, or incorrectly validates, a certificate.',
      description_html:
        '<p data-sourcepos="1:1-1:72" dir="auto">The software does not validate, or incorrectly validates, a certificate.</p>',
      links: [],
      location: {
        file: 'workhorse/internal/api/channel_settings.go',
        start_line: 47,
      },
      remediations: null,
      solution: null,
      evidence: null,
      request: null,
      response: null,
      evidence_source: null,
      supporting_messages: null,
      assets: [],
      details: {},
      state: 'resolved',
      scan: {
        type: 'sast',
        status: 'success',
        start_time: '2022-05-03T08:07:34',
        end_time: '2022-05-03T08:07:48',
      },
      blob_path:
        '/gitlab-org/gitlab/-/blob/12da18c64d983144286a3347230d31545be8abbe/workhorse/internal/api/channel_settings.go#L47',
    },
    {
      id: null,
      report_type: 'sast',
      name: 'TLS MinVersion too low.',
      severity: 'high',
      confidence: 'high',
      scanner: {
        external_id: 'gosec',
        name: 'Gosec',
        vendor: 'GitLab',
      },
      identifiers: [
        {
          external_type: 'gosec_rule_id',
          external_id: 'G402',
          name: 'Gosec Rule ID G402',
          url: null,
        },
        {
          external_type: 'CWE',
          external_id: '295',
          name: 'CWE-295',
          url: 'https://cwe.mitre.org/data/definitions/295.html',
        },
      ],
      project_fingerprint: '4e2fd3fbceca716761fcfa3d7d1883d7359bbbe6',
      uuid: '9a44ec92-848e-536a-a3af-6e4fe63999be',
      create_jira_issue_url: null,
      false_positive: false,
      create_vulnerability_feedback_issue_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_merge_request_path:
        '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_dismissal_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      project: {
        id: 278964,
        name: 'GitLab',
        full_path: '/gitlab-org/gitlab',
        full_name: 'GitLab.org / GitLab',
      },
      dismissal_feedback: null,
      issue_feedback: null,
      merge_request_feedback: null,
      description: 'The software does not validate, or incorrectly validates, a certificate.',
      description_html:
        '<p data-sourcepos="1:1-1:72" dir="auto">The software does not validate, or incorrectly validates, a certificate.</p>',
      links: [],
      location: {
        file: 'workhorse/internal/server/server.go',
        start_line: 100,
        end_line: 104,
      },
      remediations: null,
      solution: null,
      evidence: null,
      request: null,
      response: null,
      evidence_source: null,
      supporting_messages: null,
      assets: [],
      details: {},
      state: 'detected',
      scan: {
        type: 'sast',
        status: 'success',
        start_time: '2022-05-03T08:07:34',
        end_time: '2022-05-03T08:07:48',
      },
      blob_path:
        '/gitlab-org/gitlab/-/blob/12da18c64d983144286a3347230d31545be8abbe/workhorse/internal/server/server.go#L100-104',
    },
    {
      id: null,
      report_type: 'sast',
      name: 'Profiling endpoint is automatically exposed on /debug/pprof',
      severity: 'high',
      confidence: 'high',
      scanner: {
        external_id: 'gosec',
        name: 'Gosec',
        vendor: 'GitLab',
      },
      identifiers: [
        {
          external_type: 'gosec_rule_id',
          external_id: 'G108',
          name: 'Gosec Rule ID G108',
          url: null,
        },
        {
          external_type: 'CWE',
          external_id: '200',
          name: 'CWE-200',
          url: 'https://cwe.mitre.org/data/definitions/200.html',
        },
      ],
      project_fingerprint: 'f00e8b99ea60d236177d92207d8963698a68b5c9',
      uuid: '9aa37053-12e7-524c-9162-bfc2592d1a43',
      create_jira_issue_url: null,
      false_positive: false,
      create_vulnerability_feedback_issue_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_merge_request_path:
        '/gitlab-org/gitlab/-/vulnerability_feedback',
      create_vulnerability_feedback_dismissal_path: '/gitlab-org/gitlab/-/vulnerability_feedback',
      project: {
        id: 278964,
        name: 'GitLab',
        full_path: '/gitlab-org/gitlab',
        full_name: 'GitLab.org / GitLab',
      },
      dismissal_feedback: null,
      issue_feedback: null,
      merge_request_feedback: null,
      description:
        'Separate mistakes or weaknesses could inadvertently make the sensitive information available to an attacker, such as in a detailed error message that can be read by an unauthorized party',
      description_html:
        '<p data-sourcepos="1:1-1:186" dir="auto">Separate mistakes or weaknesses could inadvertently make the sensitive information available to an attacker, such as in a detailed error message that can be read by an unauthorized party</p>',
      links: [],
      location: {
        file: 'workhorse/main.go',
        start_line: 10,
      },
      remediations: null,
      solution: null,
      evidence: null,
      request: null,
      response: null,
      evidence_source: null,
      supporting_messages: null,
      assets: [],
      details: {},
      state: 'resolved',
      scan: {
        type: 'sast',
        status: 'success',
        start_time: '2022-05-03T08:07:34',
        end_time: '2022-05-03T08:07:48',
      },
      blob_path:
        '/gitlab-org/gitlab/-/blob/12da18c64d983144286a3347230d31545be8abbe/workhorse/main.go#L10',
    },
  ],
});

export const emptyResponse = () => ({
  base_report_created_at: '2022-05-03T08:17:19.301Z',
  base_report_out_of_date: false,
  head_report_created_at: '2022-05-04T09:40:57.586Z',
  added: [],
  fixed: [],
});

export const findingMockData = {
  id: 'b58fadc9-e4af-5404-ba6b-e4ee14801c6f',
  stateComment: 'Existing comment',
  dismissedAt: '2023-03-07T10:50:09Z',
  dismissedBy: {
    name: 'Administrator',
    username: 'root',
    webUrl: 'http://gdk.test:3000/root',
    id: 'gid://gitlab/User/15',
  },
  vulnerability: {
    id: 1,
    stateTransitions: {
      nodes: [
        {
          comment: 'Existing comment',
          toState: 'DISMISSED',
          createdAt: '2023-03-07T10:50:09Z',
          author: {
            name: 'Administrator',
            username: 'root',
            webUrl: 'http://gdk.test:3000/root',
            id: 'gid://gitlab/User/15',
          },
        },
      ],
    },
  },
  mergeRequest: {
    id: 'git://gitlab/MergeRequest/7',
    iid: 7,
    webUrl: 'http://gdk.test:3000/root/security-reports-v2/-/merge_requests/7',
    createdAt: '2023-03-07T10:50:09Z',
    author: {
      id: 'gid://gitlab/User/1',
      name: 'Administrator',
      username: 'root',
      webUrl: 'http://gdk.test:3000/root',
    },
  },
  issueLinks: {
    nodes: [
      {
        id: 'git://gitlab/IssueLink/1',
        linkType: 'CREATED',
        issue: {
          id: 'gid://gitlab/Issue/2',
          iid: '2',
          webUrl: 'http://gdk.test:3000/root/security-reports-v2/-/issues/2',
          createdAt: '2023-03-07T10:50:09Z',
          author: {
            id: 'gid://gitlab/User/1',
            name: 'Administrator',
            username: 'root',
            webUrl: 'http://gdk.test:3000/root',
          },
        },
      },
    ],
  },
};

export const findingQueryMockData = () =>
  jest.fn().mockResolvedValue({
    data: {
      project: {
        id: 'gid://gitlab/Project/11',
        pipeline: {
          id: 'gid://gitlab/Ci::Pipeline/13',
          securityReportFinding: findingMockData,
        },
      },
    },
  });
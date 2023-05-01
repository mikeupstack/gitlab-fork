import {
  humanizeRules,
  humanizeInvalidBranchesError,
  LICENSE_FINDING,
  SCAN_FINDING,
} from 'ee/security_orchestration/components/policy_editor/scan_result_policy/lib';
import { NO_RULE_MESSAGE } from 'ee/security_orchestration/components/policy_editor/constants';

jest.mock('~/locale', () => ({
  getPreferredLocales: jest.fn().mockReturnValue(['en']),
  sprintf: jest.requireActual('~/locale').sprintf,
  s__: jest.requireActual('~/locale').s__, // eslint-disable-line no-underscore-dangle
  n__: jest.requireActual('~/locale').n__, // eslint-disable-line no-underscore-dangle
  __: jest.requireActual('~/locale').__,
}));

const singleValuedSecurityScannerRule = {
  rule: {
    type: SCAN_FINDING,
    branches: ['main'],
    scanners: ['sast'],
    vulnerabilities_allowed: 0,
    severity_levels: ['critical'],
    vulnerability_states: ['newly_detected'],
  },
  humanized:
    'SAST scanner finds any critical vulnerability in an open merge request targeting the main branch.',
};

const multipleValuedSecurityScannerRule = {
  rule: {
    type: SCAN_FINDING,
    branches: ['staging', 'main'],
    scanners: ['dast', 'sast'],
    vulnerabilities_allowed: 2,
    severity_levels: ['info', 'critical'],
    vulnerability_states: ['resolved'],
  },
  humanized:
    'DAST or SAST scanners find more than 2 info or critical vulnerabilities in an open merge request targeting the staging or main branches.',
};

const allValuedSecurityScannerRule = {
  rule: {
    type: SCAN_FINDING,
    branches: [],
    scanners: [],
    vulnerabilities_allowed: 2,
    severity_levels: ['info', 'critical'],
    vulnerability_states: ['resolved'],
  },
  humanized:
    'Any security scanner finds more than 2 info or critical vulnerabilities in an open merge request targeting all protected branches.',
};

const singleValuedLicenseScanRule = {
  rule: {
    type: LICENSE_FINDING,
    branches: ['main'],
    match_on_inclusion: true,
    license_types: ['MIT License'],
    license_states: ['detected'],
  },
  humanized:
    'License scanner finds any license matching MIT License that is pre-existing and is in an open merge request targeting the main branch.',
};

const multipleValuedLicenseScanRule = {
  rule: {
    type: LICENSE_FINDING,
    branches: ['staging', 'main'],
    match_on_inclusion: false,
    license_types: ['CMU License', 'CNRI Jython License', 'CNRI Python License'],
    license_states: ['detected', 'newly_detected'],
  },
  humanized:
    'License scanner finds any license except CMU License, CNRI Jython License and CNRI Python License in an open merge request targeting the staging or main branches.',
};

describe('humanizeRules', () => {
  it('returns the empty rules message in an Array if no rules are specified', () => {
    expect(humanizeRules([])).toStrictEqual([NO_RULE_MESSAGE]);
  });

  describe('security scanner rules', () => {
    it('returns a single rule as a human-readable string for user approvers only', () => {
      expect(humanizeRules([singleValuedSecurityScannerRule.rule])).toStrictEqual([
        singleValuedSecurityScannerRule.humanized,
      ]);
    });

    it('returns multiple rules with different number of branches/scanners as human-readable strings', () => {
      expect(
        humanizeRules([
          singleValuedSecurityScannerRule.rule,
          multipleValuedSecurityScannerRule.rule,
        ]),
      ).toStrictEqual([
        singleValuedSecurityScannerRule.humanized,
        multipleValuedSecurityScannerRule.humanized,
      ]);
    });

    it('returns a single rule as a human-readable string for all scanners and all protected branches', () => {
      expect(humanizeRules([allValuedSecurityScannerRule.rule])).toStrictEqual([
        allValuedSecurityScannerRule.humanized,
      ]);
    });

    describe('license scanner rules', () => {
      it('returns a single rule as a human-readable string for user approvers only', () => {
        expect(humanizeRules([singleValuedLicenseScanRule.rule])).toStrictEqual([
          singleValuedLicenseScanRule.humanized,
        ]);
      });

      it('returns multiple rules with different number of branches/scanners as human-readable strings', () => {
        expect(
          humanizeRules([singleValuedLicenseScanRule.rule, multipleValuedLicenseScanRule.rule]),
        ).toStrictEqual([
          singleValuedLicenseScanRule.humanized,
          multipleValuedLicenseScanRule.humanized,
        ]);
      });
    });
  });
});

describe('humanizeInvalidBranchesError', () => {
  it('returns message without any branch name for an empty array', () => {
    expect(humanizeInvalidBranchesError([])).toEqual(
      'The following branches do not exist on this development project: . Please review all protected branches to ensure the values are accurate before updating this policy.',
    );
  });

  it('returns message with a single branch name for an array with single element', () => {
    expect(humanizeInvalidBranchesError(['main'])).toEqual(
      'The following branches do not exist on this development project: main. Please review all protected branches to ensure the values are accurate before updating this policy.',
    );
  });

  it('returns message with multiple branch names for array with multiple elements', () => {
    expect(humanizeInvalidBranchesError(['main', 'protected', 'master'])).toEqual(
      'The following branches do not exist on this development project: main, protected and master. Please review all protected branches to ensure the values are accurate before updating this policy.',
    );
  });
});

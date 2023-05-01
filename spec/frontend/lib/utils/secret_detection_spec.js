import { containsSensitiveToken, confirmSensitiveAction, i18n } from '~/lib/utils/secret_detection';
import { confirmAction } from '~/lib/utils/confirm_via_gl_modal/confirm_via_gl_modal';

jest.mock('~/lib/utils/confirm_via_gl_modal/confirm_via_gl_modal');

const mockConfirmAction = ({ confirmed }) => {
  confirmAction.mockResolvedValueOnce(confirmed);
};

describe('containsSensitiveToken', () => {
  describe('when message does not contain sensitive tokens', () => {
    const nonSensitiveMessages = [
      'This is a normal message',
      '1234567890',
      '!@#$%^&*()_+',
      'https://example.com',
    ];

    it.each(nonSensitiveMessages)('returns false for message: %s', (message) => {
      expect(containsSensitiveToken(message)).toBe(false);
    });
  });

  describe('when message contains sensitive tokens', () => {
    const sensitiveMessages = [
      'token: glpat-cgyKc1k_AsnEpmP-5fRL',
      'token: GlPat-abcdefghijklmnopqrstuvwxyz',
      'token: feed_token=ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      'https://example.com/feed?feed_token=123456789_abcdefghij',
      'glpat-1234567890 and feed_token=ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    ];

    it.each(sensitiveMessages)('returns true for message: %s', (message) => {
      expect(containsSensitiveToken(message)).toBe(true);
    });
  });
});

describe('confirmSensitiveAction', () => {
  afterEach(() => {
    confirmAction.mockReset();
  });

  it('should call confirmAction with correct parameters', async () => {
    const prompt = 'Are you sure you want to delete this item?';
    const expectedParams = {
      primaryBtnVariant: 'danger',
      primaryBtnText: i18n.primaryBtnText,
    };
    await confirmSensitiveAction(prompt);

    expect(confirmAction).toHaveBeenCalledWith(prompt, expectedParams);
  });

  it('should return true when confirmed is true', async () => {
    mockConfirmAction({ confirmed: true });

    const result = await confirmSensitiveAction();
    expect(result).toBe(true);
  });

  it('should return false when confirmed is false', async () => {
    mockConfirmAction({ confirmed: false });

    const result = await confirmSensitiveAction();
    expect(result).toBe(false);
  });
});

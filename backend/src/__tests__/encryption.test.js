import { encryptToken, decryptToken } from '../utils/encryption.js';

describe('encryption utils', () => {
  const originalEnv = process.env.ENCRYPTION_KEY;

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-key-1234567890123456789012345';
  });

  afterAll(() => {
    process.env.ENCRYPTION_KEY = originalEnv;
  });

  it('encrypts and decrypts tokens simétricamente', () => {
    const secret = 'valor-super-secreto';
    const encrypted = encryptToken(secret);
    expect(encrypted).toBeDefined();
    expect(encrypted).not.toEqual(secret);

    const decrypted = decryptToken(encrypted);
    expect(decrypted).toEqual(secret);
  });
});

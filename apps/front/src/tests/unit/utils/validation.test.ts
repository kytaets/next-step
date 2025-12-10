import {
  validateEmail,
  validatePassword,
  checkPasswords,
  validateRegistrationForm,
  validateLogInForm,
  validateImageUrl,
} from '@/utils/validation';

describe('validateEmail', () => {
  it('returns error for empty or short email', () => {
    expect(validateEmail('')).toBe('Invalid email address');
    expect(validateEmail('abc')).toBe('Invalid email address');
  });

  it('returns error when missing @', () => {
    expect(validateEmail('example.com')).toBe('Invalid email address');
  });

  it('accepts valid email', () => {
    expect(validateEmail('test@example.com')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('returns error when empty or too short', () => {
    expect(validatePassword('')).toBe('Password must be at least 6 characters');
    expect(validatePassword('123')).toBe(
      'Password must be at least 6 characters'
    );
  });

  it('accepts valid password', () => {
    expect(validatePassword('123456')).toBeNull();
  });
});

describe('checkPasswords', () => {
  it('returns password validation error + mismatch error', () => {
    const result = checkPasswords('123', '456');
    expect(result).toContain('Password must be at least 6 characters');
    expect(result).toContain('Passwords do not match');
  });

  it('returns only mismatch error if password is valid', () => {
    const result = checkPasswords('123456', 'wrong');
    expect(result).toEqual(['Passwords do not match']);
  });

  it('returns no errors for matching valid passwords', () => {
    const result = checkPasswords('123456', '123456');
    expect(result).toEqual([]);
  });
});

describe('validateRegistrationForm', () => {
  it('validates email and passwords', () => {
    const result = validateRegistrationForm({
      email: 'bad',
      password: '123',
      confirm: '456',
    });

    expect(result).toContain('Invalid email address');
    expect(result).toContain('Password must be at least 6 characters');
    expect(result).toContain('Passwords do not match');
  });

  it('returns no errors for valid data', () => {
    const result = validateRegistrationForm({
      email: 'test@example.com',
      password: '123456',
      confirm: '123456',
    });

    expect(result).toEqual([]);
  });
});

describe('validateLogInForm', () => {
  it('validates email and password', () => {
    const result = validateLogInForm({
      email: 'invalid',
      password: '123',
    });

    expect(result).toContain('Invalid email address');
    expect(result).toContain('Password must be at least 6 characters');
  });

  it('returns no errors for valid login', () => {
    const result = validateLogInForm({
      email: 'test@example.com',
      password: '123456',
    });

    expect(result).toEqual([]);
  });
});

describe('validateImageUrl', () => {
  let originalImage: any;

  beforeAll(() => {
    originalImage = global.Image;
  });

  afterAll(() => {
    global.Image = originalImage;
  });

  function mockImage(success: boolean) {
    class MockImage {
      onload: () => void = () => {};
      onerror: () => void = () => {};

      constructor() {
        setTimeout(() => {
          success ? this.onload() : this.onerror();
        }, 0);
      }

      set src(_url: string) {}
    }
    global.Image = MockImage;
  }

  it('returns false when url is empty', async () => {
    const result = await validateImageUrl('');
    expect(result).toBe(false);
  });

  it('resolves true when image loads successfully', async () => {
    mockImage(true);
    const result = await validateImageUrl('http://valid-image.com/test.png');
    expect(result).toBe(true);
  });

  it('resolves false when image fails to load', async () => {
    mockImage(false);
    const result = await validateImageUrl('http://invalid-image.com/x.png');
    expect(result).toBe(false);
  });
});

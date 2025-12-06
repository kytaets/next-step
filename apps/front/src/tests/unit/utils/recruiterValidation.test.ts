import {
  validateCreateRecruiterForm,
  validateInvitationForm,
} from '@/utils/recruiterValidation'; // ← поправ шлях якщо інший

describe('validateCreateRecruiterForm', () => {
  it('returns errors when first and last names are missing', () => {
    const errors = validateCreateRecruiterForm({
      firstName: '',
      lastName: '',
    } as any);

    expect(errors.firstName).toBe('First name is required');
    expect(errors.lastName).toBe('Last name is required');
  });

  it('returns errors when names have invalid format', () => {
    const errors = validateCreateRecruiterForm({
      firstName: '1@',
      lastName: '!!',
    } as any);

    expect(errors.firstName).toBe(
      'First name must contain only letters and be 2–30 characters'
    );
    expect(errors.lastName).toBe(
      'Last name must contain only letters and be 2–30 characters'
    );
  });

  it('accepts valid first and last names', () => {
    const errors = validateCreateRecruiterForm({
      firstName: 'John',
      lastName: 'Doe',
    } as any);

    expect(errors).toEqual({});
  });

  it('validates trimmed values', () => {
    const errors = validateCreateRecruiterForm({
      firstName: '   ',
      lastName: '   ',
    } as any);

    expect(errors.firstName).toBe('First name is required');
    expect(errors.lastName).toBe('Last name is required');
  });
});

describe('validateInvitationForm', () => {
  it('returns error when email is missing', () => {
    const errors = validateInvitationForm({ email: '' });

    expect(errors.email).toBe('Email is required');
  });

  it('returns error for invalid email format', () => {
    const errors = validateInvitationForm({ email: 'invalid-email' });

    expect(errors.email).toBe('Invalid email format');
  });

  it('accepts valid email', () => {
    const errors = validateInvitationForm({ email: 'test@example.com' });

    expect(errors).toEqual({});
  });

  it('trims value before validation', () => {
    const errors = validateInvitationForm({ email: '   test@example.com   ' });

    expect(errors).toEqual({});
  });
});

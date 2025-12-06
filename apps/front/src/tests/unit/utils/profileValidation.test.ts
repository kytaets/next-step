import {
  validateProfileForm,
  validateUpdatedPersonalData,
  validateAvatarUrl,
  validateContacts,
  removeEmpty,
  replaceNulls,
  handleCertificatesSubmit,
  validateLanguages,
  handleExperienceSubmit,
  handleEducationSubmit,
} from '@/utils/profileValidation'; // поправ шлях до файлу!

// -------------------------------------------------------------
// validateProfileForm
// -------------------------------------------------------------
describe('validateProfileForm', () => {
  it('requires first and last name', () => {
    const errors = validateProfileForm({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
    } as any);

    expect(errors.firstName).toBe('First name is required');
    expect(errors.lastName).toBe('Last name is required');
    expect(errors.dateOfBirth).toBe('Date of birth is required');
  });

  it('rejects invalid name format', () => {
    const errors = validateProfileForm({
      firstName: '1!',
      lastName: 'Name-1',
      dateOfBirth: '2000-01-01',
    } as any);

    expect(errors.firstName).toMatch(/must contain only letters/);
    expect(errors.lastName).toMatch(/must contain only letters/);
  });

  it('rejects birth date in the future', () => {
    const errors = validateProfileForm({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: '2999-01-01',
    } as any);

    expect(errors.dateOfBirth).toBe('Birth date cannot be in the future');
  });

  it('rejects birth date if under 16', () => {
    const today = new Date();
    const year = today.getFullYear() - 10;
    const dob = `${year}-01-01`;

    const errors = validateProfileForm({
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: dob,
    } as any);

    expect(errors.dateOfBirth).toBe('You must be at least 16 years old');
  });
});

// -------------------------------------------------------------
// validateUpdatedPersonalData (same logic)
// -------------------------------------------------------------
describe('validateUpdatedPersonalData', () => {
  it('validates same rules as validateProfileForm', () => {
    const errors = validateUpdatedPersonalData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
    } as any);

    expect(errors.firstName).toBeDefined();
    expect(errors.lastName).toBeDefined();
    expect(errors.dateOfBirth).toBeDefined();
  });
});

// -------------------------------------------------------------
// validateAvatarUrl
// -------------------------------------------------------------
describe('validateAvatarUrl', () => {
  it('accepts valid URL', () => {
    const errors = validateAvatarUrl({ url: 'https://example.com' });
    expect(errors).toEqual({});
  });

  it('rejects invalid URL', () => {
    const errors = validateAvatarUrl({ url: 'not-a-url' });
    expect(errors.url).toBe('Invalid URL format');
  });
});

// -------------------------------------------------------------
// validateContacts
// -------------------------------------------------------------
describe('validateContacts', () => {
  it('validates incorrect links & formats', () => {
    const errors = validateContacts({
      githubUrl: 'bad',
      linkedinUrl: 'bad',
      telegramUrl: 'bad',
      publicEmail: 'bad',
      phoneNumber: '123',
    });

    expect(errors.githubUrl).toMatch(/github/i);
    expect(errors.linkedinUrl).toMatch(/linkedin/i);
    expect(errors.telegramUrl).toMatch(/telegram/i);
    expect(errors.publicEmail).toBe('Invalid email format');
    expect(errors.phoneNumber).toMatch(/380/);
  });

  it('returns no errors for valid data', () => {
    const errors = validateContacts({
      githubUrl: 'https://github.com/user',
      linkedinUrl: 'https://www.linkedin.com/in/user',
      telegramUrl: 'https://t.me/user',
      publicEmail: 'test@test.com',
      phoneNumber: '+380931234567',
    });

    expect(errors).toEqual({});
  });
});

// -------------------------------------------------------------
// removeEmpty / replaceNulls
// -------------------------------------------------------------
describe('removeEmpty & replaceNulls', () => {
  it('removeEmpty replaces "" with null', () => {
    const result = removeEmpty({
      githubUrl: '',
      linkedinUrl: 'abc',
    } as any);

    expect(result.githubUrl).toBeNull();
    expect(result.linkedinUrl).toBe('abc');
  });

  it('replaceNulls replaces null with ""', () => {
    const result = replaceNulls({
      githubUrl: null,
      linkedinUrl: 'abc',
    } as any);

    expect(result.githubUrl).toBe('');
    expect(result.linkedinUrl).toBe('abc');
  });
});

// -------------------------------------------------------------
// handleCertificatesSubmit
// -------------------------------------------------------------
describe('handleCertificatesSubmit', () => {
  const helpers = { setErrors: jest.fn() };

  beforeEach(() => helpers.setErrors.mockClear());

  it('validates required fields', () => {
    handleCertificatesSubmit(
      { certs: [{ name: '', url: '', date: '' }] as any },
      helpers as any,
      jest.fn()
    );

    expect(helpers.setErrors).toHaveBeenCalledWith({
      certs: 'All certificate fields must be filled',
    });
  });

  it('validates duplicate names and URLs', () => {
    handleCertificatesSubmit(
      {
        certs: [
          { name: 'Cert1', url: 'http://1', date: '2020-01-01' },
          { name: 'Cert1', url: 'http://2', date: '2020-01-02' },
        ] as any,
      },
      helpers as any,
      jest.fn()
    );

    expect(helpers.setErrors).toHaveBeenCalledWith({
      certs: 'Certificate names must be unique',
    });
  });

  it('calls onSuccess when valid', () => {
    const onSuccess = jest.fn();

    handleCertificatesSubmit(
      {
        certs: [
          { name: 'Cert1', url: 'a', date: '2020-01-01' },
          { name: 'Cert2', url: 'b', date: '2020-02-01' },
        ] as any,
      },
      helpers as any,
      onSuccess
    );

    expect(onSuccess).toHaveBeenCalledWith([
      { name: 'Cert1', url: 'a', date: '2020-01-01' },
      { name: 'Cert2', url: 'b', date: '2020-02-01' },
    ]);
  });
});

// -------------------------------------------------------------
// validateLanguages
// -------------------------------------------------------------
describe('validateLanguages', () => {
  it('detects duplicate languages', () => {
    const result = validateLanguages({
      languages: [
        { language: { id: '1' }, level: 'A1' },
        { language: { id: '1' }, level: 'B1' },
      ],
    } as any);

    expect(result.languages).toBe('Languages must be unique');
  });

  it('detects empty fields', () => {
    const result = validateLanguages({
      languages: [
        { language: { id: '' }, level: 'A1' },
        { language: { id: '2' }, level: '' },
      ],
    } as any);

    expect(result.languages).toBe('All language fields must be filled');
  });

  it('accepts valid languages', () => {
    const result = validateLanguages({
      languages: [
        { language: { id: '1' }, level: 'A1' },
        { language: { id: '2' }, level: 'B1' },
      ],
    } as any);

    expect(result).toEqual({});
  });
});

// -------------------------------------------------------------
// handleExperienceSubmit
// -------------------------------------------------------------
describe('handleExperienceSubmit', () => {
  const helpers = { setErrors: jest.fn() };

  beforeEach(() => helpers.setErrors.mockClear());

  it('requires all fields', () => {
    handleExperienceSubmit(
      {
        experience: [{ companyName: '', startDate: '', details: '' }],
      } as any,
      helpers as any,
      jest.fn()
    );

    expect(helpers.setErrors).toHaveBeenCalledWith({
      experience: 'All fields must be filled.',
    });
  });

  it('requires endDate when not current', () => {
    handleExperienceSubmit(
      {
        experience: [
          {
            companyName: 'A',
            startDate: '2020-01-01',
            details: 'info',
            isCurrent: false,
            endDate: '',
          },
        ],
      } as any,
      helpers as any,
      jest.fn()
    );

    expect(helpers.setErrors).toHaveBeenCalledWith({
      experience: 'End Date is required if the job is not current.',
    });
  });

  it('validates date ranges', () => {
    handleExperienceSubmit(
      {
        experience: [
          {
            companyName: 'A',
            startDate: '2021-01-01',
            endDate: '2020-01-01',
            details: 'info',
            isCurrent: false,
          },
        ],
      } as any,
      helpers as any,
      jest.fn()
    );

    expect(helpers.setErrors).toHaveBeenCalledWith({
      experience: 'Start Date must be earlier than End Date.',
    });
  });

  it('calls onSuccess when valid', () => {
    const onSuccess = jest.fn();

    handleExperienceSubmit(
      {
        experience: [
          {
            companyName: 'A',
            startDate: '2020-01-01',
            endDate: '2021-01-01',
            details: 'info',
            isCurrent: false,
          },
        ],
      } as any,
      helpers as any,
      onSuccess
    );

    expect(onSuccess).toHaveBeenCalled();
  });
});

// -------------------------------------------------------------
// handleEducationSubmit
// -------------------------------------------------------------
describe('handleEducationSubmit', () => {
  const helpers = { setErrors: jest.fn() };

  beforeEach(() => helpers.setErrors.mockClear());

  it('requires all fields except optional endDate', () => {
    handleEducationSubmit(
      {
        education: [
          {
            universityName: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            details: '',
          },
        ],
      } as any,
      helpers as any,
      jest.fn()
    );

    expect(helpers.setErrors).toHaveBeenCalledWith({
      education: 'All required fields must be filled.',
    });
  });

  it('validates endDate > startDate when provided', () => {
    handleEducationSubmit(
      {
        education: [
          {
            universityName: 'A',
            degree: 'B',
            field: 'C',
            startDate: '2021-01-01',
            endDate: '2020-01-01',
            details: 'info',
          },
        ],
      } as any,
      helpers as any,
      jest.fn()
    );

    expect(helpers.setErrors).toHaveBeenCalledWith({
      education: 'Start Date must be earlier than End Date.',
    });
  });

  it('calls onSuccess when valid education', () => {
    const onSuccess = jest.fn();

    handleEducationSubmit(
      {
        education: [
          {
            universityName: 'A',
            degree: 'B',
            field: 'C',
            startDate: '2020-01-01',
            endDate: '2021-01-01',
            details: 'info',
          },
        ],
      } as any,
      helpers as any,
      onSuccess
    );

    expect(onSuccess).toHaveBeenCalled();
  });
});

import {
  validateVacancyForm,
  mapVacancyToFormValues,
  mapQueryToVacancyForm,
  isEmptyValue,
  searchFormValidate,
  submitSearchForm,
} from '@/utils/vacancyValidation'; // ← поправ шлях, якщо інший

// -------------------------------------------------------------
// validateVacancyForm
// -------------------------------------------------------------
describe('validateVacancyForm', () => {
  it('requires title and description', () => {
    const values = {
      title: '',
      description: '',
      salaryMin: '0',
      salaryMax: '0',
      officeLocation: '',
      workFormat: [],
      employmentType: [],
      experienceRequired: '0',
      seniorityLevel: '',
    } as any;

    const errors = validateVacancyForm(values);

    expect(errors.title).toBe('Title is required');
    expect(errors.description).toBe('Description is required');
    expect(errors.officeLocation).toBe('Office location is required');
  });

  it('validates length of title and description', () => {
    const values = {
      title: 'short',
      description: 'too short',
      salaryMin: '1',
      salaryMax: '2',
      officeLocation: 'Kyiv',
      workFormat: ['remote'],
      employmentType: ['full-time'],
      experienceRequired: '1',
      seniorityLevel: 'junior',
    } as any;

    const errors = validateVacancyForm(values);

    expect(errors.title).toMatch(/10 characters/);
    expect(errors.description).toMatch(/50 characters/);
  });

  it('validates salaryMin and salaryMax', () => {
    const values = {
      title: 'Valid title',
      description: 'Valid description that is long enough to pass the rule',
      salaryMin: '-1',
      salaryMax: '-5',
      officeLocation: 'Lviv',
      workFormat: ['office'],
      employmentType: ['contract'],
      experienceRequired: '5',
      seniorityLevel: 'middle',
    } as any;

    const errors = validateVacancyForm(values);

    expect(errors.salaryMin).toBe('Salary must be positive');
    expect(errors.salaryMax).toBe(
      'Max salary should be greater than min salary'
    );
  });

  it('validates max salary > min salary', () => {
    const values = {
      title: 'Valid title',
      description: 'Valid description suitable for requirements of this form.',
      salaryMin: '5000',
      salaryMax: '3000',
      officeLocation: 'Odessa',
      workFormat: ['remote'],
      employmentType: ['full-time'],
      experienceRequired: '2',
      seniorityLevel: 'senior',
    } as any;

    const errors = validateVacancyForm(values);

    expect(errors.salaryMax).toBe(
      'Max salary should be greater than min salary'
    );
  });

  it('validates experienceRequired', () => {
    const badValues = [
      { exp: '0', error: 'Experience must be positive' },
      { exp: '-2', error: 'Experience must be positive' },
      { exp: '100', error: 'Experience must not be greater than 50' },
    ];

    for (const item of badValues) {
      const values = {
        title: 'Valid title here',
        description: 'Very long description that meets minimum 50 chars.',
        salaryMin: '10',
        salaryMax: '20',
        officeLocation: 'Kyiv',
        workFormat: ['remote'],
        employmentType: ['full-time'],
        experienceRequired: item.exp,
        seniorityLevel: 'mid',
      } as any;

      const errors = validateVacancyForm(values);
      expect(errors.experienceRequired).toBe(item.error);
    }
  });

  it('validates seniority level', () => {
    const values = {
      title: 'Valid title here!',
      description: 'Long enough description used for validation check.',
      salaryMin: '10',
      salaryMax: '20',
      officeLocation: 'Kyiv',
      workFormat: ['office'],
      employmentType: ['full-time'],
      experienceRequired: '3',
      seniorityLevel: '',
    } as any;

    const errors = validateVacancyForm(values);
    expect(errors.seniorityLevel).toBe('Select a seniority level');
  });
});

// -------------------------------------------------------------
// mapVacancyToFormValues
// -------------------------------------------------------------
describe('mapVacancyToFormValues', () => {
  it('maps vacancy data to form values', () => {
    const data = {
      id: 'v1',
      isActive: true,
      title: 'Dev',
      description: 'Some description here',
      salaryMin: 1000,
      salaryMax: 2000,
      officeLocation: 'Kyiv',
      experienceRequired: 3,
      workFormat: ['remote'],
      employmentType: ['full-time'],
      seniorityLevel: 'mid',
      requiredLanguages: [
        { language: { id: '1', name: 'English' }, level: 'B2' },
      ],
      requiredSkills: [{ skill: { id: '10', name: 'React' } }],
    } as any;

    const result = mapVacancyToFormValues(data);

    expect(result.salaryMin).toBe('1000');
    expect(result.salaryMax).toBe('2000');
    expect(result.languages[0]).toEqual({
      languageId: '1',
      level: 'B2',
      language: { id: '1', name: 'English' },
    });
    expect(result.skills[0]).toEqual({
      skill: { id: '10', name: 'React' },
    });
  });
});

// -------------------------------------------------------------
// mapQueryToVacancyForm
// -------------------------------------------------------------
describe('mapQueryToVacancyForm', () => {
  it('maps query params correctly', () => {
    const result = mapQueryToVacancyForm({
      title: 'Developer',
      salaryMin: '1000',
      experienceRequired: '3',
      workFormats: 'remote,office',
      employmentTypes: 'full-time,contract',
      seniorityLevel: 'mid',
      requiredLanguages: JSON.stringify([{ languageId: '1', level: 'B2' }]),
      orderBy: JSON.stringify({ field: 'createdAt', direction: 'desc' }),
      page: '2',
      requiredSkillIds: '10,11',
    });

    expect(result).toEqual({
      title: 'Developer',
      salaryMin: 1000,
      experienceRequired: 3,
      workFormats: ['remote', 'office'],
      employmentTypes: ['full-time', 'contract'],
      seniorityLevel: 'mid',
      requiredLanguages: [{ languageId: '1', level: 'B2' }],
      orderBy: { field: 'createdAt', direction: 'desc' },
      page: 2,
      requiredSkillIds: ['10', '11'],
    });
  });

  it('returns empty object when query empty', () => {
    expect(mapQueryToVacancyForm({})).toEqual({});
  });
});

// -------------------------------------------------------------
// isEmptyValue
// -------------------------------------------------------------
describe('isEmptyValue', () => {
  it('detects empty values', () => {
    expect(isEmptyValue(undefined)).toBe(true);
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue('')).toBe(true);
    expect(isEmptyValue([])).toBe(true);
  });

  it('detects non-empty values', () => {
    expect(isEmptyValue('abc')).toBe(false);
    expect(isEmptyValue([1])).toBe(false);
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue({})).toBe(false);
  });
});

// -------------------------------------------------------------
// searchFormValidate
// -------------------------------------------------------------
describe('searchFormValidate', () => {
  it('validates title length', () => {
    const result = searchFormValidate({
      title: 'short',
      requiredLanguages: [],
    } as any);

    expect(result.title).toBe('Title must be at least 10 characters');
  });

  it('validates requiredLanguages structure', () => {
    const result = searchFormValidate({
      title: 'Valid title',
      requiredLanguages: [{ language: { id: '' }, level: '' }],
    } as any);

    expect(result.requiredLanguages).toBe('Please select a language');
  });

  it('returns no errors for valid data', () => {
    const result = searchFormValidate({
      title: 'Valid vacancy title',
      requiredLanguages: [{ language: { id: '1' }, level: 'B2' }],
    } as any);

    expect(result).toEqual({});
  });
});

// -------------------------------------------------------------
// submitSearchForm
// -------------------------------------------------------------
describe('submitSearchForm', () => {
  it('cleans empty fields and transforms language & skill objects', () => {
    const onSubmit = jest.fn();

    const values: any = {
      title: '',
      page: 0,
      orderBy: {},
      requiredLanguages: [
        { language: { id: '1' }, level: 'B2' },
        { languageId: '2', level: 'A1' },
      ],
      requiredSkillIds: [{ skill: { id: 5 } }, { skill: { id: 6 } }],
      newSkill: 'should be removed',
    };

    submitSearchForm(values, onSubmit);

    expect(onSubmit).toHaveBeenCalledWith({
      requiredLanguages: [
        { languageId: '1', level: 'B2' },
        { languageId: '2', level: 'A1' },
      ],
      requiredSkillIds: ['5', '6'],
    });
  });

  it('keeps valid fields', () => {
    const onSubmit = jest.fn();

    const values: any = {
      title: 'Developer',
      page: 2,
      requiredLanguages: [],
      requiredSkillIds: [],
    };

    submitSearchForm(values, onSubmit);

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Developer',
      page: 2,
    });
  });
});

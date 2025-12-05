import {
  mapQueryToJobSeekerForm,
  validateLanguages,
  submitJobSeekersSearchForm,
} from '@/utils/jobSeekerSearchValidation'; // поправ шлях, якщо у тебе інший

describe('mapQueryToJobSeekerForm', () => {
  it('parses languages and orderBy JSON', () => {
    const result = mapQueryToJobSeekerForm({
      languages: JSON.stringify([{ languageId: 1, level: 'B1' }]),
      orderBy: JSON.stringify({ field: 'createdAt', direction: 'asc' }),
      page: '3',
    });

    expect(result).toEqual({
      languages: [{ languageId: 1, level: 'B1' }],
      orderBy: { field: 'createdAt', direction: 'asc' },
      page: 3,
    });
  });

  it('splits skillIds by comma', () => {
    const result = mapQueryToJobSeekerForm({
      skillIds: '1,2,3',
    });

    expect(result).toEqual({
      skillIds: ['1', '2', '3'],
    });
  });

  it('returns empty object when query empty', () => {
    const result = mapQueryToJobSeekerForm({});
    expect(result).toEqual({});
  });
});

describe('validateLanguages', () => {
  it('returns error when a language has missing id or level', () => {
    const values: any = {
      languages: [
        { language: { id: 1 }, level: '' },
        { language: { id: null }, level: 'A1' },
      ],
    };

    const errors = validateLanguages(values);
    expect(errors).toEqual({
      languages: 'Please select a language',
    });
  });

  it('returns no error when all languages valid', () => {
    const values: any = {
      languages: [
        { language: { id: 1 }, level: 'A2' },
        { language: { id: 2 }, level: 'B1' },
      ],
    };

    const errors = validateLanguages(values);
    expect(errors).toEqual({});
  });
});

describe('submitJobSeekersSearchForm', () => {
  it('filters empty values and transforms languages and skillIds', () => {
    const onSubmit = jest.fn();

    const values: any = {
      newSkill: 'ignore_me', // should be removed
      page: 0, // removed because number === 0
      orderBy: {}, // removed because empty object
      languages: [
        {
          language: { id: 10 },
          level: 'B2',
        },
        {
          languageId: 20,
          level: 'A1',
        },
      ],
      skillIds: [{ skill: { id: 5 } }, { skill: { id: 7 } }],
    };

    submitJobSeekersSearchForm(values, onSubmit);

    expect(onSubmit).toHaveBeenCalledTimes(1);

    expect(onSubmit).toHaveBeenCalledWith({
      languages: [
        { languageId: 10, level: 'B2' },
        { languageId: 20, level: 'A1' },
      ],
      skillIds: ['5', '7'],
    });
  });

  it('keeps non-empty string and non-zero numbers', () => {
    const onSubmit = jest.fn();

    const values: any = {
      name: 'John',
      page: 2,
      languages: [],
      skillIds: [],
    };

    submitJobSeekersSearchForm(values, onSubmit);

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John',
      page: 2,
    });
  });

  it('removes empty arrays, empty strings, nulls and undefined', () => {
    const onSubmit = jest.fn();

    const values: any = {
      name: '',
      languages: [],
      skillIds: [],
      orderBy: null,
      page: undefined,
    };

    submitJobSeekersSearchForm(values, onSubmit);

    expect(onSubmit).toHaveBeenCalledWith({});
  });
});

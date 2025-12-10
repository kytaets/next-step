import { addMissingSkills } from '@/utils/skillsConvertData';

describe('addMissingSkills', () => {
  it('returns original skills when all exist in skillsList', async () => {
    const values = {
      skills: [{ skill: { name: 'React' } }, { skill: { name: 'Node' } }],
      newSkill: '',
    };

    const skillsList = [{ name: 'React' }, { name: 'Node' }];

    const addNewSkill = jest.fn();
    const setRequestError = jest.fn();

    const result = await addMissingSkills(
      values,
      skillsList,
      addNewSkill,
      setRequestError
    );

    expect(result).toEqual(values.skills);
    expect(addNewSkill).not.toHaveBeenCalled();
    expect(setRequestError).not.toHaveBeenCalled();
  });

  it('adds missing skill and returns updated list when addNewSkill succeeds', async () => {
    const values = {
      skills: [
        { skill: { name: 'React' } },
        { skill: { name: 'UnknownSkill' } },
      ],
      newSkill: '',
    };

    const skillsList = [{ name: 'React' }];

    const addNewSkill = jest.fn().mockResolvedValue({
      status: 'ok',
      data: { name: 'UnknownSkill', id: 10 },
    });

    const setRequestError = jest.fn();

    const result = await addMissingSkills(
      values,
      skillsList,
      addNewSkill,
      setRequestError
    );

    expect(addNewSkill).toHaveBeenCalledWith({ name: 'UnknownSkill' });

    expect(result).toEqual([
      { skill: { name: 'React' } },
      { skill: { name: 'UnknownSkill', id: 10 } },
    ]);

    expect(values.skills[1]).toEqual({
      skill: { name: 'UnknownSkill', id: 10 },
    });

    expect(setRequestError).not.toHaveBeenCalled();
  });

  it('calls setRequestError when addNewSkill returns error', async () => {
    const values = {
      skills: [{ skill: { name: 'UnknownSkill' } }],
      newSkill: '',
    };

    const skillsList = [];

    const addNewSkill = jest.fn().mockResolvedValue({
      status: 'error',
      error: 'Failed to add',
    });

    const setRequestError = jest.fn();

    await addMissingSkills(values, skillsList, addNewSkill, setRequestError);

    expect(addNewSkill).toHaveBeenCalledWith({ name: 'UnknownSkill' });
    expect(setRequestError).toHaveBeenCalledWith('Failed to add');
  });

  it('handles multiple missing skills but returns after the first successful addition', async () => {
    const values = {
      skills: [{ skill: { name: 'S1' } }, { skill: { name: 'S2' } }],
      newSkill: '',
    };

    const skillsList = [];

    const addNewSkill = jest
      .fn()
      .mockResolvedValueOnce({
        status: 'ok',
        data: { name: 'S1', id: 1 },
      })
      .mockResolvedValueOnce({
        status: 'ok',
        data: { name: 'S2', id: 2 },
      });

    const setRequestError = jest.fn();

    const result = await addMissingSkills(
      values,
      skillsList,
      addNewSkill,
      setRequestError
    );

    expect(result).toEqual([
      { skill: { name: 'S1', id: 1 } },
      { skill: { name: 'S2' } },
    ]);

    expect(addNewSkill).toHaveBeenCalledTimes(1);
    expect(setRequestError).not.toHaveBeenCalled();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VacancyForm from '@/components/VacanciesItems/VacancyForm/VacancyForm';
import React from 'react';
import '@testing-library/jest-dom';

// ======================================================
// GLOBAL MOCKS
// ======================================================

// router
const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// cookies
jest.mock('js-cookie', () => ({
  get: jest.fn(() => 'company123'),
}));

// motion
jest.mock('framer-motion', () => {
  const React = require('react');
  const strip = (props) => {
    const bad = [
      'whileHover',
      'initial',
      'animate',
      'exit',
      'transition',
      'variants',
      'drag',
      'dragConstraints',
    ];
    const clean = { ...props };
    bad.forEach((p) => delete clean[p]);
    return clean;
  };
  return {
    motion: new Proxy(
      {},
      {
        get: () =>
          React.forwardRef(({ children, ...rest }, ref) => (
            <div ref={ref} {...strip(rest)}>
              {children}
            </div>
          )),
      }
    ),
  };
});

// react-query mutations
jest.mock('@tanstack/react-query', () => ({
  useMutation: ({ mutationFn, onSuccess }) => ({
    mutate: (vars) => {
      const res = mutationFn(vars);
      onSuccess && onSuccess(res, vars);
    },
    mutateAsync: (vars) => {
      const res = mutationFn(vars);
      onSuccess && onSuccess(res, vars);
      return res;
    },
    isPending: false,
  }),
  useQuery: () => ({
    data: [{ id: '1', name: 'React' }],
    error: null,
  }),
}));

// vacancy service mocks
const createVacancyMock = jest.fn();
const editVacancyMock = jest.fn();
const updateLangMock = jest.fn();
const updateSkillsMock = jest.fn();

jest.mock('@/services/vacanciesService', () => ({
  createVacancy: (...args) => createVacancyMock(...args),
  editVacancy: (...args) => editVacancyMock(...args),
  updateVacancyLanguages: (...args) => updateLangMock(...args),
  updateVacancySkills: (...args) => updateSkillsMock(...args),
}));

// job seeker service mocks
const getSkillsMock = jest.fn();
const createNewSkillMock = jest.fn();

jest.mock('@/services/jobseekerService', () => ({
  getSkills: (...args) => getSkillsMock(...args),
  createNewSkill: (...args) => createNewSkillMock(...args),
}));

// validation
jest.mock('@/utils/vacancyValidation', () => ({
  validateVacancyForm: () => ({}),
}));

// addMissingSkills
const addMissingSkillsMock = jest.fn(async () => [
  { skill: { id: '111' }, level: 'B2' },
]);
jest.mock('@/utils/skillsConvertData', () => ({
  addMissingSkills: (...args) => addMissingSkillsMock(...args),
}));

// ======================================================
// CHILD COMPONENTS
// ======================================================

// MainInfoFields
jest.mock('@/components/VacanciesItems/VacancyForm/MainInfoFields', () => {
  return () => (
    <div data-testid="main-info-fields">
      <input name="title" defaultValue="Frontend" />
      <input name="description" defaultValue="Cool job" />
    </div>
  );
});

// SkillsFields
jest.mock('@/components/VacanciesItems/VacancyForm/SkillsFields', () => {
  const { useFormikContext } = require('formik');
  const React = require('react');

  return () => {
    const { setFieldValue } = useFormikContext();
    React.useEffect(() => {
      setFieldValue('skills', [{ skill: { id: '100' }, level: 'ADVANCED' }]);
    }, [setFieldValue]);

    return <div data-testid="skills-fields">Mock Skills</div>;
  };
});

// LanguagesFields
jest.mock('@/components/VacanciesItems/VacancyForm/LanguagesFields', () => {
  const { useFormikContext } = require('formik');
  const React = require('react');

  return () => {
    const { setFieldValue } = useFormikContext();
    React.useEffect(() => {
      setFieldValue('languages', [{ language: { id: 'EN' }, level: 'B2' }]);
    }, [setFieldValue]);

    return <div data-testid="languages-fields">Mock Lang</div>;
  };
});

// ======================================================
// TEST
// ======================================================

describe('VacancyForm FULL INTEGRATION', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getSkillsMock.mockResolvedValue([
      { id: '100', name: 'React' },
      { id: '200', name: 'TS' },
    ]);

    createVacancyMock.mockReturnValue({
      status: 'success',
      data: { id: 'VAC123' },
    });

    updateLangMock.mockReturnValue({ status: 'success' });
    updateSkillsMock.mockReturnValue({ status: 'success' });

    createNewSkillMock.mockReturnValue({
      status: 'success',
      data: { id: 'NEW1' },
    });
  });

  test('submits fully, updates skills & languages, redirects', async () => {
    render(<VacancyForm type="CREATE" />);

    const submit = screen.getByRole('button', { name: /Create Vacancy/i });
    fireEvent.click(submit);

    await waitFor(() => {
      expect(createVacancyMock).toHaveBeenCalledTimes(1);
    });

    const payload = createVacancyMock.mock.calls[0][0];

    // Languages
    expect(payload.languages).toEqual([{ languageId: 'EN', level: 'B2' }]);

    // Skills (from addMissingSkillsMock)
    expect(payload.skills).toEqual([{ skill: { id: '111' }, level: 'B2' }]);

    expect(updateLangMock).toHaveBeenCalledWith({
      id: 'VAC123',
      data: [{ languageId: 'EN', level: 'B2' }],
    });

    expect(updateSkillsMock).toHaveBeenCalled();

    expect(pushMock).toHaveBeenCalledWith(
      '/my-profile/recruiter/company/vacancies?companyId=company123'
    );
  });
});

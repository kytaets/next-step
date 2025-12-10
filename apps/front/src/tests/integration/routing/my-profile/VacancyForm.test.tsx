import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import VacancyForm from '@/components/VacanciesItems/VacancyForm/VacancyForm';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  set: jest.fn(),
}));

jest.mock('@/utils/vacancyValidation', () => ({
  validateVacancyForm: jest.fn(() => ({})),
}));

jest.mock('@/services/jobseekerService', () => ({
  getSkills: jest.fn(() => []),
  createNewSkill: jest.fn(),
}));

jest.mock('@/utils/skillsConvertData', () => ({
  addMissingSkills: jest.fn(() => []),
}));

jest.mock(
  '@/components/VacanciesItems/VacancyForm/MainInfoFields',
  () => () => <div>MainInfo</div>
);

jest.mock('@/components/VacanciesItems/VacancyForm/SkillsFields', () => () => (
  <div>Skills</div>
));

jest.mock(
  '@/components/VacanciesItems/VacancyForm/LanguagesFields',
  () => () => <div>Languages</div>
);

describe('VacancyForm routing behavior', () => {
  beforeEach(() => {
    (Cookies.get as jest.Mock).mockReturnValue('ABC123');
  });

  it('redirects after successful CREATE', async () => {
    const pushMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    let capturedOnSuccess: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      if (opts.mutationFn.name === 'createVacancy') {
        capturedOnSuccess = opts.onSuccess;
        return { mutate: jest.fn(), isPending: false };
      }
      return { mutate: jest.fn(), isPending: false };
    });

    render(<VacancyForm type="CREATE" />);

    capturedOnSuccess(
      { status: 'success', data: { id: 'VAC123' } },
      { languages: [], skills: [] }
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        '/my-profile/recruiter/company/vacancies?companyId=ABC123'
      );
    });
  });

  it('redirects after successful EDIT', async () => {
    const pushMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    let capturedOnSuccess: any;

    (useMutation as jest.Mock).mockImplementation((opts: any) => {
      if (opts.mutationFn.name === 'editVacancy') {
        capturedOnSuccess = opts.onSuccess;
        return { mutate: jest.fn(), isPending: false };
      }
      return { mutate: jest.fn(), isPending: false };
    });

    const data = { id: 'VAC555' };

    render(<VacancyForm type="EDIT" data={data as any} />);

    capturedOnSuccess(
      { status: 'success', data },
      { data: { languages: [], skills: [] } }
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/vacancies/VAC555');
    });
  });
});

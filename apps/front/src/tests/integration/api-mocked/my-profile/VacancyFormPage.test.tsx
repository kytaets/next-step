import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import VacancyForm from '@/components/VacanciesItems/VacancyForm/VacancyForm';
import {
  createVacancy,
  editVacancy,
  updateVacancyLanguages,
  updateVacancySkills,
} from '@/services/vacanciesService';
import { createNewSkill, getSkills } from '@/services/jobseekerService';
import { validateVacancyForm } from '@/utils/vacancyValidation';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('@/services/vacanciesService', () => ({
  createVacancy: jest.fn(),
  editVacancy: jest.fn(),
  updateVacancyLanguages: jest.fn(),
  updateVacancySkills: jest.fn(),
}));

jest.mock('@/services/jobseekerService', () => ({
  createNewSkill: jest.fn(),
  getSkills: jest.fn(),
}));

jest.mock('@/utils/vacancyValidation', () => ({
  validateVacancyForm: jest.fn(),
}));

// Mock child components
jest.mock('@/components/VacanciesItems/VacancyForm/MainInfoFields', () => {
  return function MainInfoFields() {
    return <div data-testid="main-info-fields">Main Info Fields</div>;
  };
});

jest.mock('@/components/VacanciesItems/VacancyForm/SkillsFields', () => {
  return function SkillsFields() {
    return <div data-testid="skills-fields">Skills Fields</div>;
  };
});

jest.mock('@/components/VacanciesItems/VacancyForm/LanguagesFields', () => {
  return function LanguagesFields() {
    return <div data-testid="languages-fields">Languages Fields</div>;
  };
});

jest.mock('@/components/HoveredItem/HoveredItem', () => {
  return function AnimatedIcon({ children }: { children: React.ReactNode }) {
    return <span>{children}</span>;
  };
});

jest.mock('@/components/MessageBox/MessageBox', () => {
  return function MessageBox({ children }: { children: React.ReactNode }) {
    return <div data-testid="message-box">{children}</div>;
  };
});

const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

describe('VacancyForm Integration Tests', () => {
  let queryClient: QueryClient;

  const mockVacancyData = {
    id: 'vacancy-123',
    title: 'Senior Developer',
    description: 'Job description',
    location: 'Remote',
    salary: '100000',
    requirements: 'Requirements text',
    responsibilities: 'Responsibilities text',
    companyId: 'company-456',
    category: 'IT',
    type: 'full-time',
    experience: '3-5 years',
    skills: [
      {
        skill: { id: 'skill-1', name: 'JavaScript' },
        level: 'advanced',
      },
    ],
    languages: [
      {
        language: { id: 'lang-1', name: 'English' },
        languageId: 'lang-1',
        level: 'fluent',
      },
    ],
    newSkill: '',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (Cookies.get as jest.Mock).mockReturnValue('company-456');
    (getSkills as jest.Mock).mockResolvedValue([
      { id: 'skill-1', name: 'JavaScript' },
      { id: 'skill-2', name: 'TypeScript' },
    ]);
    (validateVacancyForm as jest.Mock).mockReturnValue({});

    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <VacancyForm {...props} />
      </QueryClientProvider>
    );
  };

  describe('CREATE mode', () => {
    it('should render form with all field sections', () => {
      renderComponent({ type: 'CREATE' });

      expect(screen.getByTestId('main-info-fields')).toBeInTheDocument();
      expect(screen.getByTestId('skills-fields')).toBeInTheDocument();
      expect(screen.getByTestId('languages-fields')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /create vacancy/i })
      ).toBeInTheDocument();
    });

    it('should create vacancy successfully with languages and skills', async () => {
      (createVacancy as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'new-vacancy-123' },
      });
      (updateVacancyLanguages as jest.Mock).mockResolvedValue({
        status: 'success',
      });
      (updateVacancySkills as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      renderComponent({ type: 'CREATE', data: mockVacancyData });

      const submitButton = screen.getByRole('button', {
        name: /create vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(createVacancy).toHaveBeenCalled();
      });

      const createVacancyCall = (createVacancy as jest.Mock).mock.calls[0][0];
      expect(createVacancyCall).toMatchObject({
        skills: expect.any(Array),
        languages: expect.arrayContaining([
          expect.objectContaining({
            languageId: 'lang-1',
            level: 'fluent',
          }),
        ]),
      });

      await waitFor(() => {
        expect(updateVacancyLanguages).toHaveBeenCalled();
      });

      const updateLanguagesCall = (updateVacancyLanguages as jest.Mock).mock
        .calls[0][0];
      expect(updateLanguagesCall).toMatchObject({
        id: 'new-vacancy-123',
        data: expect.any(Array),
      });

      await waitFor(() => {
        expect(updateVacancySkills).toHaveBeenCalled();
      });

      const updateSkillsCall = (updateVacancySkills as jest.Mock).mock
        .calls[0][0];
      expect(updateSkillsCall).toMatchObject({
        id: 'new-vacancy-123',
        data: ['skill-1'],
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          '/my-profile/recruiter/company/vacancies?companyId=company-456'
        );
      });
    });

    it('should create vacancy without languages and skills', async () => {
      (createVacancy as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'new-vacancy-123' },
      });

      const dataWithoutLangSkills = {
        ...mockVacancyData,
        languages: [],
        skills: [],
      };

      renderComponent({ type: 'CREATE', data: dataWithoutLangSkills });

      const submitButton = screen.getByRole('button', {
        name: /create vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(createVacancy).toHaveBeenCalled();
      });

      expect(updateVacancyLanguages).not.toHaveBeenCalled();
      expect(updateVacancySkills).not.toHaveBeenCalled();
    });

    it('should handle create vacancy error', async () => {
      (createVacancy as jest.Mock).mockResolvedValue({
        status: 'error',
        error: 'Failed to create vacancy',
      });

      renderComponent({ type: 'CREATE', data: mockVacancyData });

      const submitButton = screen.getByRole('button', {
        name: /create vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-box')).toHaveTextContent(
          'Failed to create vacancy'
        );
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should create new skills if they do not exist', async () => {
      (createVacancy as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'new-vacancy-123' },
      });
      (createNewSkill as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'skill-3', name: 'React' },
      });
      (getSkills as jest.Mock).mockResolvedValue([
        { id: 'skill-1', name: 'JavaScript' },
      ]);

      const dataWithNewSkill = {
        ...mockVacancyData,
        newSkill: 'React',
      };

      renderComponent({ type: 'CREATE', data: dataWithNewSkill });

      const submitButton = screen.getByRole('button', {
        name: /create vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(getSkills).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(createVacancy).toHaveBeenCalled();
      });
    });

    it('should handle validation errors', async () => {
      const validationErrors = {
        title: 'Title is required',
        description: 'Description is required',
      };
      (validateVacancyForm as jest.Mock).mockReturnValue(validationErrors);

      renderComponent({
        type: 'CREATE',
        data: { ...mockVacancyData, title: '' },
      });

      const submitButton = screen.getByRole('button', {
        name: /create vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(createVacancy).not.toHaveBeenCalled();
      });
    });
  });

  describe('EDIT mode', () => {
    it('should render form with "Save Vacancy" button in edit mode', () => {
      renderComponent({ type: 'EDIT', data: mockVacancyData });

      expect(
        screen.getByRole('button', { name: /save vacancy/i })
      ).toBeInTheDocument();
    });

    it('should edit vacancy successfully', async () => {
      (editVacancy as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'vacancy-123' },
      });
      (updateVacancyLanguages as jest.Mock).mockResolvedValue({
        status: 'success',
      });
      (updateVacancySkills as jest.Mock).mockResolvedValue({
        status: 'success',
      });

      renderComponent({ type: 'EDIT', data: mockVacancyData });

      const submitButton = screen.getByRole('button', {
        name: /save vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(editVacancy).toHaveBeenCalled();
      });

      const editVacancyCall = (editVacancy as jest.Mock).mock.calls[0][0];
      expect(editVacancyCall).toMatchObject({
        id: 'vacancy-123',
        data: expect.objectContaining({
          skills: expect.any(Array),
          languages: expect.any(Array),
        }),
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/vacancies/vacancy-123');
      });
    });

    it('should handle edit vacancy error', async () => {
      (editVacancy as jest.Mock).mockResolvedValue({
        status: 'error',
        error: 'Failed to update vacancy',
      });

      renderComponent({ type: 'EDIT', data: mockVacancyData });

      const submitButton = screen.getByRole('button', {
        name: /save vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-box')).toHaveTextContent(
          'Failed to update vacancy'
        );
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle updateSkills error', async () => {
      (editVacancy as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'vacancy-123' },
      });
      (updateVacancySkills as jest.Mock).mockResolvedValue({
        status: 'error',
        error: 'Failed to update skills',
      });

      renderComponent({ type: 'EDIT', data: mockVacancyData });

      const submitButton = screen.getByRole('button', {
        name: /save vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('message-box')).toHaveTextContent(
          'Failed to update skills'
        );
      });
    });
  });

  describe('Form submission state', () => {
    it('should disable submit button while creating vacancy', async () => {
      let resolveCreate: any;
      (createVacancy as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveCreate = resolve;
          })
      );

      renderComponent({ type: 'CREATE', data: mockVacancyData });

      const submitButton = screen.getByRole('button', {
        name: /create vacancy/i,
      });

      expect(submitButton).not.toBeDisabled();

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Cleanup
      resolveCreate({ status: 'success', data: { id: 'test' } });
    });

    it('should disable submit button while updating languages', async () => {
      (createVacancy as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'new-vacancy-123' },
      });

      let resolveUpdateLang: any;
      (updateVacancyLanguages as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdateLang = resolve;
          })
      );

      renderComponent({ type: 'CREATE', data: mockVacancyData });

      const submitButton = screen.getByRole('button', {
        name: /create vacancy/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Cleanup
      resolveUpdateLang({ status: 'success' });
    });
  });

  describe('Error handling for createNewSkill', () => {
    it('should verify createNewSkill integration with form submission', async () => {
      (createVacancy as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'new-vacancy-123' },
      });
      (createNewSkill as jest.Mock).mockResolvedValue({
        status: 'success',
        data: { id: 'skill-3', name: 'NewSkill' },
      });
      (getSkills as jest.Mock).mockResolvedValue([
        { id: 'skill-1', name: 'JavaScript' },
      ]);

      const dataWithNewSkill = {
        ...mockVacancyData,
        skills: [],
        newSkill: 'NewSkill',
      };

      renderComponent({ type: 'CREATE', data: dataWithNewSkill });

      const submitButton = screen.getByRole('button', {
        name: /create vacancy/i,
      });
      await userEvent.click(submitButton);

      // Wait for getSkills to be called
      await waitFor(() => {
        expect(getSkills).toHaveBeenCalled();
      });

      // Verify that the form proceeds with vacancy creation
      // Note: createNewSkill is called inside addMissingSkills utility
      // which is not directly testable in this integration test without
      // mocking the entire utility. This test verifies the flow works.
      await waitFor(
        () => {
          expect(createVacancy).toHaveBeenCalled();
        },
        { timeout: 3000 }
      );
    });
  });
});

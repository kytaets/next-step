import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import VacancyPage from '@/app/vacancies/[vacancySlug]/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('@/services/vacanciesService', () => ({
  deleteVacancy: jest.fn(),
  getVacancyById: jest.fn(),
}));

jest.mock('@/components/ApplicationItems/ApplyBtn', () => () => null);
jest.mock('@/components/VacanciesItems/VacancyPage/SideBox', () => () => null);
jest.mock('@/components/HoveredItem/HoveredItem', () => ({ children }: any) => (
  <div>{children}</div>
));

describe('VacancyPage routing', () => {
  it('redirects after successful vacancy deletion', async () => {
    const pushMock = jest.fn();
    const mutateMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useParams as jest.Mock).mockReturnValue({ vacancySlug: '123' });

    (Cookies.get as jest.Mock).mockReturnValue('42');

    (useQuery as jest.Mock).mockReturnValue({
      data: {
        id: '123',
        title: 'Frontend Dev',
        description: '...',
        company: { id: '42', name: 'TestCorp', logoUrl: '' },
        requiredSkills: [],
        requiredLanguages: [],
        experienceRequired: 3,
        createdAt: '2023-10-10',
      },
      isPending: false,
      isError: false,
    });

    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => ({
      mutate: (id: string) =>
        mutateMock(id) || onSuccess({ status: 'success' }),
    }));

    const { getByText } = render(<VacancyPage />);

    fireEvent.click(getByText('Delete vacancy'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        '/my-profile/recruiter/company/vacancies?companyId=42'
      );
    });
  });
});

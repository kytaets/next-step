import { render } from '@testing-library/react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import EditVacancy from '@/app/my-profile/recruiter/company/vacancies/edit-vacancy/[editVacancyId]/page';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/services/vacanciesService', () => ({
  getVacancyById: jest.fn(),
}));

jest.mock('@/components/VacanciesItems/VacancyForm/VacancyForm', () => () => (
  <div>MockVacancyForm</div>
));

describe('EditVacancy routing behavior', () => {
  it('calls useQuery with vacancyId from route params', () => {
    (useParams as jest.Mock).mockReturnValue({
      editVacancyId: '55',
    });

    const queryMock = useQuery as jest.Mock;
    queryMock.mockReturnValue({
      data: null,
      isError: false,
      error: null,
    });

    render(<EditVacancy />);

    expect(queryMock).toHaveBeenCalledWith({
      queryKey: ['vacancy', '55'],
      queryFn: expect.any(Function),
      staleTime: 0,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
    });
  });

  it('renders error message if query fails', () => {
    (useParams as jest.Mock).mockReturnValue({
      editVacancyId: '55',
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isError: true,
      error: { message: 'Not found' },
    });

    const { getByText } = render(<EditVacancy />);

    expect(getByText(/Error loading profile/i)).toBeInTheDocument();
    expect(getByText(/Not found/i)).toBeInTheDocument();
  });
});

import { render } from '@testing-library/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getVacancyApplications } from '@/services/application';

import VacancyApplicationsPage from '@/app/my-profile/recruiter/company/applications/[vacancyApplicationSlug]/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/services/application', () => ({
  getVacancyApplications: jest.fn(),
}));

jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => (
  <button onClick={() => props.onSubmit({ status: 'SENT', page: 2 })}>
    MockSearchBar
  </button>
));

jest.mock('@/components/ApplicationItems/VacancyApplicationItem', () => () => (
  <div>MockApplicationItem</div>
));

describe('VacancyApplicationsPage routing behavior', () => {
  it('calls getVacancyApplications with vacancyId from params', () => {
    (useParams as jest.Mock).mockReturnValue({
      vacancyApplicationSlug: '99',
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () => new Map().entries(),
    });

    (useQuery as jest.Mock).mockImplementation(({ queryFn }) => {
      queryFn();
      return {
        data: { data: [] },
        isError: false,
        error: null,
      };
    });

    render(<VacancyApplicationsPage />);

    expect(getVacancyApplications).toHaveBeenCalledWith('99');
  });

  it('pushes correct query params when SearchBar submits', () => {
    const pushMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useParams as jest.Mock).mockReturnValue({
      vacancyApplicationSlug: '10',
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () => new Map().entries(),
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: { data: [] },
      isError: false,
      error: null,
    });

    const { getByText } = render(<VacancyApplicationsPage />);

    getByText('MockSearchBar').click();

    expect(pushMock).toHaveBeenCalledWith('?status=SENT&page=2');
  });

  it('renders error message when query fails', () => {
    (useParams as jest.Mock).mockReturnValue({
      vacancyApplicationSlug: '55',
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () => new Map().entries(),
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isError: true,
      error: { message: 'Something went wrong' },
    });

    const { getByText } = render(<VacancyApplicationsPage />);

    expect(getByText(/Error loading companies/i)).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import CompaniesPage from '@/app/companies/page';
import router from 'next-router-mock';
import { useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: jest.fn(),
}));

jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => (
  <button
    data-testid="submit-search"
    onClick={() => props.onSubmit({ name: 'ACME', page: 2 })}
  >
    SearchMock
  </button>
));

jest.mock('js-cookie', () => ({
  get: jest.fn(() => 'JOB_SEEKER'),
}));

jest.mock(
  '@/components/CompaniesSearchItems/CompanyItem',
  () => (props: any) => <div data-testid="company-item">{props.data.name}</div>
);

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: { data: [{ id: '1', name: 'TestCo' }] },
    isLoading: false,
    isError: false,
  }),
}));

describe('CompaniesPage routing behavior', () => {
  beforeEach(() => {
    router.setCurrentUrl('/companies');
  });

  test('applies initial search params from URL', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () => [
        ['name', 'Google'],
        ['page', '3'],
      ],
    });

    render(<CompaniesPage />);

    expect(screen.getByText('Search for top-tier jobs')).toBeInTheDocument();

    expect(screen.getByTestId('submit-search')).toBeInTheDocument();
  });

  test('router.push is called when SearchBar submits new query', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () => [],
    });

    render(<CompaniesPage />);

    fireEvent.click(screen.getByTestId('submit-search'));

    expect(router).toMatchObject({
      asPath: '/?name=ACME&page=2',
    });
  });

  test('link navigates to /vacancies when role is JOB_SEEKER', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () => [],
    });

    render(<CompaniesPage />);

    const link = screen.getByRole('link', { name: /Search for vacancies/i });

    expect(link).toHaveAttribute('href', '/vacancies');
  });
});

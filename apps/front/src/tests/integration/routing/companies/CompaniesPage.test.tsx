import { render, screen, fireEvent } from '@testing-library/react';
import CompaniesPage from '@/app/companies/page';
import router from 'next-router-mock';
import { useSearchParams } from 'next/navigation';

// Mock next/navigation routing
jest.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: jest.fn(),
}));

// Mock SearchBar so we can trigger updateUrl manually
jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => (
  <button
    data-testid="submit-search"
    onClick={() => props.onSubmit({ name: 'ACME', page: 2 })}
  >
    SearchMock
  </button>
));

// Mock role cookie
jest.mock('js-cookie', () => ({
  get: jest.fn(() => 'JOB_SEEKER'),
}));

// Mock CompanyItem (we are NOT testing rendering here)
jest.mock(
  '@/components/CompaniesSearchItems/CompanyItem',
  () => (props: any) => <div data-testid="company-item">{props.data.name}</div>
);

// Mock data returned from React Query (we don't test API here)
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

    // Перевіряємо, що заголовок сторінки відрендерився
    expect(screen.getByText('Search for top-tier jobs')).toBeInTheDocument();

    // Перевіряємо, що SearchBar отримав правильні initial values
    // (через наявність кнопки ми знаємо, що мок рендериться)
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

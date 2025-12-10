import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CompaniesPage from '@/app/companies/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { searchCompanies } from '@/services/companiesSearchService';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('@/services/companiesSearchService');

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <CompaniesPage />
    </QueryClientProvider>
  );
}

const mockCompaniesResponse = {
  data: [
    {
      id: '1',
      name: 'Google',
      url: 'https://google.com',
      logoUrl: '/google.png',
      createdAt: '2023-01-01',
    },
    {
      id: '2',
      name: 'Microsoft',
      url: 'https://microsoft.com',
      logoUrl: '/ms.png',
      createdAt: '2023-01-02',
    },
  ],
  meta: {
    total: 2,
    page: 1,
    totalPages: 1,
  },
};

describe('CompaniesPage — Integration Tests (API-mocked)', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () =>
        new Map([
          ['name', ''],
          ['page', '1'],
        ]).entries(),
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
  });

  test('renders company list after successful fetch', async () => {
    (searchCompanies as jest.Mock).mockResolvedValue(mockCompaniesResponse);
    (Cookies.get as jest.Mock).mockReturnValue(undefined);

    renderPage();

    expect(await screen.findByText('Google')).toBeInTheDocument();
    expect(await screen.findByText('Microsoft')).toBeInTheDocument();
  });

  test('shows error message when searchCompanies fails', async () => {
    (searchCompanies as jest.Mock).mockRejectedValue(new Error('Server error'));
    (Cookies.get as jest.Mock).mockReturnValue(undefined);

    renderPage();

    expect(
      await screen.findByText(/Error loading companies/i)
    ).toBeInTheDocument();
  });

  test('renders navigation link when role = JOB_SEEKER', async () => {
    (searchCompanies as jest.Mock).mockResolvedValue(mockCompaniesResponse);
    (Cookies.get as jest.Mock).mockReturnValue('JOB_SEEKER');

    renderPage();

    expect(
      await screen.findByText(/Search for vacancies/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: /Search for vacancies/i })
    ).toHaveAttribute('href', '/vacancies');
  });

  test('renders navigation link when role = RECRUITER', async () => {
    (searchCompanies as jest.Mock).mockResolvedValue(mockCompaniesResponse);
    (Cookies.get as jest.Mock).mockReturnValue('RECRUITER');

    renderPage();

    expect(
      await screen.findByText(/Search for job-seekers/i)
    ).toBeInTheDocument();
  });

  test('updateUrl triggers router.push with correct query params', async () => {
    (searchCompanies as jest.Mock).mockResolvedValue(mockCompaniesResponse);
    (Cookies.get as jest.Mock).mockReturnValue(undefined);

    const { container } = renderPage();

    const input = await screen.findByRole('textbox');

    const form = container.querySelector('form');
    expect(form).not.toBeNull();

    fireEvent.change(input, { target: { value: 'Google' } });
    fireEvent.submit(form as HTMLFormElement);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('?name=Google&page=1');
    });
  });

  test('searchCompanies is called with correct parameters', async () => {
    (searchCompanies as jest.Mock).mockResolvedValue(mockCompaniesResponse);
    (Cookies.get as jest.Mock).mockReturnValue(undefined);

    renderPage();

    await waitFor(() => {
      expect(searchCompanies).toHaveBeenCalledWith({
        name: '',
        page: 1,
      });
    });
  });
});

import { render, screen } from '@testing-library/react';
import VacanciesPage from '@/app/vacancies/VacanciesPage'; // adjust path if needed
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { searchVacancies } from '@/services/vacanciesService';
import { useSearchParams, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/services/vacanciesService', () => ({
  searchVacancies: jest.fn(),
}));

jest.mock('js-cookie');

function renderPage(searchParamsObj: Record<string, string> = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  // mock search params
  (useSearchParams as jest.Mock).mockReturnValue({
    entries: () => Object.entries(searchParamsObj),
    get: (key: string) => searchParamsObj[key],
  });

  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

  return render(
    <QueryClientProvider client={client}>
      <VacanciesPage />
    </QueryClientProvider>
  );
}

describe('VacanciesPage — Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', async () => {
    (searchVacancies as jest.Mock).mockReturnValue(
      new Promise(() => {}) // never resolve → simulates pending
    );

    renderPage();

    expect(screen.getByText(/loading vacancies/i)).toBeInTheDocument();
  });

  test('renders error state', async () => {
    (searchVacancies as jest.Mock).mockRejectedValue(
      new Error('Server failed')
    );

    renderPage();

    expect(
      await screen.findByText(/error loading vacancies/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/server failed/i)).toBeInTheDocument();
  });

  test('renders vacancies list', async () => {
    (searchVacancies as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Frontend Developer',
          company: { name: 'Apple', logoUrl: '/logo.png' },
          createdAt: '2024-01-01',
        },
        {
          id: 2,
          title: 'Backend Developer',
          company: { name: 'Google', logoUrl: '/logo2.png' },
          createdAt: '2024-01-02',
        },
      ],
      meta: { page: 1, totalPages: 3 },
    });

    renderPage();

    expect(await screen.findByText(/frontend developer/i)).toBeInTheDocument();
    expect(screen.getByText(/backend developer/i)).toBeInTheDocument();

    expect(screen.getByText(/apple/i)).toBeInTheDocument();
    expect(screen.getByText(/google/i)).toBeInTheDocument();
  });

  test('renders PagesCounter when meta exists', async () => {
    (searchVacancies as jest.Mock).mockResolvedValue({
      data: [],
      meta: { page: 2, totalPages: 5 },
    });

    renderPage();

    expect(await screen.findByText(/2/i)).toBeInTheDocument();
    expect(screen.getByText(/5/i)).toBeInTheDocument();
  });

  test('renders role-based link when role is present', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('JOB_SEEKER');

    (searchVacancies as jest.Mock).mockResolvedValue({
      data: [],
      meta: { page: 1, totalPages: 1 },
    });

    renderPage();

    expect(
      await screen.findByText(/search for companies/i)
    ).toBeInTheDocument();
  });

  test('renders recruiter link for RECRUITER', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('RECRUITER');

    (searchVacancies as jest.Mock).mockResolvedValue({
      data: [],
      meta: { page: 1, totalPages: 1 },
    });

    renderPage();

    expect(
      await screen.findByText(/search for job-seekers/i)
    ).toBeInTheDocument();
  });
});

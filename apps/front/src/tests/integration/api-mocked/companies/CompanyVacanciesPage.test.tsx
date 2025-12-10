import { render, screen, waitFor } from '@testing-library/react';
import CompanyVacanciesPage from '@/app/company/[companyId]/vacancies/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useParams } from 'next/navigation';
import { getCompanyVacancies } from '@/services/companiesSearchService';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('@/services/companiesSearchService');

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <CompanyVacanciesPage />
    </QueryClientProvider>
  );
}

const mockVacancies = [
  {
    id: 'v1',
    title: 'Frontend Developer',
    createdAt: '2023-01-01',
    company: {
      id: 'c1',
      name: 'Google',
      logoUrl: '/google.png',
    },
  },
  {
    id: 'v2',
    title: 'Backend Developer',
    createdAt: '2023-01-02',
    company: {
      id: 'c1',
      name: 'Google',
      logoUrl: '/google.png',
    },
  },
];

describe('CompanyVacanciesPage — Integration Tests (API-mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({ companyId: 'c1' });
  });

  test('shows loading state while request is pending', async () => {
    (getCompanyVacancies as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(
      screen.getByText(/Loading profile, wait a second/i)
    ).toBeInTheDocument();
  });

  test('shows error state when request fails', async () => {
    (getCompanyVacancies as jest.Mock).mockRejectedValue({
      message: 'Something went wrong',
    });

    renderPage();

    expect(
      await screen.findByText(/Error loading profile/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
  });

  test('renders list of vacancies on success', async () => {
    (getCompanyVacancies as jest.Mock).mockResolvedValue(mockVacancies);

    renderPage();

    expect(await screen.findByText(/Google's Vacancies/i)).toBeInTheDocument();
    expect(screen.getByText(/Frontend Developer/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend Developer/i)).toBeInTheDocument();
  });

  test('renders "No vacancies found" when list is empty', async () => {
    (getCompanyVacancies as jest.Mock).mockResolvedValue([]);

    renderPage();

    expect(await screen.findByText(/Company's Vacancies/i)).toBeInTheDocument();
    expect(screen.getByText(/No vacancies found/i)).toBeInTheDocument();
  });

  test('calls getCompanyVacancies with correct companyId', async () => {
    (getCompanyVacancies as jest.Mock).mockResolvedValue(mockVacancies);

    renderPage();

    await waitFor(() => {
      expect(getCompanyVacancies).toHaveBeenCalledWith('c1');
    });
  });
});

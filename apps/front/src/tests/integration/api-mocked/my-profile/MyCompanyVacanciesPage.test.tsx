/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ===============================
// 🔧 MOCK next/navigation
// ===============================
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'companyId') return mockCompanyId;
      return null;
    },
  }),
}));

let mockCompanyId: string | null = '123';

// ===============================
// 🔧 MOCK services
// ===============================
jest.mock('@/services/vacanciesService', () => ({
  getMyVacancies: jest.fn(),
}));

// ===============================
// 🔧 MOCK components
// ===============================
jest.mock('@/components/VacanciesItems/VacancyItem', () => (props: any) => (
  <div>VacancyItem {props.data.id}</div>
));

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <span>{props.children}</span>
));

import CompanyVacancies from '@/app/my-profile/recruiter/company/vacancies/CompanyVacancies';
import { getMyVacancies } from '@/services/vacanciesService';

// ===============================
// Render Helper
// ===============================
function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <CompanyVacancies />
    </QueryClientProvider>
  );
}

// ===============================
// TESTS
// ===============================
describe('CompanyVacancies tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCompanyId = '123';
  });

  // -------------------------------------------
  test('shows loading message', async () => {
    (getMyVacancies as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(
      await screen.findByText(/Loading profile, wait a second/i)
    ).toBeInTheDocument();
  });

  // -------------------------------------------
  test('shows error message when query fails', async () => {
    (getMyVacancies as jest.Mock).mockRejectedValue({
      message: 'Server error',
    });

    renderPage();

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  // -------------------------------------------
  test('renders vacancies list when data loads successfully', async () => {
    (getMyVacancies as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 1,
          title: 'Frontend Dev',
          createdAt: '2024-02-01',
          company: { name: 'ACME', logoUrl: 'logo.png' },
        },
        {
          id: 2,
          title: 'Backend Dev',
          createdAt: '2024-02-05',
          company: { name: 'DevCorp', logoUrl: 'logo2.png' },
        },
      ],
    });

    renderPage();

    expect(await screen.findByText(/VacancyItem 1/i)).toBeInTheDocument();
    expect(screen.getByText(/VacancyItem 2/i)).toBeInTheDocument();
  });

  // -------------------------------------------
  test("renders 'No vacancies found.' when list is empty", async () => {
    (getMyVacancies as jest.Mock).mockResolvedValue({
      data: [],
    });

    renderPage();

    expect(await screen.findByText(/No vacancies found/i)).toBeInTheDocument();
  });

  // -------------------------------------------
  test('does not call getMyVacancies when companyId is missing', async () => {
    mockCompanyId = null;

    renderPage();

    expect(getMyVacancies).not.toHaveBeenCalled();
  });
});

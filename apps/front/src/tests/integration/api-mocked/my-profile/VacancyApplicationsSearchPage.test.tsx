import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ vacancyApplicationSlug: '555' }),
  useSearchParams: () => ({
    entries: () => [],
    get: () => null,
  }),
}));

jest.mock('@/services/application', () => ({
  getVacancyApplications: jest.fn(),
}));

jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => (
  <button onClick={() => props.onSubmit({ page: 1 })}>MockSearchBar</button>
));

jest.mock(
  '@/components/ApplicationItems/VacancyApplicationItem',
  () => (props: any) => <div>VacancyApplicationItem {props.data.id}</div>
);

import VacancyApplicationsPage from '@/app/my-profile/recruiter/company/applications/[vacancyApplicationSlug]/VacancyApplicationsPage';
import { getVacancyApplications } from '@/services/application';

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <VacancyApplicationsPage />
    </QueryClientProvider>
  );
}

describe('VacancyApplicationsPage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders error message when query fails', async () => {
    (getVacancyApplications as jest.Mock).mockRejectedValue({
      message: 'Server error',
    });

    renderPage();

    expect(
      await screen.findByText(/error loading companies/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/server error/i)).toBeInTheDocument();
  });

  test('renders applications list when data loads successfully', async () => {
    (getVacancyApplications as jest.Mock).mockResolvedValue({
      data: [
        { id: 1, status: 'PENDING', jobSeeker: {}, vacancyId: 55 },
        { id: 2, status: 'ACCEPTED', jobSeeker: {}, vacancyId: 55 },
      ],
    });

    renderPage();

    expect(
      await screen.findByText(/VacancyApplicationItem 1/)
    ).toBeInTheDocument();
    expect(screen.getByText(/VacancyApplicationItem 2/)).toBeInTheDocument();
  });

  test('SearchBar triggers router.push with correct params', async () => {
    (getVacancyApplications as jest.Mock).mockResolvedValue({ data: [] });

    renderPage();

    fireEvent.click(screen.getByText(/MockSearchBar/i));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('?page=1');
  });
});

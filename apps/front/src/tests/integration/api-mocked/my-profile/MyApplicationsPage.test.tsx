import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const pushMock = jest.fn();
const searchParamsMock = {
  entries: () => [],
  get: () => null,
};

jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => searchParamsMock,
}));

jest.mock('@/services/application', () => ({
  getMyApplications: jest.fn(),
}));

jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => (
  <button onClick={() => props.onSubmit({ page: 1 })}>MockedSearchBar</button>
));

jest.mock(
  '@/components/ApplicationItems/ApplicationItem',
  () => (props: any) => <div>ApplicationItem {props.data.id}</div>
);

import MyApplicationsPage from '@/app/my-profile/job-seeker/applications/page';
import { getMyApplications } from '@/services/application';

function renderPage(searchParams: Record<string, string> = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  searchParamsMock.entries = () => Object.entries(searchParams);
  searchParamsMock.get = (key: string) => searchParams[key];

  return render(
    <QueryClientProvider client={client}>
      <MyApplicationsPage />
    </QueryClientProvider>
  );
}

describe('MyApplicationsPage — Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders error message when query fails', async () => {
    (getMyApplications as jest.Mock).mockRejectedValue(
      new Error('Server down')
    );

    renderPage();

    expect(
      await screen.findByText(/error loading companies/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/server down/i)).toBeInTheDocument();
  });

  test('renders applications list when data loads successfully', async () => {
    (getMyApplications as jest.Mock).mockResolvedValue({
      data: [
        { id: 1, status: 'PENDING', vacancy: { title: 'Frontend Dev' } },
        { id: 2, status: 'ACCEPTED', vacancy: { title: 'Backend Dev' } },
      ],
    });

    renderPage();

    expect(await screen.findByText(/applicationitem 1/i)).toBeInTheDocument();
    expect(screen.getByText(/applicationitem 2/i)).toBeInTheDocument();
  });

  test('SearchBar triggers router.push with correct params', async () => {
    (getMyApplications as jest.Mock).mockResolvedValue({ data: [] });

    renderPage();

    fireEvent.click(screen.getByText(/mockedsearchbar/i));

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('?page=1');
  });
});

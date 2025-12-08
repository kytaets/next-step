/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobSeekersPage from '@/app/job-seekers/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchJobSeekers } from '@/services/jobSeekerSearchService';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/services/jobSeekerSearchService', () => ({
  searchJobSeekers: jest.fn(),
}));

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe('JobSeekersPage — Integration Tests (API-mocked)', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () =>
        new Map([
          ['firstName', ''],
          ['lastName', ''],
        ]).entries(),
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
  });

  const mockResponse = {
    data: [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        avatarUrl: null,
        createdAt: '2023-01-01',
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        avatarUrl: null,
        createdAt: '2023-01-02',
      },
    ],
    meta: {
      total: 2,
      page: 1,
      totalPages: 1,
    },
  };

  test('shows loader while request is pending', () => {
    (searchJobSeekers as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderWithClient(<JobSeekersPage />);

    expect(screen.getByText(/Loading job seekers/i)).toBeInTheDocument();
  });

  test('shows error when searchJobSeekers fails', async () => {
    (searchJobSeekers as jest.Mock).mockRejectedValue(
      new Error('Server error')
    );

    renderWithClient(<JobSeekersPage />);

    expect(
      await screen.findByText(/Error loading job seekers/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/Server error/i)).toBeInTheDocument();
  });

  test('renders job seekers list on success', async () => {
    (searchJobSeekers as jest.Mock).mockResolvedValue(mockResponse);

    renderWithClient(<JobSeekersPage />);

    expect(
      await screen.findByRole('heading', { name: /john\s*doe/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: /jane\s*smith/i })
    ).toBeInTheDocument();
  });

  test('updateUrl triggers router.push with correct query params', async () => {
    (searchJobSeekers as jest.Mock).mockResolvedValue(mockResponse);

    renderWithClient(<JobSeekersPage />);

    const input = await screen.findByPlaceholderText('Add skill');

    fireEvent.change(input, { target: { value: 'John' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('?page=1'));
  });

  test('searchJobSeekers is called with mapped form data', async () => {
    (searchJobSeekers as jest.Mock).mockResolvedValue(mockResponse);

    renderWithClient(<JobSeekersPage />);

    await waitFor(() => expect(searchJobSeekers).toHaveBeenCalled());
  });
});

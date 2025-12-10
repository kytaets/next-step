import { render, screen, waitFor } from '@testing-library/react';
import CompanyPage from '@/app/company/[companyId]/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useParams } from 'next/navigation';
import { getCompanyProfileById } from '@/services/companyProfileService';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
}));

jest.mock('@/services/companyProfileService');

jest.mock('@/components/CompanyProfileItems/CompanyBottomRow', () => {
  return function MockedBottomRow() {
    return <div>MockedBottomRow</div>;
  };
});

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <CompanyPage />
    </QueryClientProvider>
  );
}

const mockCompanyProfile = {
  id: '123',
  name: 'Google',
  description: 'Tech giant',
  url: 'https://google.com',
  logoUrl: '/google.png',
  createdAt: '2023-01-01',
  updatedAt: '2023-02-01',
};

describe('CompanyPage — Integration Tests (API-mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({
      companyId: '123',
    });
  });

  test('shows loader while data is loading', async () => {
    (getCompanyProfileById as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/Loading company/i)).toBeInTheDocument();
  });

  test('renders error message when request fails (non-403)', async () => {
    (getCompanyProfileById as jest.Mock).mockRejectedValue({
      status: 500,
      message: 'Server crashed',
    });

    renderPage();

    expect(
      await screen.findByText(/Error loading profile/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Server crashed/i)).toBeInTheDocument();
  });

  test('skips error block if status = 403 (handled silently)', async () => {
    (getCompanyProfileById as jest.Mock).mockRejectedValue({
      status: 403,
      message: 'Forbidden',
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.queryByText(/Error loading profile/i)
      ).not.toBeInTheDocument();
    });

    expect(screen.queryByText(/Google/)).not.toBeInTheDocument();
  });

  test('renders CompanyProfileContainer on successful fetch', async () => {
    (getCompanyProfileById as jest.Mock).mockResolvedValue(mockCompanyProfile);

    renderPage();

    expect(await screen.findByText('Google')).toBeInTheDocument();
    expect(screen.getByText(/Tech giant/i)).toBeInTheDocument();
    expect(screen.getByText('MockedBottomRow')).toBeInTheDocument();
  });

  test('calls getCompanyProfileById with correct id', async () => {
    (getCompanyProfileById as jest.Mock).mockResolvedValue(mockCompanyProfile);

    renderPage();

    await waitFor(() => {
      expect(getCompanyProfileById).toHaveBeenCalledWith('123');
    });
  });
});

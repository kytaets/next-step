import { render, screen, waitFor } from '@testing-library/react';
import ProfilePage from '@/app/job-seeker/[profileId]/ProfilePage';
import { getProfileById } from '@/services/jobseekerService';
import { useParams } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
}));

jest.mock('@/store/authSlice', () => ({
  useAuthStore: jest.fn(() => ({
    setIsLogged: jest.fn(),
  })),
}));

jest.mock('@/services/jobseekerService', () => ({
  getProfileById: jest.fn(),

  getSkills: jest.fn(() => Promise.resolve([])),
  createNewSkill: jest.fn(() =>
    Promise.resolve({ status: 'success', data: {} })
  ),
  updateSkills: jest.fn(() => Promise.resolve({ status: 'success' })),

  getLanguages: jest.fn(() => Promise.resolve([])),
  updateUserLanguages: jest.fn(() => Promise.resolve({ status: 'success' })),
}));

const mockedGetProfileById = getProfileById as jest.Mock;

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

beforeEach(() => {
  (useParams as jest.Mock).mockReturnValue({ profileId: '123' });
  jest.clearAllMocks();
});

const mockProfile = {
  id: '123',
  userId: '1',
  firstName: 'John',
  lastName: 'Doe',
  avatarUrl: null,
  bio: 'Frontend Developer',
  contacts: {
    githubUrl: null,
    linkedinUrl: null,
    telegramUrl: null,
    publicEmail: null,
    phoneNumber: null,
  },
  dateOfBirth: null,
  expectedSalary: 5000,
  isOpenToWork: true,
  seniorityLevel: 'MID',
  location: 'Berlin',
  languages: [],
  skills: [],
  createdAt: '2023-01-01',
  updatedAt: '2023-01-02',
};

describe('ProfilePage — Integration Tests (API-mocked)', () => {
  const renderPage = () => renderWithClient(<ProfilePage />);

  test('shows loader while data is loading', () => {
    mockedGetProfileById.mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument();
  });

  test('renders error when request fails (non-403)', async () => {
    mockedGetProfileById.mockRejectedValue({
      message: 'Server error',
      status: 500,
    });

    renderPage();

    expect(
      await screen.findByText(/Error loading profile/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/Server error/i)).toBeInTheDocument();
  });

  test('skips error box on status 403 (returns null)', async () => {
    mockedGetProfileById.mockRejectedValue({ status: 403 });

    renderPage();

    await waitFor(() =>
      expect(
        screen.queryByText(/Error loading profile/i)
      ).not.toBeInTheDocument()
    );
  });

  test('renders ProfileContainer on success', async () => {
    mockedGetProfileById.mockResolvedValue(mockProfile);

    renderPage();

    expect(await screen.findByText(/John/i)).toBeInTheDocument();
    expect(screen.getByText(/Doe/i)).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  test('calls getProfileById with correct id', async () => {
    mockedGetProfileById.mockResolvedValue(mockProfile);

    renderPage();

    await waitFor(() =>
      expect(mockedGetProfileById).toHaveBeenCalledWith('123')
    );
  });
});

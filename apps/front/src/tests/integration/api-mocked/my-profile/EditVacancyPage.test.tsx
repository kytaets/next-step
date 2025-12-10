import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as nextNavigation from 'next/navigation';
import EditVacancy from '@/app/my-profile/recruiter/company/vacancies/edit-vacancy/[editVacancyId]/EditVacancyPage';
import { getVacancyById } from '@/services/vacanciesService';
import { VacancyData } from '@/types/vacancies';

jest.mock('@/services/vacanciesService');

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}));

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const mockVacancy: VacancyData = {
  id: '123',
  title: 'Senior JS Developer',
  description: 'We need a senior dev',
  salaryMin: 1000,
  salaryMax: 3000,
  officeLocation: 'Kyiv',
  experienceRequired: 3,
  isActive: true,
  workFormat: ['REMOTE'],
  employmentType: ['FULL_TIME'],
  seniorityLevel: 'MIDDLE',
  requiredSkills: [{ skill: { id: 's1', name: 'React' } }],
  requiredLanguages: [
    {
      level: 'INTERMEDIATE',
      language: { id: 'l1', name: 'English' },
    },
  ],
  company: {
    id: 'c1',
    name: 'Test Company',
    description: 'Test Desc',
    url: '',
    logoUrl: '',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
};

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

describe('EditVacancy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders vacancy form when data is loaded', async () => {
    (nextNavigation.useParams as jest.Mock).mockReturnValue({
      editVacancyId: '123',
    });

    (getVacancyById as jest.Mock).mockResolvedValue(mockVacancy);

    renderWithClient(<EditVacancy />);

    await flushPromises();
    await flushPromises();

    expect(
      screen.getByRole('heading', { name: /edit your vacancy/i })
    ).toBeInTheDocument();

    expect(document.getElementById('vacancy-form')).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/cool vacancy/i)).toBeInTheDocument();
  });

  test('renders error message on API error', async () => {
    (nextNavigation.useParams as jest.Mock).mockReturnValue({
      editVacancyId: '999',
    });

    (getVacancyById as jest.Mock).mockRejectedValue({
      message: 'Vacancy not found',
    });

    renderWithClient(<EditVacancy />);

    await flushPromises();
    await flushPromises();

    expect(screen.getByText(/error loading profile/i)).toBeInTheDocument();
    expect(screen.getByText(/vacancy not found/i)).toBeInTheDocument();
  });
});

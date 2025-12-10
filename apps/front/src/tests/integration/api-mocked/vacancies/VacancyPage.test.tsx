import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import VacancyPage from '@/app/vacancies/[vacancySlug]/page';
import { getVacancyById, deleteVacancy } from '@/services/vacanciesService';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(),
}));

jest.mock('@/services/vacanciesService', () => ({
  getVacancyById: jest.fn(),
  deleteVacancy: jest.fn(),
}));

jest.mock('js-cookie');

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) => {
      const {
        animate,
        initial,
        exit,
        transition,
        variants,
        whileHover,
        whileTap,
        ...clean
      } = rest;
      return <div {...clean}>{children}</div>;
    },
  },
}));

const createMockVacancy = (overrides = {}) => ({
  id: '123',
  title: 'Senior Frontend Developer',
  description: 'Build amazing UI',
  salaryMin: 2000,
  salaryMax: 4000,
  officeLocation: 'Kyiv, Ukraine',
  experienceRequired: 3,
  isActive: true,

  workFormat: ['REMOTE', 'OFFICE'],
  employmentType: ['FULL_TIME'],
  seniorityLevel: 'SENIOR',

  requiredSkills: [{ skill: { id: '1', name: 'React' } }],

  requiredLanguages: [
    {
      level: 'UPPER_INTERMEDIATE',
      language: { id: '1', name: 'English' },
    },
  ],

  company: {
    id: '999',
    name: 'Google',
    description: 'Tech giant',
    url: 'https://google.com',
    logoUrl: '/g.png',
    isVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },

  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',

  ...overrides,
});

function renderPage(params: any = { vacancySlug: '123' }) {
  (useParams as jest.Mock).mockReturnValue(params);
  (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <VacancyPage />
    </QueryClientProvider>
  );
}

describe('VacancyPage — Integration Tests', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows loading state', async () => {
    (getVacancyById as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(
      screen.getByText(/Wait while we are loading this vacancy/i)
    ).toBeInTheDocument();
  });

  test('shows error message', async () => {
    (getVacancyById as jest.Mock).mockRejectedValue(new Error('Server Error'));

    renderPage();

    expect(
      await screen.findByText(/Error loading profile/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Server Error/i)).toBeInTheDocument();
  });

  test('renders vacancy details', async () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined);

    (getVacancyById as jest.Mock).mockResolvedValue(createMockVacancy());

    renderPage();

    expect(
      await screen.findByText(/Senior Frontend Developer/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Build amazing UI/i)).toBeInTheDocument();
    expect(screen.getByText(/3 years/i)).toBeInTheDocument();
    expect(screen.getByText(/React/i)).toBeInTheDocument();
    expect(screen.getByText(/English/i)).toBeInTheDocument();
  });

  test('shows Apply button when NOT a company user', async () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined);

    (getVacancyById as jest.Mock).mockResolvedValue(
      createMockVacancy({ title: 'Frontend Dev' })
    );

    renderPage();

    const applyButtons = await screen.findAllByText(/Apply for a job/i);
    expect(applyButtons.length).toBeGreaterThan(0);
  });

  test('shows recruiter controls when companyId matches vacancy company', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('999');

    (getVacancyById as jest.Mock).mockResolvedValue(
      createMockVacancy({ title: 'Frontend Dev' })
    );

    renderPage();

    const editLinks = await screen.findAllByText(/Edit vacancy/i);
    expect(editLinks.length).toBeGreaterThan(0);

    expect(screen.getByText(/Vacancy Applications/i)).toBeInTheDocument();

    const deleteButtons = await screen.findAllByText(/Delete vacancy/i);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });
});

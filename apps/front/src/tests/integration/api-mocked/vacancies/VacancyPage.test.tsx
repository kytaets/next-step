/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import VacancyPage from '@/app/vacancies/[vacancySlug]/page'; // <<< ADJUST IF YOUR PATH DIFFERS
import { getVacancyById, deleteVacancy } from '@/services/vacanciesService';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';

// -------------------- MOCKS --------------------

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

// -------------------- TEST RENDER FUNC --------------------

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

// -------------------- TESTS --------------------

describe('VacancyPage — Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state', async () => {
    (getVacancyById as jest.Mock).mockReturnValue(
      new Promise(() => {}) // never resolves
    );

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
    (Cookies.get as jest.Mock).mockReturnValue(undefined); // job seeker

    (getVacancyById as jest.Mock).mockResolvedValue({
      id: 123,
      title: 'Senior Frontend Developer',
      description: 'Build amazing UI',
      experienceRequired: 3,
      seniorityLevel: 'senior',
      createdAt: '2024-01-01T00:00:00.000Z',
      company: { id: 999, name: 'Google', logoUrl: '/g.png' },
      requiredSkills: [{ skill: { name: 'React' } }],
      requiredLanguages: [
        {
          language: { id: 1, name: 'English' },
          level: 'upper-intermediate',
        },
      ],
    });

    renderPage();

    expect(
      await screen.findByText(/Senior Frontend Developer/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Build amazing UI/i)).toBeInTheDocument();
    expect(screen.getByText(/3 years/i)).toBeInTheDocument();
    expect(screen.getByText(/Senior/i)).toBeInTheDocument();
    expect(screen.getByText(/React/i)).toBeInTheDocument();
    expect(
      screen.getByText(/English - Upper intermediate/i)
    ).toBeInTheDocument();
  });

  test('shows Apply button when NOT a company user', async () => {
    (Cookies.get as jest.Mock).mockReturnValue(undefined); // job seeker

    (getVacancyById as jest.Mock).mockResolvedValue({
      id: 123,
      title: 'Frontend Dev',
      createdAt: '2024-01-01T00:00:00Z',
      company: { id: 999 },
    });

    renderPage();

    expect(await screen.findByText(/Apply/i)).toBeInTheDocument();
  });

  test('shows recruiter controls when companyId matches vacancy company', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('999'); // recruiter

    (getVacancyById as jest.Mock).mockResolvedValue({
      id: 123,
      title: 'Frontend Dev',
      createdAt: '2024-01-01',
      company: { id: '999' },
    });

    renderPage();

    expect(await screen.findByText(/Edit vacancy/i)).toBeInTheDocument();

    expect(screen.getByText(/Vacancy Applications/i)).toBeInTheDocument();

    expect(screen.getByText(/Delete vacancy/i)).toBeInTheDocument();
  });

  test('delete vacancy mutation triggers router.push on success', async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (Cookies.get as jest.Mock).mockReturnValue('999');

    (getVacancyById as jest.Mock).mockResolvedValue({
      id: 123,
      company: { id: '999' },
      createdAt: '2024-01-01',
      title: 'Frontend Dev',
    });

    (deleteVacancy as jest.Mock).mockResolvedValue({ status: 'success' });

    renderPage();

    const btn = await screen.findByText(/Delete vacancy/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(
        '/my-profile/recruiter/company/vacancies?companyId=999'
      );
    });
  });
});

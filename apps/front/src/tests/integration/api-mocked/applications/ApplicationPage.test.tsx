/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import ApplicationPage from '@/app/applications/[applicationSlug]/ApplicationPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { getApplication } from '@/services/application';
import { getVacancyById } from '@/services/vacanciesService';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

jest.mock('@/services/application');
jest.mock('@/services/vacanciesService');

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ApplicationPage />
    </QueryClientProvider>
  );
}

const mockVacancy: import('@/types/vacancies').VacancyData = {
  id: '555',
  title: 'Frontend Developer',
  description: 'We are looking for a React developer',
  salaryMin: 2000,
  salaryMax: 3500,
  officeLocation: 'Remote',
  experienceRequired: 2,
  isActive: true,
  workFormat: ['REMOTE'],
  employmentType: ['FULL_TIME'],
  seniorityLevel: 'JUNIOR',
  requiredSkills: [
    { skill: { id: '1', name: 'React' } },
    { skill: { id: '2', name: 'TypeScript' } },
  ],
  requiredLanguages: [
    {
      level: 'ADVANCED',
      language: { id: 'l1', name: 'English' },
    },
  ],
  company: {
    id: 'c1',
    name: 'Test Company',
    description: 'A company that tests things.',
    url: 'https://example.com',
    logoUrl: '/logo.png',
    isVerified: true,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
  },
  createdAt: '2023-01-01',
  updatedAt: '2023-01-02',
};

describe('ApplicationPage Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useParams as jest.Mock).mockReturnValue({
      applicationSlug: '123',
    });
  });

  test('Показує лоадер перед отриманням даних', () => {
    (getApplication as jest.Mock).mockReturnValue(
      new Promise(() => {}) // pending
    );

    renderPage();

    expect(screen.getByText(/Loading your application/i)).toBeInTheDocument();
  });

  test('Показує помилку, якщо getApplication завершується помилкою', async () => {
    (getApplication as jest.Mock).mockRejectedValue({
      message: 'Application not found',
    });

    renderPage();

    expect(
      await screen.findByText(/Application not found/i)
    ).toBeInTheDocument();
  });

  test('Рендерить ApplicationContainer після успішного завантаження', async () => {
    (getApplication as jest.Mock).mockResolvedValue({
      id: '123',
      vacancyId: '555',
      applicantName: 'Test User',
    });

    (getVacancyById as jest.Mock).mockResolvedValue(mockVacancy);

    renderPage();

    // Хедер від сторінки
    expect(await screen.findByText(/Your Application/i)).toBeInTheDocument();

    // Тайтл вакансії
    expect(await screen.findByText(/Frontend Developer/i)).toBeInTheDocument();

    // Назва компанії
    expect(await screen.findByText(/Test Company/i)).toBeInTheDocument();
  });

  test('Vacancy запит викликається лише після отримання applicationData', async () => {
    (getApplication as jest.Mock).mockResolvedValue({
      id: '123',
      vacancyId: '777',
    });

    (getVacancyById as jest.Mock).mockResolvedValue(mockVacancy);

    renderPage();

    await waitFor(() => {
      expect(getApplication).toHaveBeenCalledWith('123');
    });

    await waitFor(() => {
      expect(getVacancyById).toHaveBeenCalledWith('777');
    });
  });
});

/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ===============================
// 🔧 MOCK next/navigation
// ===============================
jest.mock('next/navigation', () => ({
  useParams: () => ({
    applicationSlug: '123',
  }),
}));

// ===============================
// 🔧 MOCK SERVICES
// ===============================
jest.mock('@/services/application', () => ({
  getApplication: jest.fn(),
}));

jest.mock('@/services/jobseekerService', () => ({
  getProfileById: jest.fn(),
}));

// ===============================
// 🔧 MOCK ApplicationContainer
// ===============================
jest.mock(
  '@/components/ApplicationItems/ApplicationContainer',
  () => (props: any) => (
    <div>
      ApplicationContainer {props.applicationData?.id}{' '}
      {props.jobSeekerData?.name}
    </div>
  )
);

// ===============================
// Imports
// ===============================
import VacancyApplicationPage from '@/app/my-profile/recruiter/company/applications/[vacancyApplicationSlug]/[applicationSlug]/VacancyApplicationPage';
import { getApplication } from '@/services/application';
import { getProfileById } from '@/services/jobseekerService';

// ===============================
// Helper render
// ===============================
function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <VacancyApplicationPage />
    </QueryClientProvider>
  );
}

// ===============================
// TESTS
// ===============================
describe('VacancyApplicationPage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------
  test('shows loading message while fetching application', async () => {
    (getApplication as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(
      await screen.findByText(/loading your application/i)
    ).toBeInTheDocument();
  });

  // -------------------------------------------
  test('shows error message when application request fails', async () => {
    (getApplication as jest.Mock).mockRejectedValue({
      message: 'Server error',
    });

    renderPage();

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  // -------------------------------------------
  test('renders application data when request succeeds', async () => {
    (getApplication as jest.Mock).mockResolvedValue({
      id: 123,
      vacancyId: 55,
      jobSeeker: { id: 999 },
    });

    (getProfileById as jest.Mock).mockResolvedValue({
      name: 'John Doe',
    });

    renderPage();

    expect(
      await screen.findByText(/ApplicationContainer 123 John Doe/)
    ).toBeInTheDocument();
  });

  // -------------------------------------------
  test('fetches jobSeekerData only when applicationData exists', async () => {
    (getApplication as jest.Mock).mockResolvedValue({
      id: 123,
      vacancyId: 77,
      jobSeeker: { id: 999 },
    });

    (getProfileById as jest.Mock).mockResolvedValue({
      name: 'Jane',
    });

    renderPage();

    await waitFor(() => {
      expect(getProfileById).toHaveBeenCalledWith(999);
    });
  });
});

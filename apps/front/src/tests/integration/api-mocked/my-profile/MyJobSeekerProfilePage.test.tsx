/**
 * @jest-environment jsdom
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/jobseekerService', () => ({
  getProfile: jest.fn(),
}));

// ---------- MOCK ZUSTAND ----------
jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn((selector) =>
    selector({
      openModal: jest.fn(),
      closeModal: jest.fn(),
    })
  ),
}));

// ---------- MOCK Skills & Languages BEFORE Import ----------
jest.mock('@/components/ProfileItems/Skills', () => () => (
  <div>Mocked Skills</div>
));
jest.mock('@/components/ProfileItems/Languages', () => () => (
  <div>Mocked Languages</div>
));

import JobSeekerProfilePage from '@/app/my-profile/job-seeker/page';
import { getProfile } from '@/services/jobseekerService';
import Cookies from 'js-cookie';

jest.mock('js-cookie');

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <JobSeekerProfilePage />
    </QueryClientProvider>
  );
}

describe('JobSeekerProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('successful profile: sets cookie, closes modal and renders ProfileContainer', async () => {
    const closeModal = jest.fn();
    const openModal = jest.fn();

    const { useModalStore } = require('@/store/modalSlice');
    useModalStore.mockImplementation((selector) =>
      selector({
        openModal,
        closeModal,
      })
    );

    (getProfile as jest.Mock).mockResolvedValue({
      id: 1,
      personalInfo: { fullName: 'John Doe' },
      skills: [],
      languages: [],
      contacts: {},
      experience: [],
      education: [],
      avatarUrl: null,
    });

    const setCookieMock = (Cookies.set as jest.Mock).mockImplementation(
      () => {}
    );

    renderPage();

    await waitFor(() => expect(closeModal).toHaveBeenCalled());

    expect(setCookieMock).toHaveBeenCalledWith('role', 'JOB_SEEKER');

    expect(
      await screen.findByText(/your next level profile/i)
    ).toBeInTheDocument();
  });

  test('shows error box when server error and status != 403,404', async () => {
    const closeModal = jest.fn();
    const openModal = jest.fn();

    const { useModalStore } = require('@/store/modalSlice');
    useModalStore.mockImplementation((selector) =>
      selector({
        openModal,
        closeModal,
      })
    );

    (getProfile as jest.Mock).mockRejectedValue({
      status: 500,
      message: 'Server exploded',
    });

    renderPage();

    // UI error should show
    expect(
      await screen.findByText(/error loading profile/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/server exploded/i)).toBeInTheDocument();

    // openModal must NOT be called
    expect(openModal).not.toHaveBeenCalled();

    // closeModal IS called — exactly once (cleanup)
    expect(closeModal).toHaveBeenCalledTimes(1);

    // cookies not changed
    expect(Cookies.set).not.toHaveBeenCalled();
  });

  test('opens modal when profile does not exist (404)', async () => {
    const openModal = jest.fn();
    const closeModal = jest.fn();

    const { useModalStore } = require('@/store/modalSlice');
    useModalStore.mockImplementation((selector) =>
      selector({
        openModal,
        closeModal,
      })
    );

    (getProfile as jest.Mock).mockRejectedValue({
      status: 404,
      message: 'Profile missing',
    });

    renderPage();

    await waitFor(() => {
      expect(openModal).toHaveBeenCalledTimes(1);
    });

    // No ProfileContainer
    expect(
      screen.queryByText(/your next level profile/i)
    ).not.toBeInTheDocument();
  });

  test('403 error should NOT render error message and NOT open modal', async () => {
    const openModal = jest.fn();
    const closeModal = jest.fn();

    const { useModalStore } = require('@/store/modalSlice');
    useModalStore.mockImplementation((selector) =>
      selector({
        openModal,
        closeModal,
      })
    );

    (getProfile as jest.Mock).mockRejectedValue({
      status: 403,
      message: 'Forbidden',
    });

    renderPage();

    // Should NOT display error box
    expect(
      screen.queryByText(/error loading profile/i)
    ).not.toBeInTheDocument();

    // Should NOT open modal
    expect(openModal).not.toHaveBeenCalled();

    // Should not show profile
    expect(
      screen.queryByText(/your next level profile/i)
    ).not.toBeInTheDocument();
  });

  test('returns null if profileData is null', async () => {
    const openModal = jest.fn();
    const closeModal = jest.fn();

    const { useModalStore } = require('@/store/modalSlice');
    useModalStore.mockImplementation((selector) =>
      selector({
        openModal,
        closeModal,
      })
    );

    (getProfile as jest.Mock).mockResolvedValue(null);

    renderPage();

    // Should render nothing
    await waitFor(() => {
      expect(
        screen.queryByText(/your next level profile/i)
      ).not.toBeInTheDocument();
    });

    expect(openModal).not.toHaveBeenCalled();
    expect(closeModal).not.toHaveBeenCalled();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const openModalMock = jest.fn();
const closeModalMock = jest.fn();

jest.mock('@/store/modalSlice', () => ({
  useModalStore: (fn: any) =>
    fn({
      openModal: openModalMock,
      closeModal: closeModalMock,
    }),
}));

const setCookieMock = jest.fn();

jest.mock('js-cookie', () => ({
  set: (...args) => setCookieMock(...args),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock(
  '@/components/RecruiterProfileItems/RecruiterProfileContainer',
  () => (props: any) => (
    <div>RecruiterProfileContainer {props.recruiterData?.id}</div>
  )
);

jest.mock('@/components/ProfileItems/ProfileFormModal', () => {
  function ProfileFormModalMock(props: any) {
    return <div>ProfileFormModal {props.role}</div>;
  }
  return ProfileFormModalMock;
});

jest.mock('@/services/recruiterProfileService', () => ({
  getMyRecruiterProfile: jest.fn(),
}));

import RecruiterProfilePage from '@/app/my-profile/recruiter/page';
import { getMyRecruiterProfile } from '@/services/recruiterProfileService';

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <RecruiterProfilePage />
    </QueryClientProvider>
  );
}

describe('RecruiterProfilePage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens modal when profile is missing (404)', async () => {
    (getMyRecruiterProfile as jest.Mock).mockRejectedValue({
      status: 404,
      message: 'Not found',
    });

    renderPage();

    await waitFor(() => {
      expect(openModalMock).toHaveBeenCalledTimes(1);
    });

    const modalElement = openModalMock.mock.calls[0][0];

    expect(modalElement.props.role).toBe('recruiter');
  });

  test('displays error message for non-403 errors', async () => {
    (getMyRecruiterProfile as jest.Mock).mockRejectedValue({
      status: 500,
      message: 'Server error',
    });

    renderPage();

    expect(
      await screen.findByText(/error loading profile/i)
    ).toBeInTheDocument();

    expect(screen.getByText(/server error/i)).toBeInTheDocument();
  });

  test('renders profile and sets cookies on success', async () => {
    (getMyRecruiterProfile as jest.Mock).mockResolvedValue({
      id: 10,
      role: 'HR_MANAGER',
      name: 'John Doe',
    });

    renderPage();

    expect(
      await screen.findByText(/RecruiterProfileContainer 10/i)
    ).toBeInTheDocument();

    expect(setCookieMock).toHaveBeenCalledWith('role', 'RECRUITER');
    expect(setCookieMock).toHaveBeenCalledWith('recruiter-role', 'HR_MANAGER');

    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });

  test('returns null while loading', async () => {
    (getMyRecruiterProfile as jest.Mock).mockReturnValue(new Promise(() => {}));

    const view = renderPage();

    expect(view.container.innerHTML).toBe('');
  });
});

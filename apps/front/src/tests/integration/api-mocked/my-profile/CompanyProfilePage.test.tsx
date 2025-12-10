/**
 * @jest-environment jsdom
 */

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
  '@/components/CompanyProfileItems/CompanyProfileContainer',
  () => (props: any) => (
    <div>CompanyProfileContainer {props.companyData?.id}</div>
  )
);

jest.mock('@/components/ProfileItems/ProfileFormModal', () => {
  function ProfileFormModalMock(props: any) {
    return <div>ProfileFormModal {props.role}</div>;
  }
  return ProfileFormModalMock;
});

jest.mock('@/services/companyProfileService', () => ({
  getMyCompanyProfile: jest.fn(),
}));

import CompanyProfilePage from '@/app/my-profile/recruiter/company/CompanyProfilePage';
import { getMyCompanyProfile } from '@/services/companyProfileService';

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <CompanyProfilePage />
    </QueryClientProvider>
  );
}

describe('CompanyProfilePage tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens modal when profile is forbidden (403)', async () => {
    (getMyCompanyProfile as jest.Mock).mockRejectedValue({
      status: 403,
      message: 'Forbidden',
    });

    renderPage();

    await waitFor(() => {
      expect(openModalMock).toHaveBeenCalledTimes(1);
    });

    const modalElement = openModalMock.mock.calls[0][0];

    expect(modalElement.props.role).toBe('company');
  });

  test('displays error message for non-403 errors', async () => {
    (getMyCompanyProfile as jest.Mock).mockRejectedValue({
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
    (getMyCompanyProfile as jest.Mock).mockResolvedValue({
      id: 55,
      companyName: 'ACME',
    });

    renderPage();

    expect(
      await screen.findByText(/CompanyProfileContainer 55/i)
    ).toBeInTheDocument();

    expect(setCookieMock).toHaveBeenCalledWith('role', 'RECRUITER');
    expect(setCookieMock).toHaveBeenCalledWith('company-id', 55);

    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });

  test('returns null while loading', async () => {
    (getMyCompanyProfile as jest.Mock).mockReturnValue(new Promise(() => {}));

    const view = renderPage();

    expect(view.container.innerHTML).toBe('');
  });
});

import { render, waitFor } from '@testing-library/react';
import CompanyInvitationPage from '@/app/company-invitation/page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useSearchParams, useRouter } from 'next/navigation';
import { acceptInvite } from '@/services/recruiterProfileService';
import { useModalStore } from '@/store/modalSlice';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/services/recruiterProfileService');

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <CompanyInvitationPage />
    </QueryClientProvider>
  );
}

describe('CompanyInvitationPage — Integration Tests (API-mocked)', () => {
  const replaceMock = jest.fn();
  const openModalMock = jest.fn();
  const closeModalMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      replace: replaceMock,
    });

    (useModalStore as jest.Mock).mockImplementation((selector) =>
      selector({
        openModal: openModalMock,
        closeModal: closeModalMock,
      })
    );
  });

  test('opens modal with "loading" status while loading', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'abc123',
    });

    (acceptInvite as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(openModalMock).toHaveBeenCalledWith(expect.anything(), true);
  });

  test('redirects to company page when invitation accepted (success)', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'abc123',
    });

    (acceptInvite as jest.Mock).mockResolvedValue({ success: true });

    renderPage();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/my-profile/recruiter/company');
    });
  });

  test('redirects to recruiter profile on 403 error', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'abc123',
    });

    (acceptInvite as jest.Mock).mockRejectedValue({
      status: 403,
      message: 'Forbidden',
    });

    renderPage();

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/my-profile/recruiter');
    });
  });

  test('opens modal with "error" status on general error', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'abc123',
    });

    (acceptInvite as jest.Mock).mockRejectedValue({
      status: 500,
      message: 'Server error',
    });

    renderPage();

    await waitFor(() => {
      expect(openModalMock).toHaveBeenCalledWith(expect.anything(), true);
    });
  });

  test('does nothing when token is missing', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
    });

    renderPage();

    expect(openModalMock).not.toHaveBeenCalled();
    expect(acceptInvite).not.toHaveBeenCalled();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});

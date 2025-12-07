import { render, waitFor } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useModalStore } from '@/store/modalSlice';

import CompanyInvitationPage from '@/app/company-invitation/page';

// ---- Моки ----
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

jest.mock(
  '@/components/CompanyProfileItems/CompanyInvitationModal',
  () => () => <div>ModalMock</div>
);

describe('CompanyInvitationPage routing behaviour', () => {
  let pushMock: jest.Mock;
  let replaceMock: jest.Mock;
  let openModalMock: jest.Mock;
  let closeModalMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    replaceMock = jest.fn();
    openModalMock = jest.fn();
    closeModalMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
      replace: replaceMock,
    });

    (useModalStore as jest.Mock).mockReturnValue((cb: any) => {
      // возвращаем функции стейта
      if (cb.name === 'openModal') return openModalMock;
      if (cb.name === 'closeModal') return closeModalMock;
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------- SUCCESS case ----------
  it('redirects to company page on success', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'token123',
    });

    (useQuery as jest.Mock).mockReturnValue({
      isSuccess: true,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<CompanyInvitationPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/my-profile/recruiter/company');
    });
  });

  // ---------- 403 ERROR case ----------
  it('redirects to recruiter profile if error status=403', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'token123',
    });

    (useQuery as jest.Mock).mockReturnValue({
      isSuccess: false,
      isLoading: false,
      isError: true,
      error: { status: 403 },
    });

    render(<CompanyInvitationPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith('/my-profile/recruiter');
    });
  });
});

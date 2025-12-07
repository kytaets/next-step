import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@/store/modalSlice';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import CompanyProfileForm from '@/components/CompanyProfileItems/CompanyProfileForm';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

jest.mock('@/services/companyProfileService', () => ({
  createCompanyProfile: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  set: jest.fn(),
}));

// Позбавляємось анімацій
jest.mock('@/components/HoveredItem/HoveredItem', () => ({ children }: any) => (
  <div>{children}</div>
));

describe('CompanyProfileForm routing', () => {
  it('calls router.refresh() after successful profile creation', async () => {
    const refreshMock = jest.fn();
    const closeModalMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      refresh: refreshMock,
    });

    (useModalStore as jest.Mock).mockReturnValue(closeModalMock);

    const mutateMock = jest.fn();
    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => ({
      mutate: () => mutateMock() || onSuccess({ status: 'success' }),
      isPending: false,
    }));

    const { getByText } = render(<CompanyProfileForm />);

    fireEvent.click(getByText('Create Profile'));

    await waitFor(() => {
      expect(refreshMock).toHaveBeenCalled();
      expect(closeModalMock).toHaveBeenCalled();
      expect(Cookies.set).toHaveBeenCalledWith('recruiter-role', 'ADMIN');
    });
  });
});

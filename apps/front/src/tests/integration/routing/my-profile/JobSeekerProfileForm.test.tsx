import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModalStore } from '@/store/modalSlice';
import Cookies from 'js-cookie';

import JobSeekerProfileForm from '@/components/ProfileItems/JobSeekerProfileForm';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

jest.mock('@/services/jobseekerService', () => ({
  createProfile: jest.fn(),
}));

jest.mock('@/utils/profileValidation', () => ({
  validateProfileForm: jest.fn(() => ({})),
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({ children }: any) => (
  <div>{children}</div>
));

describe('JobSeekerProfileForm routing', () => {
  it('redirects to /my-profile/job-seeker after successful profile creation', async () => {
    const pushMock = jest.fn();
    const closeModalMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useModalStore as jest.Mock).mockReturnValue(closeModalMock);

    const mutateMock = jest.fn();
    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => ({
      mutate: () => mutateMock() || onSuccess({ status: 'success' }),
      isPending: false,
    }));

    const { getByText } = render(<JobSeekerProfileForm />);

    fireEvent.click(getByText('Create Profile'));

    await waitFor(() => {
      expect(closeModalMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/my-profile/job-seeker');
    });
  });
});

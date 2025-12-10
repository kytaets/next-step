import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModalStore } from '@/store/modalSlice';

import RecruiterProfileForm from '@/components/ProfileItems/RecruiterProfileForm';

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

jest.mock('@/services/recruiterProfileService', () => ({
  createRecruiterProfile: jest.fn(),
}));

jest.mock('@/utils/recruiterValidation', () => ({
  validateCreateRecruiterForm: jest.fn(() => ({})),
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({ children }: any) => (
  <div>{children}</div>
));

describe('RecruiterProfileForm routing', () => {
  it('redirects to /my-profile/recruiter after successful profile creation', async () => {
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

    const { getByText } = render(<RecruiterProfileForm />);

    fireEvent.click(getByText('Create Profile'));

    await waitFor(() => {
      expect(closeModalMock).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/my-profile/recruiter');
    });
  });
});

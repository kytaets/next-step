import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecruiterProfileForm from '@/components/ProfileItems/RecruiterProfileForm';
import { useMutation } from '@tanstack/react-query';
import { useModalStore } from '@/store/modalSlice';
import { useRouter } from 'next/navigation';

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

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <span>{props.children}</span>
));

describe('RecruiterProfileForm Component', () => {
  const mockCloseModal = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useModalStore as jest.Mock).mockReturnValue(mockCloseModal);
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  test('submits successfully and closes modal + redirects', async () => {
    let onSuccessCallback: any = null;

    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => {
      onSuccessCallback = onSuccess;
      return {
        mutate: jest.fn(() => onSuccessCallback()),
        isPending: false,
      };
    });

    render(<RecruiterProfileForm />);

    fireEvent.change(screen.getByPlaceholderText('Bob'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('Coolman'), {
      target: { value: 'Doe' },
    });

    fireEvent.click(screen.getByText('Create Profile'));

    await waitFor(() => {
      expect(mockCloseModal).toHaveBeenCalled();
    });

    expect(mockPush).toHaveBeenCalledWith('/my-profile/recruiter');
  });

  test('shows server error', async () => {
    let onErrorCallback: any = null;

    (useMutation as jest.Mock).mockImplementation(({ onError }) => {
      onErrorCallback = onError;
      return {
        mutate: jest.fn(() => onErrorCallback(new Error('Server crashed'))),
        isPending: false,
      };
    });

    render(<RecruiterProfileForm />);

    fireEvent.change(screen.getByPlaceholderText('Bob'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByPlaceholderText('Coolman'), {
      target: { value: 'Doe' },
    });

    fireEvent.click(screen.getByText('Create Profile'));

    await waitFor(() =>
      expect(screen.getByText('Server crashed')).toBeInTheDocument()
    );
  });
});

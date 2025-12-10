import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import JobSeekerProfileForm from '@/components/ProfileItems/JobSeekerProfileForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useModalStore } from '@/store/modalSlice';
import { useRouter } from 'next/navigation';
import { validateProfileForm } from '@/utils/profileValidation';

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

jest.mock('@/utils/profileValidation', () => ({
  validateProfileForm: jest.fn(),
}));

jest.mock('@/components/MessageBox/MessageBox', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('JobSeekerProfileForm', () => {
  let mutateMock: jest.Mock;
  const invalidateMock = jest.fn();
  const closeModalMock = jest.fn();
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mutateMock = jest.fn();

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: invalidateMock,
    });

    (validateProfileForm as jest.Mock).mockReturnValue({});

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useModalStore as jest.Mock).mockImplementation((selector) =>
      selector({ closeModal: closeModalMock })
    );

    (useMutation as jest.Mock).mockReturnValue({
      mutate: (values: any) => mutateMock(values),
      isPending: false,
    });
  });

  test('renders all input fields', () => {
    render(<JobSeekerProfileForm />);

    expect(screen.getByPlaceholderText('Bob')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Coolman')).toBeInTheDocument();

    const dateInput = document.querySelector('input[name="dateOfBirth"]');
    expect(dateInput).toBeTruthy();
  });

  test('submits form successfully and triggers redirect', async () => {
    mutateMock.mockImplementation((values) => {
      useMutation.mock.calls[0][0].onSuccess({ status: 'success' });
    });

    render(<JobSeekerProfileForm />);

    fireEvent.change(screen.getByPlaceholderText('Bob'), {
      target: { value: 'John' },
    });

    fireEvent.change(screen.getByPlaceholderText('Coolman'), {
      target: { value: 'Doe' },
    });

    const dateInput = document.querySelector('input[name="dateOfBirth"]')!;
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } });

    fireEvent.click(screen.getByText('Create Profile'));

    await waitFor(() => expect(mutateMock).toHaveBeenCalled());

    expect(invalidateMock).toHaveBeenCalled();
    expect(closeModalMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/my-profile/job-seeker');
  });

  test('shows server error from mutation', async () => {
    mutateMock.mockImplementation(() => {
      useMutation.mock.calls[0][0].onSuccess({
        status: 'error',
        error: 'Server crashed',
      });
    });

    render(<JobSeekerProfileForm />);

    fireEvent.change(screen.getByPlaceholderText('Bob'), {
      target: { value: 'John' },
    });

    fireEvent.change(screen.getByPlaceholderText('Coolman'), {
      target: { value: 'Doe' },
    });

    const dateInput = document.querySelector('input[name="dateOfBirth"]')!;
    fireEvent.change(dateInput, { target: { value: '1990-01-01' } });

    fireEvent.click(screen.getByText('Create Profile'));

    expect(await screen.findByText('Server crashed')).toBeInTheDocument();
  });
});

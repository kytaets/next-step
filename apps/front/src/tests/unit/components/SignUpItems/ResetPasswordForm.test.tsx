import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import ResetPasswordForm from '@/components/SignUpItems/ResetPasswordForm';

// ---------------------------
// mock next/navigation
// ---------------------------
let mockToken: string | null = 'test-token';

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => mockToken,
  }),
}));

// ---------------------------
// mock framer-motion
// ---------------------------
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  },
}));

// ---------------------------
// mock HoveredItem
// ---------------------------
jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <div data-testid="mock-hovered">{props.children}</div>
));

// ---------------------------
// mock MessageBox
// ---------------------------
jest.mock('@/components/MessageBox/MessageBox', () => (props: any) => (
  <div data-testid="mock-messagebox">{props.children}</div>
));

// ---------------------------
// mock validation
// ---------------------------
let validationReturn: string[] = [];
jest.mock('@/utils/validation', () => ({
  checkPasswords: () => validationReturn,
}));

// ---------------------------
// mock resetPass API
// ---------------------------
const resetPassMock = jest.fn();
jest.mock('@/services/userService', () => ({
  resetPass: (...args: any) => resetPassMock(...args),
}));

// ---------------------------
// mock useMutation
// ---------------------------
let mutationState = {
  isError: false,
  isPending: false,
  isSuccess: false,
  mutate: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useMutation: () => mutationState,
}));

// ---------------------------
// Tests
// ---------------------------
describe('ResetPasswordForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validationReturn = [];
    mutationState = {
      isError: false,
      isPending: false,
      isSuccess: false,
      mutate: jest.fn(),
    };
    mockToken = 'test-token';
  });

  test('renders fields correctly', () => {
    render(<ResetPasswordForm />);

    expect(
      screen.getByPlaceholderText('Enter your password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Repeat your password')
    ).toBeInTheDocument();
  });

  test('shows validation errors when passwords invalid', () => {
    validationReturn = ['Passwords do not match'];

    render(<ResetPasswordForm />);

    const form =
      screen.getByRole('form', { hidden: true }) ??
      screen.getByTestId('mock-hovered').closest('form');
    fireEvent.submit(form!);

    expect(screen.getByTestId('mock-messagebox')).toHaveTextContent(
      'Passwords do not match'
    );
    expect(mutationState.mutate).not.toHaveBeenCalled();
  });

  test('submits valid data and calls resetPass', () => {
    validationReturn = [];

    render(<ResetPasswordForm />);

    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your password'), {
      target: { value: '12345678' },
    });

    const form =
      screen.getByRole('form', { hidden: true }) ??
      screen.getByTestId('mock-hovered').closest('form');
    fireEvent.submit(form!);

    expect(mutationState.mutate).toHaveBeenCalledWith({
      token: 'test-token',
      password: '12345678',
    });
  });

  test('shows error message on API failure', () => {
    mutationState.isError = true;

    render(<ResetPasswordForm />);

    expect(screen.getByTestId('mock-messagebox')).toHaveTextContent(
      'Failed to change your password'
    );
  });

  test('shows success message on API success', () => {
    mutationState.isSuccess = true;

    render(<ResetPasswordForm />);

    expect(screen.getByTestId('mock-messagebox')).toHaveTextContent(
      'Successfully changed your password!'
    );
  });

  test('shows pending message', () => {
    mutationState.isPending = true;

    render(<ResetPasswordForm />);

    expect(screen.getByTestId('mock-messagebox')).toHaveTextContent(
      'Wait while we changing your password...'
    );
  });
});

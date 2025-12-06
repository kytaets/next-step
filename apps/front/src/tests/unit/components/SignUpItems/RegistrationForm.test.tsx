import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import RegistrationForm from '@/components/SignUpItems/RegistrationForm';

// ---------------------------
// Mock next/navigation
// ---------------------------
const pushMock = jest.fn();
let searchStep: string | null = 'account';

jest.spyOn(console, 'log').mockImplementation(() => {});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: () => searchStep }),
}));

// ---------------------------
// Mock CreateAccountItem — includes real inputs
// ---------------------------
jest.mock('@/components/SignUpItems/CreateAccountItem', () => (props: any) => (
  <div data-testid="mock-create-account">
    <input placeholder="Enter your e-mail address" name="email" />
    <input placeholder="Create a cool password" name="password" />
    <input placeholder="Repeat your cool password" name="confirm" />

    {props.errors?.length > 0 && (
      <div data-testid="mock-errors">{props.errors.join(', ')}</div>
    )}

    <button type="submit">Create account</button>
  </div>
));

// ---------------------------
// Mock ConfirmBoxItem
// ---------------------------
jest.mock('@/components/SignUpItems/ConfirmBoxItem', () => (props: any) => (
  <div data-testid="mock-confirm">Confirm: {props.email}</div>
));

// ---------------------------
// Mock validation
// ---------------------------
let validationErrorsMock: string[] = [];
jest.mock('@/utils/validation', () => ({
  validateRegistrationForm: () => validationErrorsMock,
}));

// ---------------------------
// Mock registerUser
// ---------------------------
const registerMock = jest.fn();
jest.mock('@/services/userService', () => ({
  registerUser: (...args: any) => registerMock(...args),
}));

// ---------------------------
// Mock react-query useMutation
// ---------------------------
let mutationConfig: any = null;

jest.mock('@tanstack/react-query', () => ({
  useMutation: (opts: any) => {
    mutationConfig = opts;
    return {
      mutate: async (payload: any) => {
        try {
          const result = await opts.mutationFn(payload);
          await opts.onSuccess(result);
        } catch (e) {
          opts.onError?.(e);
        }
      },
    };
  },
}));

// ---------------------------
// Tests
// ---------------------------
describe('RegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    validationErrorsMock = [];
    searchStep = 'account';
  });

  test('renders CreateAccountItem on step=account', () => {
    render(<RegistrationForm />);
    expect(screen.getByTestId('mock-create-account')).toBeInTheDocument();
  });

  test('does not render ConfirmBoxItem on step=account', () => {
    render(<RegistrationForm />);
    expect(screen.queryByTestId('mock-confirm')).not.toBeInTheDocument();
  });

  test('renders ConfirmBoxItem on step=confirm', () => {
    searchStep = 'confirm';
    render(<RegistrationForm />);
    expect(screen.getByTestId('mock-confirm')).toBeInTheDocument();
  });

  test('shows validation errors and does not call registerUser', () => {
    validationErrorsMock = ['Invalid email', 'Weak password'];

    const { container } = render(<RegistrationForm />);
    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    const errors = screen.getByTestId('mock-errors');
    expect(errors).toHaveTextContent('Invalid email, Weak password');
    expect(registerMock).not.toHaveBeenCalled();
  });

  test('calls registerUser when form is valid', async () => {
    validationErrorsMock = [];

    const { container } = render(<RegistrationForm />);

    fireEvent.change(screen.getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'test@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a cool password'), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your cool password'), {
      target: { value: '12345678' },
    });

    registerMock.mockResolvedValue({ status: 'success' });

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        email: 'test@mail.com',
        password: '12345678',
      });
    });

    expect(pushMock).toHaveBeenCalledWith('/sign-up?step=confirm');
  });

  test('handles registerUser error result by showing errors and not redirecting', async () => {
    validationErrorsMock = [];

    registerMock.mockResolvedValue({
      status: 'error',
      error: 'Email already exists',
    });

    const { container } = render(<RegistrationForm />);

    fireEvent.change(screen.getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'test@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a cool password'), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByPlaceholderText('Repeat your cool password'), {
      target: { value: '12345678' },
    });

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByTestId('mock-errors')).toHaveTextContent(
        'Email already exists'
      );
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});

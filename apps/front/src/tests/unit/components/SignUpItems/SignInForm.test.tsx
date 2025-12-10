import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SignInForm from '@/components/SignUpItems/SignInForm';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockSetIsLogged = jest.fn();

jest.mock('@/store/authSlice', () => ({
  useAuthStore: jest.fn((selector) =>
    selector({
      isLogged: false,
      setIsLogged: mockSetIsLogged,
    })
  ),
}));

const loginMock = jest.fn();
const forgotMock = jest.fn();

jest.mock('@/services/userService', () => ({
  loginUser: (...args: any[]) => loginMock(...args),
  forgetPass: (...args: any[]) => forgotMock(...args),
}));

jest.mock('@/utils/validation', () => ({
  validateLogInForm: jest.fn((data) => {
    const errors: string[] = [];
    if (!data.email || !data.email.includes('@'))
      errors.push('Invalid email address');
    if (!data.password || data.password.length < 6)
      errors.push('Password must be at least 6 characters');
    return errors;
  }),

  validateEmail: jest.fn((email) => {
    return !email || !email.includes('@');
  }),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(() => null),
}));

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>
  );
}

beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does NOT submit when validation fails', () => {
    renderWithQuery(<SignInForm />);

    fireEvent.click(screen.getByText('Sign In'));

    expect(loginMock).not.toHaveBeenCalled();

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    expect(screen.getByText(/password must/i)).toBeInTheDocument();
  });

  test('successful login triggers setIsLogged and navigation', async () => {
    loginMock.mockResolvedValue({ status: 'success' });

    renderWithQuery(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'test@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalled();
      expect(mockSetIsLogged).toHaveBeenCalledWith(true);
      expect(mockPush).toHaveBeenCalledWith('/my-profile');
    });
  });

  test('shows error on failed login', async () => {
    loginMock.mockResolvedValue({
      status: 'error',
      error: 'Invalid creds',
    });

    renderWithQuery(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'test@mail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Invalid creds')).toBeInTheDocument();
    });
  });

  test('forgot password with VALID email calls mutation', async () => {
    renderWithQuery(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'test@mail.com' },
    });

    fireEvent.click(screen.getByText('I have forgot my password'));

    await waitFor(() => {
      expect(forgotMock).toHaveBeenCalled();
      expect(forgotMock.mock.calls[0][0]).toEqual({ email: 'test@mail.com' });
    });
  });

  test('forgot password with INVALID email shows error', async () => {
    renderWithQuery(<SignInForm />);

    fireEvent.change(screen.getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'invalidEmail' },
    });

    fireEvent.click(screen.getByText('I have forgot my password'));

    expect(
      screen.getByText('Enter correct email to reset password')
    ).toBeInTheDocument();

    expect(forgotMock).not.toHaveBeenCalled();
  });
});

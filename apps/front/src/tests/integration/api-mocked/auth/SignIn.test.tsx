/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignInForm from '@/components/SignUpItems/SignInForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import { loginUser, forgetPass } from '@/services/userService';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/userService', () => ({
  loginUser: jest.fn(),
  forgetPass: jest.fn(),
}));

// prevent framer-motion props leaking into DOM
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) => {
      const {
        animate,
        initial,
        exit,
        transition,
        variants,
        whileHover,
        whileTap,
        ...clean
      } = rest;
      return <div {...clean}>{children}</div>;
    },
  },
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={client}>
      <SignInForm />
    </QueryClientProvider>
  );
}

describe('SignInForm — Integration Tests', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    jest.spyOn(Cookies, 'get').mockReturnValue(undefined);
  });

  test('shows validation errors when fields are empty', async () => {
    renderForm();

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(
      await screen.findByText(/invalid email address/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 6/i)
    ).toBeInTheDocument();
  });

  test('shows API error message from loginUser', async () => {
    (loginUser as jest.Mock).mockResolvedValue({
      status: 'error',
      error: 'Invalid password',
    });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your e-mail/i), {
      target: { value: 'user@mail.com' },
    });

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid password/i)).toBeInTheDocument();
  });

  test('redirects after successful login', async () => {
    (loginUser as jest.Mock).mockResolvedValue({
      status: 'success',
    });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your e-mail/i), {
      target: { value: 'user@mail.com' },
    });

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/my-profile');
    });
  });

  it('calls forgetPass with email when clicking "I have forgot my password"', async () => {
    renderForm(); // <-- викликаємо правильний рендер з QueryClientProvider

    fireEvent.change(
      screen.getByPlaceholderText(/enter your e-mail address/i),
      {
        target: { value: 'valid@mail.com' },
      }
    );

    fireEvent.click(screen.getByText(/i have forgot my password/i));

    await waitFor(() => {
      expect(forgetPass).toHaveBeenCalledTimes(1);
    });

    const vars = (forgetPass as jest.Mock).mock.calls[0][0];
    expect(vars).toEqual({ email: 'valid@mail.com' });
  });

  test('shows error when forgetPass returns server-side error', async () => {
    (forgetPass as jest.Mock).mockResolvedValue({
      status: 'error',
      error: 'Email not found',
    });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your e-mail/i), {
      target: { value: 'valid@mail.com' },
    });

    fireEvent.click(screen.getByText(/i have forgot my password/i));

    expect(await screen.findByText(/email not found/i)).toBeInTheDocument();
  });

  test('shows validation error if forgot password clicked with invalid email', async () => {
    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your e-mail/i), {
      target: { value: 'invalid-email' },
    });

    fireEvent.click(screen.getByText(/i have forgot my password/i));

    expect(
      await screen.findByText(/enter correct email to reset password/i)
    ).toBeInTheDocument();

    expect(forgetPass).not.toHaveBeenCalled();
  });
});

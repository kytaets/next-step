import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegistrationForm from '@/components/SignUpItems/RegistrationForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { registerUser } from '@/services/userService';
import { useRouter, useSearchParams } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/services/userService', () => ({
  registerUser: jest.fn(),
}));

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
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

function renderForm(step: string = 'account') {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  (useSearchParams as jest.Mock).mockReturnValue({
    get: () => step,
  });

  return render(
    <QueryClientProvider client={client}>
      <RegistrationForm />
    </QueryClientProvider>
  );
}

describe('RegistrationForm – Integration Tests', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  test('renders CreateAccountItem when step=account', () => {
    renderForm('account');
    expect(screen.getByText(/step 1: registration/i)).toBeInTheDocument();
  });

  test('shows validation errors when submitting empty form', async () => {
    renderForm('account');

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(/invalid email address/i)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 6/i)
    ).toBeInTheDocument();
  });

  test('shows API error when registerUser returns error', async () => {
    (registerUser as jest.Mock).mockResolvedValue({
      status: 'error',
      error: 'Email already exists',
    });

    renderForm('account');

    fireEvent.change(
      screen.getByPlaceholderText(/enter your e-mail address/i),
      {
        target: { value: 'user@mail.com' },
      }
    );

    fireEvent.change(screen.getByPlaceholderText(/create a cool password/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(
      screen.getByPlaceholderText(/repeat your cool password/i),
      {
        target: { value: 'password123' },
      }
    );

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(/email already exists/i)
    ).toBeInTheDocument();
  });

  test('redirects to confirm step after successful registration', async () => {
    (registerUser as jest.Mock).mockResolvedValue({ status: 'success' });

    renderForm('account');

    fireEvent.change(
      screen.getByPlaceholderText(/enter your e-mail address/i),
      {
        target: { value: 'user@mail.com' },
      }
    );

    fireEvent.change(screen.getByPlaceholderText(/create a cool password/i), {
      target: { value: 'password123' },
    });

    fireEvent.change(
      screen.getByPlaceholderText(/repeat your cool password/i),
      {
        target: { value: 'password123' },
      }
    );

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/sign-up?step=confirm');
    });
  });

  test('renders ConfirmBoxItem when step=confirm', () => {
    renderForm('confirm');

    expect(screen.getByText(/please check your inbox/i)).toBeInTheDocument();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResetPasswordForm from '@/components/SignUpItems/ResetPasswordForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useSearchParams } from 'next/navigation';
import { resetPass } from '@/services/userService';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/services/userService', () => ({
  resetPass: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) => {
      const {
        whileHover,
        animate,
        exit,
        initial,
        transition,
        variants,
        ...clean
      } = rest;
      return <div {...clean}>{children}</div>;
    },
  },
}));

function renderForm() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <ResetPasswordForm />
    </QueryClientProvider>
  );
}

describe('ResetPasswordForm — Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'mock-token',
    });
  });

  test('renders the form', () => {
    renderForm();

    expect(
      screen.getByRole('form', { name: /reset-form/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
  });

  test('shows validation errors when passwords do not match', async () => {
    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: '123456' },
    });

    fireEvent.change(screen.getByPlaceholderText(/repeat your password/i), {
      target: { value: '000000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    expect(
      await screen.findByText(/passwords do not match/i)
    ).toBeInTheDocument();

    expect(resetPass).not.toHaveBeenCalled();
  });

  test('calls resetPass with correct params on submit', async () => {
    (resetPass as jest.Mock).mockImplementation(async (vars) => vars);

    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.change(screen.getByPlaceholderText(/repeat your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    await waitFor(() => {
      expect(resetPass).toHaveBeenCalledTimes(1);

      const vars = resetPass.mock.calls[0][0];
      expect(vars).toEqual({
        token: 'mock-token',
        password: 'abc123',
      });
    });
  });

  test('shows loading message during mutation', async () => {
    (resetPass as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.change(screen.getByPlaceholderText(/repeat your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    expect(
      await screen.findByText(/wait while we changing your password/i)
    ).toBeInTheDocument();
  });

  test('shows success message when mutation succeeds', async () => {
    (resetPass as jest.Mock).mockResolvedValue({ ok: true });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.change(screen.getByPlaceholderText(/repeat your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    expect(
      await screen.findByText(/successfully changed your password/i)
    ).toBeInTheDocument();

    expect(screen.getByRole('link')).toHaveAttribute('href', 'sign-in');
  });

  test('shows error message when mutation fails', async () => {
    (resetPass as jest.Mock).mockRejectedValue(new Error('Server error'));

    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.change(screen.getByPlaceholderText(/repeat your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    expect(
      await screen.findByText(/failed to change your password/i)
    ).toBeInTheDocument();
  });

  test('does not call API when token is missing', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
    });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.change(screen.getByPlaceholderText(/repeat your password/i), {
      target: { value: 'abc123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save password/i }));

    expect(resetPass).not.toHaveBeenCalled();
  });
});

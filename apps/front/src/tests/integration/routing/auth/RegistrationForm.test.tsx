import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import RegistrationForm from '@/components/SignUpItems/RegistrationForm';
import { registerUser } from '@/services/userService';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('@/services/userService', () => ({
  registerUser: jest.fn(),
}));

jest.mock('@/utils/validation', () => ({
  validateRegistrationForm: jest.fn((data) => {
    const errors = [];
    if (!data.email) errors.push('Email required');
    if (!data.password) errors.push('Password required');
    return errors;
  }),
}));

// отключаем анимацию фрэймера
jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/SignUpItems/CreateAccountItem', () => (props: any) => (
  <div>
    CreateAccountMock
    <input
      name="email"
      placeholder="Email"
      defaultValue=""
      onChange={() => {}}
    />
    <input
      name="password"
      placeholder="Password"
      defaultValue=""
      onChange={() => {}}
    />
    {props.errors?.map((e: string) => <div key={e}>{e}</div>)}
    <button type="submit">SubmitMock</button>
  </div>
));

jest.mock('@/components/SignUpItems/ConfirmBoxItem', () => ({ email }: any) => (
  <div>ConfirmMock: {email}</div>
));

describe('RegistrationForm routing and behaviour', () => {
  let pushMock: jest.Mock;
  let mutateMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    mutateMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    // mock step=account by default
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'account',
    });

    (useMutation as jest.Mock).mockImplementation(
      ({ mutationFn, onSuccess }) => {
        if (mutationFn === registerUser) {
          return {
            mutate: (payload: any) => mutateMock(payload, { onSuccess }),
          };
        }
        return { mutate: jest.fn() };
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------- UI DISPLAY ----------
  it('renders CreateAccountItem when step=account', () => {
    const { getByText } = render(<RegistrationForm />);
    expect(getByText('CreateAccountMock')).toBeInTheDocument();
  });

  it('renders ConfirmBoxItem when step=confirm', () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'confirm',
    });

    const { getByText } = render(<RegistrationForm />);
    expect(getByText('ConfirmMock:')).toBeInTheDocument();
  });

  // ---------- SUCCESS REGISTER ----------
  it('redirects to /sign-up?step=confirm after successful registration', async () => {
    mutateMock.mockImplementation((_, { onSuccess }) =>
      onSuccess({ status: 'success' })
    );

    const { getByPlaceholderText, getByText } = render(<RegistrationForm />);

    fireEvent.change(getByPlaceholderText('Email'), {
      target: { value: 'new@mail.com' },
    });
    fireEvent.change(getByPlaceholderText('Password'), {
      target: { value: 'strongpass' },
    });

    fireEvent.submit(getByText('CreateAccountMock').closest('form')!);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/sign-up?step=confirm');
    });
  });
});

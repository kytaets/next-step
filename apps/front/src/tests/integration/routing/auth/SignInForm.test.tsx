import { render, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import SignInForm from '@/components/SignUpItems/SignInForm';
import { loginUser, forgetPass } from '@/services/userService';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
}));

jest.mock('@/store/authSlice', () => ({
  useAuthStore: jest.fn((cb) =>
    cb({
      setIsLogged: jest.fn(),
    })
  ),
}));

jest.mock('@/services/userService', () => ({
  loginUser: jest.fn(),
  forgetPass: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: { div: ({ children }: any) => <div>{children}</div> },
}));

jest.mock('@/utils/validation', () => ({
  validateEmail: jest.fn((email) => !email.includes('@')),
  validateLogInForm: jest.fn((data) => {
    const errors: any = {};
    if (!data.email) errors.email = 'Email is required';
    if (!data.password) errors.password = 'Password is required';
    return errors;
  }),
}));

describe('SignInForm routing and behaviour', () => {
  let pushMock: jest.Mock;
  let loginMutateMock: jest.Mock;
  let forgotPassMutateMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    loginMutateMock = jest.fn();
    forgotPassMutateMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useMutation as jest.Mock).mockImplementation(
      ({ mutationFn, onSuccess }) => {
        if (mutationFn === loginUser) {
          return {
            mutate: (data: any) => loginMutateMock(data, { onSuccess }),
          };
        }

        if (mutationFn === forgetPass) {
          return {
            mutate: (data: any) => forgotPassMutateMock(data, { onSuccess }),
          };
        }

        return { mutate: jest.fn() };
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('redirects job seeker to /my-profile/job-seeker after login', async () => {
    jest.spyOn(Cookies, 'get').mockReturnValue('JOB_SEEKER');

    loginMutateMock.mockImplementation((_, { onSuccess }: any) =>
      onSuccess({ status: 'success' })
    );

    const { getByPlaceholderText, getByText } = render(<SignInForm />);

    fireEvent.change(getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'test@mail.com' },
    });
    fireEvent.change(getByPlaceholderText('Enter your password'), {
      target: { value: '123456' },
    });

    fireEvent.click(getByText('Sign In'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/my-profile/job-seeker');
    });
  });

  it('redirects recruiter to /my-profile/recruiter after login', async () => {
    jest.spyOn(Cookies, 'get').mockReturnValue('RECRUITER');

    loginMutateMock.mockImplementation((_, { onSuccess }: any) =>
      onSuccess({ status: 'success' })
    );

    const { getByPlaceholderText, getByText } = render(<SignInForm />);

    fireEvent.change(getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'rec@mail.com' },
    });
    fireEvent.change(getByPlaceholderText('Enter your password'), {
      target: { value: '123456' },
    });

    fireEvent.click(getByText('Sign In'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/my-profile/recruiter');
    });
  });

  it('redirects to /my-profile if no role cookie is set', async () => {
    jest.spyOn(Cookies, 'get').mockReturnValue(undefined);

    loginMutateMock.mockImplementation((_, { onSuccess }: any) =>
      onSuccess({ status: 'success' })
    );

    const { getByPlaceholderText, getByText } = render(<SignInForm />);

    fireEvent.change(getByPlaceholderText('Enter your e-mail address'), {
      target: { value: 'user@mail.com' },
    });
    fireEvent.change(getByPlaceholderText('Enter your password'), {
      target: { value: '123456' },
    });

    fireEvent.click(getByText('Sign In'));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/my-profile');
    });
  });
});

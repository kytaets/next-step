import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ConfirmBoxItem from '@/components/SignUpItems/ConfirmBoxItem';

jest.mock('next/image', () => {
  return function MockedImage(props: any) {
    const { priority, ...rest } = props;
    return <img {...rest} />;
  };
});

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  },
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <div data-testid="mock-hovered">{props.children}</div>
));

jest.mock('@/components/MessageBox/MessageBox', () => (props: any) => (
  <div data-testid="mock-messagebox">{props.children}</div>
));

const resendMock = jest.fn();
jest.mock('@/services/userService', () => ({
  resendEmail: (...args: any) => resendMock(...args),
}));

let mutationState: any = {
  mutate: jest.fn(),
  isSuccess: false,
  isPending: false,
  isError: false,
};

jest.mock('@tanstack/react-query', () => ({
  useMutation: (opts: any) => {
    return {
      mutate: (val: any) => {
        mutationState.mutate(val);
        if (mutationState.isError) opts.onError?.({ message: 'err' });
        if (mutationState.isSuccess) opts.onSuccess?.({});
      },
      isPending: mutationState.isPending,
      isSuccess: mutationState.isSuccess,
      isError: mutationState.isError,
    };
  },
}));

describe('ConfirmBoxItem', () => {
  const email = 'test@example.com';

  beforeEach(() => {
    jest.clearAllMocks();
    mutationState = {
      mutate: jest.fn(),
      isSuccess: false,
      isPending: false,
      isError: false,
    };
  });

  test('renders base content', () => {
    render(<ConfirmBoxItem email={email} />);

    expect(screen.getByText('Step 2: Confirmation')).toBeInTheDocument();
    expect(
      screen.getByText(
        /Please check your inbox and click the confirmation link/i
      )
    ).toBeInTheDocument();
  });

  test('calls mutate when clicking "Resend Email"', () => {
    render(<ConfirmBoxItem email={email} />);

    const btn = screen.getByText('Resend Email');
    fireEvent.click(btn);

    expect(mutationState.mutate).toHaveBeenCalledWith({ email });
  });

  test('shows pending message', () => {
    mutationState.isPending = true;

    render(<ConfirmBoxItem email={email} />);

    expect(
      screen.getByText(/Wait while we’re sending you another letter/i)
    ).toBeInTheDocument();
  });

  test('shows success message', () => {
    mutationState.isSuccess = true;

    render(<ConfirmBoxItem email={email} />);

    expect(
      screen.getByText('We have sent you another confirmation letter')
    ).toBeInTheDocument();
  });

  test('shows error message', () => {
    mutationState.isError = true;

    render(<ConfirmBoxItem email={email} />);

    expect(
      screen.getByText('Failed to resend a confirmation letter')
    ).toBeInTheDocument();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import CreateAccountItem from '@/components/SignUpItems/CreateAccountItem';

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

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

describe('CreateAccountItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders inputs and static text', () => {
    render(<CreateAccountItem errors={[]} />);

    expect(screen.getByText('Step 1: Registration')).toBeInTheDocument();
    expect(
      screen.getByText('Create an account to start your journey')
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('Enter your e-mail address')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Create a cool password')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Repeat your cool password')
    ).toBeInTheDocument();

    expect(screen.getByText('Create account')).toBeInTheDocument();
  });

  test('renders error list if errors exist', () => {
    render(
      <CreateAccountItem errors={['Email is invalid', 'Password too short']} />
    );

    const msgs = screen.getAllByTestId('mock-messagebox');
    expect(msgs).toHaveLength(2);
    expect(msgs[0]).toHaveTextContent('Email is invalid');
    expect(msgs[1]).toHaveTextContent('Password too short');
  });

  test('clicking Go back triggers router.push("/sign-up?step=role")', () => {
    render(<CreateAccountItem errors={[]} />);

    const backButton = screen.getByText('Go back');
    fireEvent.click(backButton);

    expect(pushMock).toHaveBeenCalledWith('/sign-up?step=role');
  });

  test('submit button exists and is type="submit"', () => {
    render(<CreateAccountItem errors={[]} />);

    const submitBtn = screen.getByRole('button', { name: /create account/i });
    expect(submitBtn).toHaveAttribute('type', 'submit');
  });
});

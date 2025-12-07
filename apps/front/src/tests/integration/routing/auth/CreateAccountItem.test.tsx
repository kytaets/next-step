import { render, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import CreateAccountItem from '@/components/SignUpItems/CreateAccountItem';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  motion: { div: ({ children }: any) => <div>{children}</div> },
}));

describe('CreateAccountItem routing', () => {
  it('navigates back to role step when clicking "Go back"', () => {
    const pushMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    const { getByText } = render(<CreateAccountItem errors={[]} />);

    fireEvent.click(getByText('Go back'));

    expect(pushMock).toHaveBeenCalledWith('/sign-up?step=role');
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactLink from '@/components/ProfileItems/ContactLink';

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe('ContactLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns null for unknown type', () => {
    const { container } = render(<ContactLink type="unknown" url="x" />);
    expect(container.firstChild).toBeNull();
  });

  test('renders link for LinkedIn', () => {
    render(<ContactLink type="linkedinUrl" url="http://linkedin.com/me" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'http://linkedin.com/me');
  });

  test('renders link for GitHub', () => {
    render(<ContactLink type="githubUrl" url="http://github.com/me" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'http://github.com/me');
  });

  test('renders link for Telegram', () => {
    render(<ContactLink type="telegramUrl" url="https://t.me/me" />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://t.me/me');
  });

  test('copy button appears for publicEmail', () => {
    render(<ContactLink type="publicEmail" url="me@gmail.com" />);

    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('title', 'Click to copy publicEmail');
  });

  test('copy button appears for phoneNumber', () => {
    render(<ContactLink type="phoneNumber" url="+12345678" />);

    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('title', 'Click to copy phoneNumber');
  });

  test('clicking copy copies text to clipboard and shows tooltip', async () => {
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValueOnce(
      undefined
    );

    render(<ContactLink type="publicEmail" url="test@example.com" />);

    const btn = screen.getByRole('button');

    fireEvent.click(btn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'test@example.com'
    );

    expect(await screen.findByText('Copied!')).toBeInTheDocument();
  });

  test('tooltip disappears after 1500ms', async () => {
    jest.useFakeTimers();
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);

    render(<ContactLink type="publicEmail" url="test@example.com" />);

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('Copied!')).toBeInTheDocument();

    jest.advanceTimersByTime(1500);

    await waitFor(() => expect(screen.queryByText('Copied!')).toBeNull());

    jest.useRealTimers();
  });

  test('alerts on clipboard error', async () => {
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    (navigator.clipboard.writeText as jest.Mock).mockImplementation(() =>
      Promise.reject(new Error('ERR'))
    );

    render(<ContactLink type="publicEmail" url="test@example.com" />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith('Failed to copy')
    );
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import ConfirmPage from '@/app/confirm-page/ConfirmPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useSearchParams } from 'next/navigation';
import { checkUserConfirmed } from '@/services/userService';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

jest.mock('@/services/userService', () => ({
  checkUserConfirmed: jest.fn(),
}));

jest.mock('next/image', () => (props: any) => {
  const { priority, ...rest } = props;
  return <img {...rest} />;
});

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  },
}));

function renderPage() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <ConfirmPage />
    </QueryClientProvider>
  );
}

describe('ConfirmPage — Integration Tests (API-mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => 'mock-token',
    });
  });

  test('shows loading state initially', async () => {
    (checkUserConfirmed as jest.Mock).mockReturnValue(new Promise(() => {}));

    renderPage();

    expect(
      await screen.findByText(/Wait while we verifying your email/i)
    ).toBeInTheDocument();

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('loading-spin.gif')
    );
  });

  test('shows success state when verification succeeds', async () => {
    (checkUserConfirmed as jest.Mock).mockResolvedValue({ ok: true });

    renderPage();

    expect(
      await screen.findByText(/Your email was successfully verified!/i)
    ).toBeInTheDocument();

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('check-arrow.png')
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/sign-in');
  });

  test('shows error state when verification fails', async () => {
    (checkUserConfirmed as jest.Mock).mockRejectedValue(
      new Error('Verification failed')
    );

    renderPage();

    expect(await screen.findByText(/unable to verify/i)).toBeInTheDocument();

    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('black-on-white-cross.png')
    );
  });

  test('does nothing when token is missing', async () => {
    (useSearchParams as jest.Mock).mockReturnValue({
      get: () => null,
    });

    renderPage();

    expect(checkUserConfirmed).not.toHaveBeenCalled();

    expect(screen.queryByText(/verify/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sorry!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Wait while/i)).not.toBeInTheDocument();
  });
});

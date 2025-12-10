import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InvitationModal from '@/components/CompanyProfileItems/InvitationModal';

jest.mock('@/components/HoveredItem/HoveredItem', () => {
  return function MockAnimatedIcon({ children }: any) {
    return <span data-testid="animated-icon">{children}</span>;
  };
});

jest.mock('@/components/MessageBox/MessageBox', () => {
  return function MockMessageBox({ children }: any) {
    return <div data-testid="message-box">{children}</div>;
  };
});

const mockValidate = jest.fn(() => ({}));
jest.mock('@/utils/recruiterValidation', () => ({
  validateInvitationForm: (v: any) => mockValidate(v),
}));

const mockSendInvite = jest.fn();
jest.mock('@/services/companyProfileService', () => ({
  sendInvite: (data: any) => mockSendInvite(data),
}));

const mockUseMutation = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useMutation: (opts: any) => mockUseMutation(opts),
}));

describe('InvitationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('submits trimmed email', async () => {
    mockUseMutation.mockImplementation((opts) => ({
      mutate: (vars: any) => {
        opts.mutationFn(vars);
        opts.onSuccess?.({}, vars, undefined);
      },
      isSuccess: false,
      isError: false,
      isPending: false,
    }));

    render(<InvitationModal />);

    fireEvent.change(
      screen.getByPlaceholderText('Enter email to send invitation...'),
      { target: { value: '  user@example.com  ' } }
    );

    await act(async () => {
      fireEvent.submit(
        screen
          .getByRole('button', { name: /send invitation/i })
          .closest('form')!
      );
    });

    expect(mockSendInvite).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
  });

  test('shows validation error', async () => {
    mockValidate.mockReturnValueOnce({ email: 'Invalid email' });

    mockUseMutation.mockImplementation(() => ({
      mutate: jest.fn(),
      isSuccess: false,
      isError: false,
      isPending: false,
    }));

    render(<InvitationModal />);

    await act(async () => {
      fireEvent.submit(
        screen
          .getByRole('button', { name: /send invitation/i })
          .closest('form')!
      );
    });

    expect(await screen.findByText('Invalid email')).toBeInTheDocument();
    expect(mockSendInvite).not.toHaveBeenCalled();
  });

  test('shows server error', async () => {
    mockUseMutation.mockImplementation((opts) => ({
      mutate: () => {
        opts.onError?.({ message: 'Request failed' });
      },
      isSuccess: false,
      isError: true,
      isPending: false,
      error: { message: 'Request failed' },
    }));

    render(<InvitationModal />);

    await act(async () => {
      fireEvent.submit(
        screen
          .getByRole('button', { name: /send invitation/i })
          .closest('form')!
      );
    });

    expect(await screen.findByText('Request failed')).toBeInTheDocument();
  });

  test('shows success state', async () => {
    mockUseMutation.mockImplementation(() => ({
      mutate: jest.fn(),
      isSuccess: true,
      isError: false,
      isPending: false,
    }));

    render(<InvitationModal />);

    expect(
      screen.getByText('Invitation sent successfully!')
    ).toBeInTheDocument();
  });
});

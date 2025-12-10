import { render, screen, fireEvent } from '@testing-library/react';
import BottomRow from '@/components/ProfileItems/BottomRow';
import { isoToDate } from '@/utils/convertData';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '@/services/userService';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authSlice';
import Cookies from 'js-cookie';

jest.mock('@/utils/convertData', () => ({
  isoToDate: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/services/userService', () => ({
  logoutUser: jest.fn(),
}));

jest.mock('@/store/authSlice', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  remove: jest.fn(),
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('BottomRow', () => {
  const mockPush = jest.fn();
  const mockClear = jest.fn();
  const mockSetIsLogged = jest.fn();
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (useQueryClient as jest.Mock).mockReturnValue({
      clear: mockClear,
    });

    (useAuthStore as jest.Mock).mockReturnValue({
      setIsLogged: mockSetIsLogged,
    });

    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => ({
      mutate: () => {
        onSuccess();
        mockMutate();
      },
    }));

    (isoToDate as jest.Mock).mockReturnValue('Formatted date');
  });

  test('renders created date correctly', () => {
    render(<BottomRow isEditable data="2023-01-01" type="job-seeker" />);

    expect(screen.getByText(/With us from/)).toBeInTheDocument();
    expect(screen.getByText('Formatted date')).toBeInTheDocument();
  });

  test('shows switch account button when editable and type is recruiter', () => {
    render(<BottomRow isEditable data="2023-01-01" type="recruiter" />);

    expect(
      screen.getByRole('button', { name: /Change to job-seeker account/i })
    ).toBeInTheDocument();
  });

  test('does NOT show switch and logout buttons for company', () => {
    render(<BottomRow isEditable data="2023-01-01" type="company" />);

    expect(
      screen.queryByRole('button', { name: /Change to/i })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: /Log out from all devices/i })
    ).not.toBeInTheDocument();
  });

  test('triggers account change correctly', () => {
    render(<BottomRow isEditable data="2023-01-01" type="recruiter" />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /Change to job-seeker account/i,
      })
    );

    expect(mockPush).toHaveBeenCalledWith('job-seeker');
  });

  test('logs out from all devices when confirmed', () => {
    window.confirm = jest.fn().mockReturnValue(true);

    render(<BottomRow isEditable data="2023-01-01" type="job-seeker" />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /Log out from all devices/i,
      })
    );

    expect(mockClear).toHaveBeenCalled();
    expect(Cookies.remove).toHaveBeenCalledWith('sid');
    expect(Cookies.remove).toHaveBeenCalledWith('company-id');
    expect(mockSetIsLogged).toHaveBeenCalledWith(false);
    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  test('does NOT logout when cancelled', () => {
    window.confirm = jest.fn().mockReturnValue(false);

    render(<BottomRow isEditable data="2023-01-01" type="job-seeker" />);

    fireEvent.click(
      screen.getByRole('button', {
        name: /Log out from all devices/i,
      })
    );

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockClear).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

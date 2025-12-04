import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainHeader from '@/components/MainHeader/MainHeader';

// -------------------
// next/link mock
// -------------------
jest.mock('next/link', () => {
  return ({ href, children, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  );
});

// -------------------
// next/image mock
// -------------------
jest.mock('next/image', () => (props: any) => {
  return <img {...props} />;
});

// -------------------
// next/navigation mock
// -------------------
const mockPush = jest.fn();
const mockPathname = '/';

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
  }),
}));

// -------------------
// framer-motion mock
// -------------------
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

// -------------------
// zustand store mock
// -------------------
const mockSetIsLogged = jest.fn();

jest.mock('@/store/authSlice', () => ({
  useAuthStore: () => ({
    isLogged: true,
    setIsLogged: mockSetIsLogged,
  }),
}));

// -------------------
// js-cookie mock
// -------------------
import Cookies from 'js-cookie';

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  remove: jest.fn(),
}));

// -------------------
// react-query mocks
// -------------------
const mockMutate = jest.fn();
const mockClear = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    clear: mockClear,
  }),
  useMutation: () => ({
    mutate: mockMutate,
  }),
}));

// -------------------
// user service mock
// -------------------
jest.mock('@/services/userService', () => ({
  logoutUser: jest.fn(),
}));

describe('MainHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Cookies.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'role') return 'JOB_SEEKER';
      return null;
    });
  });

  test('renders logo and navigation', () => {
    render(<MainHeader />);

    expect(screen.getByText('Next Step')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /next step/i })).toHaveAttribute(
      'href',
      '/'
    );
  });

  test('renders Profile link for job seeker', () => {
    render(<MainHeader />);

    expect(screen.getByText('Profile')).toHaveAttribute(
      'href',
      '/my-profile/job-seeker'
    );
  });

  test('logout triggers confirm and mutation', () => {
    // mock confirm dialog
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<MainHeader />);

    fireEvent.click(screen.getByText('Log Out'));

    expect(window.confirm).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalled();
  });

  test('burger menu toggles mobile menu', () => {
    render(<MainHeader />);

    const burger = screen.getByRole('button', { name: '' });
    fireEvent.click(burger);

    const profiles = screen.getAllByText('Profile');
    const mobileProfile = profiles.find((p) =>
      p.classList.contains('mobile-item')
    );

    expect(mobileProfile).toBeInTheDocument();
  });

  test('mobile logout closes menu and triggers logout', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<MainHeader />);

    const burger = screen.getByRole('button', { name: '' });
    fireEvent.click(burger);

    const logoutBtns = screen.getAllByText('Log Out');

    const mobileLogoutBtn = logoutBtns.find((btn) =>
      btn.classList.contains('mobile-item')
    );

    fireEvent.click(mobileLogoutBtn!);

    expect(mockMutate).toHaveBeenCalled();
  });
});

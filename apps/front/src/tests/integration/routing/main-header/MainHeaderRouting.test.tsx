import { render, fireEvent, waitFor } from '@testing-library/react';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

const clearMock = jest.fn();
const setIsLoggedMock = jest.fn();
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/',
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: () => ({
    clear: clearMock,
  }),
}));

jest.mock('@/store/authSlice', () => ({
  useAuthStore: () => ({
    isLogged: true,
    setIsLogged: setIsLoggedMock,
  }),
}));

jest.mock('@/services/userService', () => ({
  logoutUser: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
  remove: jest.fn(),
}));

jest.mock('@/components/MainHeader/PageSelect', () => () => (
  <div>PageSelect</div>
));

import MainHeader from '@/components/MainHeader/MainHeader';

describe('MainHeader routing behavior', () => {
  it('redirects to /sign-in after successful logout', async () => {
    window.confirm = jest.fn(() => true);

    let onSuccessCapture: any;

    (useMutation as jest.Mock).mockImplementation(({ onSuccess }) => {
      onSuccessCapture = onSuccess;
      return { mutate: jest.fn() };
    });

    const { getByText } = render(<MainHeader />);

    fireEvent.click(getByText('Log Out'));

    onSuccessCapture({ statusCode: 200 });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/sign-in');
      expect(Cookies.remove).toHaveBeenCalledWith('sid');
      expect(Cookies.remove).toHaveBeenCalledWith('company-id');
      expect(clearMock).toHaveBeenCalled();
      expect(setIsLoggedMock).toHaveBeenCalledWith(false);
    });
  });
});

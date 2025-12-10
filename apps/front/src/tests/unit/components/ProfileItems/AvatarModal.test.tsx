import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AvatarModal from '@/components/ProfileItems/AvatarModal';
import { validateAvatarUrl } from '@/utils/profileValidation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

jest.mock('@/utils/profileValidation', () => ({
  validateAvatarUrl: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/services/jobseekerService', () => ({
  updatePersonalData: jest.fn(),
}));

jest.mock('@/services/companyProfileService', () => ({
  updateCompanyProfile: jest.fn(),
}));

jest.mock('@/services/recruiterProfileService', () => ({
  updateRecruiterProfile: jest.fn(),
}));

jest.mock('@/components/MessageBox/MessageBox', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

let mutationQueue: any[] = [];

(useMutation as jest.Mock).mockImplementation(
  ({ mutationFn, onSuccess, onError }) => {
    const wrapper = async (vars: any) => {
      try {
        const result = await mutationFn(vars);
        onSuccess?.(result);
      } catch (err: any) {
        onError?.(err);
      }
    };

    mutationQueue.push(wrapper);

    return {
      mutate: wrapper,
      isPending: false,
    };
  }
);

describe('AvatarModal', () => {
  const invalidateQueriesMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mutationQueue = [];

    (validateAvatarUrl as jest.Mock).mockReturnValue({});

    (useQueryClient as jest.Mock).mockReturnValue({
      invalidateQueries: invalidateQueriesMock,
    });
  });

  test('renders with initial URL', () => {
    render(<AvatarModal url="http://init.com/avatar.png" type="job-seeker" />);

    expect(screen.getByPlaceholderText('Enter avatar image URL')).toHaveValue(
      'http://init.com/avatar.png'
    );
  });

  test('shows validation error', async () => {
    (validateAvatarUrl as jest.Mock).mockReturnValue({
      url: 'Invalid URL',
    });

    render(<AvatarModal url="" type="job-seeker" />);

    fireEvent.change(screen.getByPlaceholderText('Enter avatar image URL'), {
      target: { value: 'bad' },
    });

    fireEvent.blur(screen.getByPlaceholderText('Enter avatar image URL'));

    expect(await screen.findByText('Invalid URL')).toBeInTheDocument();
  });

  test('submits correct job-seeker payload', async () => {
    const mockFn = require('@/services/jobseekerService').updatePersonalData;
    mockFn.mockResolvedValue({ status: 'success' });

    render(<AvatarModal url="" type="job-seeker" />);

    fireEvent.change(screen.getByPlaceholderText('Enter avatar image URL'), {
      target: { value: 'https://site.com/img.jpg' },
    });

    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() =>
      expect(mockFn).toHaveBeenCalledWith({
        avatarUrl: 'https://site.com/img.jpg',
      })
    );
  });

  test('submits correct company payload', async () => {
    const mockFn =
      require('@/services/companyProfileService').updateCompanyProfile;
    mockFn.mockResolvedValue({});

    render(<AvatarModal url="" type="company" />);

    fireEvent.change(screen.getByPlaceholderText('Enter avatar image URL'), {
      target: { value: 'http://company/logo.png' },
    });

    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() =>
      expect(mockFn).toHaveBeenCalledWith({
        logoUrl: 'http://company/logo.png',
      })
    );
  });

  test('submits correct recruiter payload', async () => {
    const mockFn =
      require('@/services/recruiterProfileService').updateRecruiterProfile;
    mockFn.mockResolvedValue({});

    render(<AvatarModal url="" type="recruiter" />);

    fireEvent.change(screen.getByPlaceholderText('Enter avatar image URL'), {
      target: { value: 'http://rec.com/a.jpg' },
    });

    fireEvent.click(screen.getByText('Save changes'));

    await waitFor(() =>
      expect(mockFn).toHaveBeenCalledWith({
        avatarUrl: 'http://rec.com/a.jpg',
      })
    );
  });

  test('button is disabled when loading AND shows Saving...', () => {
    (useMutation as jest.Mock).mockReturnValueOnce({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<AvatarModal url="" type="job-seeker" />);

    const btn = screen.getByRole('button');

    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('Saving');
  });

  test('shows server error', async () => {
    const mockFn =
      require('@/services/companyProfileService').updateCompanyProfile;
    mockFn.mockRejectedValue(new Error('Server exploded'));

    render(<AvatarModal url="" type="company" />);

    fireEvent.change(screen.getByPlaceholderText('Enter avatar image URL'), {
      target: { value: 'http://bad' },
    });

    fireEvent.click(screen.getByText('Save changes'));

    expect(await screen.findByText('Server exploded')).toBeInTheDocument();
  });
});

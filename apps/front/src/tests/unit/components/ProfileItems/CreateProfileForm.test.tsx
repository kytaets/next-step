import { render, screen } from '@testing-library/react';
import CreateProfileForm from '@/components/ProfileItems/CreateProfileForm';
import { useModalStore } from '@/store/modalSlice';

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

jest.mock('@/components/ProfileItems/ProfileFormModal', () => {
  const Mock = ({ role }: any) => (
    <div data-testid="profile-form-modal">ProfileForm:{role}</div>
  );
  Mock.displayName = 'ProfileFormModal';
  return { __esModule: true, default: Mock };
});

jest.mock('@/components/ProfileItems/ChooseRoleForm', () => {
  const Mock = () => <div data-testid="choose-role-form">ChooseRole</div>;
  Mock.displayName = 'ChooseRoleForm';
  return { __esModule: true, default: Mock };
});

describe('CreateProfileForm', () => {
  const openModalMock = jest.fn();
  const closeModalMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useModalStore as jest.Mock).mockImplementation((selector) =>
      selector({
        openModal: openModalMock,
        closeModal: closeModalMock,
      })
    );
  });

  test('opens modal with ChooseRoleForm when no role is provided', () => {
    render(<CreateProfileForm />);

    expect(openModalMock).toHaveBeenCalledTimes(1);

    const modalContent = openModalMock.mock.calls[0][0];

    expect(modalContent.type.displayName).toBe('ChooseRoleForm');
  });

  test('opens modal with ProfileFormModal when role is provided', () => {
    render(<CreateProfileForm role="job-seeker" />);

    expect(openModalMock).toHaveBeenCalledTimes(1);

    const modalContent = openModalMock.mock.calls[0][0];

    expect(modalContent.type.displayName).toBe('ProfileFormModal');
    expect(modalContent.props.role).toBe('job-seeker');
  });

  test('opens modal with second argument = true', () => {
    render(<CreateProfileForm role="recruiter" />);
    expect(openModalMock).toHaveBeenCalledWith(expect.anything(), true);
  });

  test('calls closeModal on unmount', () => {
    const { unmount } = render(<CreateProfileForm />);
    unmount();
    expect(closeModalMock).toHaveBeenCalledTimes(1);
  });

  test('renders default heading', () => {
    render(<CreateProfileForm />);
    expect(screen.getByText('No profile there yet')).toBeInTheDocument();
  });
});

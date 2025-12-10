import { render, screen, fireEvent } from '@testing-library/react';
import ChooseRoleForm from '@/components/ProfileItems/ChooseRoleForm';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

jest.mock('js-cookie', () => ({
  set: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

describe('ChooseRoleForm', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });
  });

  test('renders role options', () => {
    render(<ChooseRoleForm />);
    expect(screen.getByText('Choose your role')).toBeInTheDocument();
    expect(screen.getByText('Job Seeker')).toBeInTheDocument();
    expect(screen.getByText('Recruiter')).toBeInTheDocument();
  });

  test('selecting Job Seeker sets cookie and redirects', () => {
    render(<ChooseRoleForm />);

    const jobSeekerRadio = screen.getByDisplayValue('JOB_SEEKER');

    fireEvent.click(jobSeekerRadio);

    expect(Cookies.set).toHaveBeenCalledWith('role', 'JOB_SEEKER');
    expect(pushMock).toHaveBeenCalledWith('/my-profile/job-seeker');
  });

  test('selecting Recruiter sets cookie and redirects', () => {
    render(<ChooseRoleForm />);

    const recruiterRadio = screen.getByDisplayValue('RECRUITER');

    fireEvent.click(recruiterRadio);

    expect(Cookies.set).toHaveBeenCalledWith('role', 'RECRUITER');
    expect(pushMock).toHaveBeenCalledWith('/my-profile/recruiter');
  });
});

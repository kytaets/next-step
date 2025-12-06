import { render, screen } from '@testing-library/react';
import ProfileFormModal from '@/components/ProfileItems/ProfileFormModal';

jest.mock('@/components/ProfileItems/JobSeekerProfileForm', () => () => (
  <div data-testid="job-seeker-form">JobSeeker Form</div>
));
jest.mock('@/components/ProfileItems/RecruiterProfileForm', () => () => (
  <div data-testid="recruiter-form">Recruiter Form</div>
));
jest.mock('@/components/CompanyProfileItems/CompanyProfileForm', () => () => (
  <div data-testid="company-form">Company Form</div>
));

describe('ProfileFormModal Component', () => {
  test('renders JobSeekerProfileForm when role="job-seeker"', () => {
    render(<ProfileFormModal role="job-seeker" />);

    expect(screen.getByTestId('job-seeker-form')).toBeInTheDocument();
    expect(screen.queryByTestId('recruiter-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('company-form')).not.toBeInTheDocument();
  });

  test('renders RecruiterProfileForm when role="recruiter"', () => {
    render(<ProfileFormModal role="recruiter" />);

    expect(screen.getByTestId('recruiter-form')).toBeInTheDocument();
    expect(screen.queryByTestId('job-seeker-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('company-form')).not.toBeInTheDocument();
  });

  test('renders CompanyProfileForm when role="company"', () => {
    render(<ProfileFormModal role="company" />);

    expect(screen.getByTestId('company-form')).toBeInTheDocument();
    expect(screen.queryByTestId('job-seeker-form')).not.toBeInTheDocument();
    expect(screen.queryByTestId('recruiter-form')).not.toBeInTheDocument();
  });
});

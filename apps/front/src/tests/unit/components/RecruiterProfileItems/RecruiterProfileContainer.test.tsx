import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import RecruiterProfileContainer from '@/components/RecruiterProfileItems/RecruiterProfileContainer';

// -------------------------------
// Mock next/navigation
// -------------------------------
const pushMock = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// -------------------------------
// Mock child components
// -------------------------------
jest.mock('@/components/ProfileItems/Avatar', () => (props: any) => (
  <div data-testid="mock-avatar">Avatar: {props.data}</div>
));

jest.mock('@/components/ProfileItems/BottomRow', () => (props: any) => (
  <div data-testid="mock-bottom-row">BottomRow: {props.data}</div>
));

jest.mock(
  '@/components/RecruiterProfileItems/RecruiterPersonalInfo',
  () => (props: any) => (
    <div data-testid="mock-personal-info">
      PersonalInfo: {props.data.firstName} {props.data.lastName}
    </div>
  )
);

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <div data-testid="mock-hovered">{props.children}</div>
));

describe('RecruiterProfileContainer', () => {
  const recruiterData = {
    id: 10,
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'recruiter',
    avatarUrl: '/img/avatar.png',
    createdAt: '2024-01-01',
    companyId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders recruiter profile container', () => {
    render(<RecruiterProfileContainer recruiterData={recruiterData} />);

    expect(screen.getByTestId('mock-avatar')).toHaveTextContent(
      'Avatar: /img/avatar.png'
    );
    expect(screen.getByTestId('mock-personal-info')).toHaveTextContent(
      'Alice Smith'
    );
    expect(screen.getByTestId('mock-bottom-row')).toHaveTextContent(
      'BottomRow: 2024-01-01'
    );
  });

  test('renders page header only when editable', () => {
    const { rerender } = render(
      <RecruiterProfileContainer
        recruiterData={recruiterData}
        isEditable={false}
      />
    );

    expect(screen.queryByText('Your Recruiter Profile')).toBeNull();

    rerender(
      <RecruiterProfileContainer
        recruiterData={recruiterData}
        isEditable={true}
      />
    );

    expect(screen.getByText('Your Recruiter Profile')).toBeInTheDocument();
  });

  test('renders "Create a Company" when companyId is null', () => {
    render(
      <RecruiterProfileContainer
        recruiterData={recruiterData}
        isEditable={true}
      />
    );

    expect(screen.getByText('Create a Company')).toBeInTheDocument();
  });

  test('renders "Your Company" when companyId exists', () => {
    render(
      <RecruiterProfileContainer
        recruiterData={{ ...recruiterData, companyId: 20 }}
        isEditable={true}
      />
    );

    expect(screen.getByText('Your Company')).toBeInTheDocument();
  });

  test('clicking company button triggers router.push', () => {
    render(
      <RecruiterProfileContainer
        recruiterData={recruiterData}
        isEditable={true}
      />
    );

    const btn = screen.getByText('Create a Company');
    fireEvent.click(btn);

    expect(pushMock).toHaveBeenCalledWith('/my-profile/recruiter/company');
  });
});

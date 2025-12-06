import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApplicationContainer from '@/components/ApplicationItems/ApplicationContainer';

jest.mock('@/components/ApplicationItems/ApplicationItems.module.css', () => ({
  'application-container': 'application-container',
  'vacancy-container': 'vacancy-container',
  'left-container': 'left-container',
  'bottom-container': 'bottom-container',
  'status-row': 'status-row',
  'link-to-profile': 'link-to-profile',
}));

jest.mock('@/components/VacanciesItems/VacancyPage/SideBox', () => {
  const Mock = () => <div data-testid="side-box">SideBox</div>;
  Mock.displayName = 'MockSideBox';
  return Mock;
});

jest.mock('@/components/ProfileItems/MainInfo', () => {
  const Mock = () => <div data-testid="main-info">MainInfo</div>;
  Mock.displayName = 'MockMainInfo';
  return Mock;
});

jest.mock('@/components/ApplicationItems/StatusUpdateForm', () => {
  const Mock = (props: any) => (
    <div data-testid="status-update-form">
      StatusUpdateForm: {props.currentStatus}
    </div>
  );
  Mock.displayName = 'MockStatusUpdateForm';
  return Mock;
});

jest.mock('@fortawesome/react-fontawesome', () => {
  const Mock = ({ icon }: any) => (
    <svg data-testid="fa-icon">{icon.iconName}</svg>
  );
  Mock.displayName = 'MockFontAwesomeIcon';
  return { FontAwesomeIcon: Mock };
});

jest.mock('next/link', () => {
  const Mock = ({ children }: any) => <>{children}</>;
  Mock.displayName = 'MockNextLink';
  return Mock;
});

jest.mock('@/utils/convertData', () => ({
  isoToDate: () => 'Converted Date',
}));

describe('ApplicationContainer', () => {
  const mockApplication = {
    id: '123',
    coverLetter: 'My cover letter',
    status: 'Pending',
    createdAt: '2022-01-01',
  };

  const mockVacancy = {
    title: 'Frontend Dev',
    description: 'Work on React projects',
  };

  const mockJobSeeker = {
    id: '321',
    name: 'John Doe',
  };

  test('renders vacancy data when vacancyData is provided', () => {
    render(
      <ApplicationContainer
        applicationData={mockApplication as any}
        vacancyData={mockVacancy as any}
      />
    );

    expect(screen.getByText('Frontend Dev')).toBeInTheDocument();
    expect(screen.getByTestId('side-box')).toBeInTheDocument();
  });

  test('renders job seeker data when jobSeekerData is provided', () => {
    render(
      <ApplicationContainer
        applicationData={mockApplication as any}
        jobSeekerData={mockJobSeeker as any}
      />
    );

    expect(screen.getByTestId('main-info')).toBeInTheDocument();
    expect(screen.getByText("Go to applicant's profile")).toBeInTheDocument();
  });

  test('renders cover letter (with vacancyData)', () => {
    render(
      <ApplicationContainer
        applicationData={mockApplication as any}
        vacancyData={mockVacancy as any}
      />
    );

    expect(screen.getByText('My cover letter')).toBeInTheDocument();
  });

  test('shows StatusUpdateForm after clicking (Change) button', () => {
    render(
      <ApplicationContainer
        applicationData={mockApplication as any}
        jobSeekerData={mockJobSeeker as any}
      />
    );

    fireEvent.click(screen.getByText('(Change)'));

    expect(screen.getByTestId('status-update-form')).toBeInTheDocument();
    expect(screen.getByText('StatusUpdateForm: Pending')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import CompanyProfileContainer from '@/components/CompanyProfileItems/CompanyProfileContainer';
import Cookies from 'js-cookie';

const mockAvatar = jest.fn();
jest.mock('@/components/ProfileItems/Avatar', () => (props: any) => {
  mockAvatar(props);
  return <div data-testid="avatar" />;
});

const mockCompanyMainInfo = jest.fn();
jest.mock('@/components/CompanyProfileItems/CompanyMainInfo', () => (props: any) => {
  mockCompanyMainInfo(props);
  return <div data-testid="company-main-info" />;
});

const mockIsVerified = jest.fn();
jest.mock('@/components/ProfileItems/StatusController', () => (props: any) => {
  mockIsVerified(props);
  return <div data-testid="is-verified" />;
});

const mockBio = jest.fn();
jest.mock('@/components/ProfileItems/Description', () => (props: any) => {
  mockBio(props);
  return <div data-testid="bio" />;
});

const mockBottomRow = jest.fn();
jest.mock('@/components/CompanyProfileItems/CompanyBottomRow', () => (props: any) => {
  mockBottomRow(props);
  return <div data-testid="bottom-row" />;
});

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <div data-testid="hovered">{props.children}</div>
));

jest.mock('@/components/CompanyProfileItems/CompanyProfile.module.css', () => ({}));
jest.mock('@/components/ProfileItems/Profile.module.css', () => ({
  'profile-container': 'profile-container',
  'page-header': 'page-header',
  'main-info': 'main-info',
}));

jest.mock('next/link', () => (props: any) => (
  <a href={props.href}>{props.children}</a>
));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

const companyData = {
  id: 'company-1',
  name: 'ACME',
  url: 'https://acme.test',
  logoUrl: '/logo.png',
  isVerified: true,
  description: 'Test description',
  createdAt: '2024-01-01',
};

describe('CompanyProfileContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders editable view when cookie matches company id', () => {
    (Cookies.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'company-id') return 'company-1';
      if (key === 'recruiter-role') return 'ADMIN';
      return null;
    });

    render(<CompanyProfileContainer companyData={companyData as any} />);

    expect(screen.getByText('Your Amazing Company')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Company Members/i })).toHaveAttribute(
      'href',
      '/my-profile/recruiter/company/members'
    );
    expect(mockCompanyMainInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        isEditable: true,
        data: expect.objectContaining({ id: companyData.id }),
      })
    );
    expect(mockBottomRow).toHaveBeenCalledWith(
      expect.objectContaining({
        isEditable: true,
        companyId: companyData.id,
        createdAt: companyData.createdAt,
      })
    );
  });

  test('renders read-only view when cookie does not match', () => {
    (Cookies.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'company-id') return 'other-company';
      if (key === 'recruiter-role') return 'MEMBER';
      return null;
    });

    render(<CompanyProfileContainer companyData={companyData as any} />);

    expect(
      screen.queryByText('Your Amazing Company')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Company Members')).not.toBeInTheDocument();
    expect(mockCompanyMainInfo).toHaveBeenCalledWith(
      expect.objectContaining({ isEditable: false })
    );
    expect(mockBottomRow).toHaveBeenCalledWith(
      expect.objectContaining({ isEditable: false })
    );
  });
});

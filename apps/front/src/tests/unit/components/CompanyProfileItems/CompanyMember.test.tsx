import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompanyMember from '@/components/CompanyProfileItems/CompanyMember';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';

jest.mock('@/components/CompanyProfileItems/CompanyProfile.module.css', () => ({
  'company-member': 'company-member',
  'member-p': 'member-p',
  'form-del-btn': 'form-del-btn',
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <span data-testid="hovered">{props.children}</span>
));

jest.mock('@/components/MessageBox/MessageBox', () => (props: any) => (
  <div data-testid="message-box">{props.children}</div>
));

jest.mock('@tanstack/react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('@/services/companyProfileService', () => ({
  removeRecruiter: jest.fn(),
}));

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>;

const adminMember = {
  id: '1',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
};

const simpleMember = {
  id: '2',
  firstName: 'Regular',
  lastName: 'Member',
  role: 'MEMBER',
};

describe('CompanyMember', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows admin label without delete button', () => {
    mockUseMutation.mockReturnValue({ mutate: jest.fn() } as any);
    (Cookies.get as jest.Mock).mockReturnValue('company-1');

    render(<CompanyMember data={adminMember as any} />);

    expect(screen.getByText(/Admin User - ADMIN/)).toBeInTheDocument();
    expect(screen.getByText('(You)')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders member delete button and calls mutation', () => {
    const mutate = jest.fn();
    mockUseMutation.mockReturnValue({ mutate } as any);
    (Cookies.get as jest.Mock).mockReturnValue('company-1');

    render(<CompanyMember data={simpleMember as any} />);

    fireEvent.click(screen.getByRole('button'));

    expect(mutate).toHaveBeenCalledWith(simpleMember.id);
  });
});

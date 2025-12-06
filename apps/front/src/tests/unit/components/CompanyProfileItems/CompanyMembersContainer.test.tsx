import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CompanyMembersContainer from '@/components/CompanyProfileItems/CompanyMembersContainer';
import Cookies from 'js-cookie';

jest.mock('@/components/CompanyProfileItems/CompanyProfile.module.css', () => ({
  'members-container': 'members-container',
}));

const mockCompanyMember = jest.fn();
jest.mock('@/components/CompanyProfileItems/CompanyMember', () => (props: any) => {
  mockCompanyMember(props);
  return <div data-testid={`member-${props.data.id}`}>{props.data.firstName}</div>;
});

jest.mock('@/components/CompanyProfileItems/InviteBtn', () => () => (
  <div data-testid="invite-btn">Invite</div>
));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

const members = [
  { id: '1', firstName: 'One', lastName: 'First', role: 'ADMIN' },
  { id: '2', firstName: 'Two', lastName: 'Second', role: 'MEMBER' },
];

describe('CompanyMembersContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns null when recruiter role is unknown', () => {
    (Cookies.get as jest.Mock).mockReturnValue(null);

    const { container } = render(
      <CompanyMembersContainer members={members as any} />
    );

    expect(container.firstChild).toBeNull();
  });

  test('shows invite button for admin and renders members', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('ADMIN');

    render(<CompanyMembersContainer members={members as any} />);

    await waitFor(() =>
      expect(screen.getByTestId('invite-btn')).toBeInTheDocument()
    );
    expect(screen.getByTestId('member-1')).toBeInTheDocument();
    expect(screen.getByTestId('member-2')).toBeInTheDocument();
  });

  test('hides invite button for member', async () => {
    (Cookies.get as jest.Mock).mockReturnValue('MEMBER');

    render(<CompanyMembersContainer members={members as any} />);

    await waitFor(() =>
      expect(screen.queryByTestId('invite-btn')).not.toBeInTheDocument()
    );
    expect(screen.getByTestId('member-1')).toBeInTheDocument();
    expect(screen.getByTestId('member-2')).toBeInTheDocument();
  });
});

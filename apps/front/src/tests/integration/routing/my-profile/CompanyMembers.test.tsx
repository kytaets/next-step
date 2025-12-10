import { render } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

import CompanyMembers from '@/app/my-profile/recruiter/company/members/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('js-cookie', () => ({
  get: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: [],
    isPending: false,
    isError: false,
  })),
}));

jest.mock(
  '@/components/CompanyProfileItems/CompanyMembersContainer',
  () => () => <div>MockMembersContainer</div>
);

describe('CompanyMembers routing', () => {
  it('redirects to company page if company-id cookie is missing', () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    (Cookies.get as jest.Mock).mockReturnValue(undefined);

    render(<CompanyMembers />);

    expect(pushMock).toHaveBeenCalledWith('/my-profile/recruiter/company');
  });

  it('does NOT redirect if company-id exists', () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    (Cookies.get as jest.Mock).mockReturnValue('123');

    render(<CompanyMembers />);

    expect(pushMock).not.toHaveBeenCalled();
  });
});

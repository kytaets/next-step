import { render } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import MyApplicationsPage from '@/app/my-profile/job-seeker/applications/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => (
  <button onClick={() => props.onSubmit({ status: 'NEW', page: 3 })}>
    MockSearchBar
  </button>
));

jest.mock('@/components/ApplicationItems/ApplicationItem', () => () => (
  <div>MockApplicationItem</div>
));

describe('MyApplicationsPage routing', () => {
  it('updates query params via router.push when SearchBar submits values', () => {
    const pushMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () => new Map().entries(),
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: { data: [] },
      isError: false,
      error: null,
    });

    const { getByText } = render(<MyApplicationsPage />);

    getByText('MockSearchBar').click();

    expect(pushMock).toHaveBeenCalledWith('?status=NEW&page=3');
  });
});

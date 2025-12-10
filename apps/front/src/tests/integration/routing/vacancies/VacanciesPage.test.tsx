import { render } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';

import VacanciesPage from '@/app/vacancies/page';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: { data: [], meta: { page: 1, totalPages: 1 } },
    isError: false,
    isPending: false,
  })),
}));

jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => (
  <button onClick={() => props.onSubmit({ title: 'Frontend', salary: 5000 })}>
    MockSearchBar
  </button>
));

describe('VacanciesPage routing', () => {
  it('calls router.push with serialized query string when SearchBar submits values', () => {
    const pushMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () => new Map().entries(),
    });

    const { getByText } = render(<VacanciesPage />);

    getByText('MockSearchBar').click();

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('?title=Frontend&salary=5000');
  });
});

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import JobSeekersPage from '@/app/job-seekers/JobSeekersPage';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => {
  return (
    <button onClick={() => props.onSubmit(props.fieldsValues)}>
      MockSearchBar
    </button>
  );
});

jest.mock('@/components/MessageBox/MessageBox', () => (props: any) => (
  <div>MessageBoxMock{props.children}</div>
));
jest.mock(
  '@/components/JobSeekersSearchItems/JobSeekerItem',
  () =>
    ({ data }: any) => <div>JobSeekerItemMock {data?.id}</div>
);

jest.mock('@/utils/jobSeekerSearchValidation', () => ({
  mapQueryToJobSeekerForm: jest.fn((queryData) => queryData),
}));

jest.mock('@/utils/vacancyValidation', () => ({
  isEmptyValue: jest.fn(() => false),
}));

describe('JobSeekersPage routing', () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      push: pushMock,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () =>
        new URLSearchParams({
          city: 'Kyiv',
          skills: 'TS,React',
        }).entries(),
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: { data: [] },
      isError: false,
      error: null,
      isPending: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('pushes updated query params to router when search form is submitted', () => {
    const { getByText } = render(<JobSeekersPage />);

    const button = getByText('MockSearchBar');
    fireEvent.click(button);

    const expectedParams = new URLSearchParams({
      city: 'Kyiv',
      skills: 'TS,React',
    });

    expect(pushMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(`?${expectedParams.toString()}`);
  });

  it('renders link to /vacancies with correct href', () => {
    const { getByText } = render(<JobSeekersPage />);

    const linkText = getByText('Search for vacancies');
    const anchor = linkText.closest('a');

    expect(anchor).not.toBeNull();
    expect(anchor).toHaveAttribute('href', '/vacancies');
  });
});

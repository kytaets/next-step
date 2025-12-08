import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import JobSeekersPage from '@/app/job-seekers/JobSeekersPage';

// ----- МОКИ -----

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('next/link', () => {
  // упрощенный Link → обычный <a>
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

// SearchBar: рендерим кнопку и дергаем onSubmit при клике
jest.mock('@/components/SearchItems/SearchBar', () => (props: any) => {
  return (
    <button onClick={() => props.onSubmit(props.fieldsValues)}>
      MockSearchBar
    </button>
  );
});

// Заглушки для несущественных компонентов
jest.mock('@/components/MessageBox/MessageBox', () => (props: any) => (
  <div>MessageBoxMock{props.children}</div>
));
jest.mock(
  '@/components/JobSeekersSearchItems/JobSeekerItem',
  () =>
    ({ data }: any) => <div>JobSeekerItemMock {data?.id}</div>
);

// mapQueryToJobSeekerForm: просто возвращаем queryData как есть
jest.mock('@/utils/jobSeekerSearchValidation', () => ({
  mapQueryToJobSeekerForm: jest.fn((queryData) => queryData),
}));

// isEmptyValue: всегда false, чтобы все поля попадали в URL
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

    // эмулируем query-параметры в URL: ?city=Kyiv&skills=TS,React
    (useSearchParams as jest.Mock).mockReturnValue({
      entries: () =>
        new URLSearchParams({
          city: 'Kyiv',
          skills: 'TS,React',
        }).entries(),
    });

    // useQuery возвращает успешный ответ без ошибок и загрузки
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

    // наш мокнутый SearchBar рендерит кнопку "MockSearchBar"
    const button = getByText('MockSearchBar');
    fireEvent.click(button);

    const expectedParams = new URLSearchParams({
      city: 'Kyiv',
      skills: 'TS,React', // массив сериализуется как join(',')
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

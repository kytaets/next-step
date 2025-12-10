import { render, screen } from '@testing-library/react';
import SearchBar from '@/components/SearchItems/SearchBar';
import '@testing-library/jest-dom';
import React from 'react';

jest.mock('@/utils/vacancyValidation', () => ({
  searchFormValidate: jest.fn(),
  submitSearchForm: jest.fn(),
}));

jest.mock('@/utils/companiesSearchValidation', () => ({
  submitCompaniesSearchForm: jest.fn(),
}));

jest.mock('@/utils/jobSeekerSearchValidation', () => ({
  submitJobSeekersSearchForm: jest.fn(),
}));

jest.mock('@/utils/applicationsValidation', () => ({
  submitApplicationsSearchForm: jest.fn(),
}));

jest.mock('@/utils/profileValidation', () => ({
  validateLanguages: jest.fn(),
}));

jest.mock('@/components/SearchItems/InputContainer', () => ({
  __esModule: true,
  default: ({ type }) => (
    <div data-testid="input-container">InputContainer {type}</div>
  ),
}));

jest.mock('@/components/SearchItems/SearchTagBox', () => ({
  __esModule: true,
  default: ({ type }) => <div data-testid="tag-box">TagBox {type}</div>,
}));

const baseValues = { title: '', name: '', skills: [], languages: [] };

describe('SearchBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders InputContainer and TagBox for type="vacancies"', () => {
    render(
      <SearchBar
        type="vacancies"
        fieldsValues={baseValues}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByTestId('input-container')).toBeInTheDocument();
    expect(screen.getByTestId('tag-box')).toBeInTheDocument();
  });

  test('renders InputContainer but NOT TagBox for type="companies"', () => {
    render(
      <SearchBar
        type="companies"
        fieldsValues={baseValues}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByTestId('input-container')).toBeInTheDocument();
    expect(screen.queryByTestId('tag-box')).toBeNull();
  });

  test('does NOT render InputContainer for jobSeekers', () => {
    render(
      <SearchBar
        type="jobSeekers"
        fieldsValues={baseValues}
        onSubmit={() => {}}
      />
    );

    expect(screen.queryByTestId('input-container')).toBeNull();
    expect(screen.getByTestId('tag-box')).toBeInTheDocument();
  });

  test('does NOT render InputContainer but renders TagBox for type="applications"', () => {
    render(
      <SearchBar
        type="applications"
        fieldsValues={baseValues}
        onSubmit={() => {}}
      />
    );

    expect(screen.queryByTestId('input-container')).toBeNull();
    expect(screen.getByTestId('tag-box')).toBeInTheDocument();
  });
});

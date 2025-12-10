import { render, screen } from '@testing-library/react';
import InputContainer from '@/components/SearchItems/InputContainer';
import { Formik } from 'formik';
import '@testing-library/jest-dom';
import React from 'react';

jest.mock('@/components/HoveredItem/HoveredItem', () => {
  return ({ iconType }) => (
    <span data-testid="animated-icon">{iconType.iconName || 'icon'}</span>
  );
});

const renderWithFormik = (ui: React.ReactNode, initialValues = {}) => {
  return render(
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {() => <form>{ui}</form>}
    </Formik>
  );
};

describe('InputContainer Component', () => {
  test('renders Field with default name "title" when type="vacancies"', () => {
    renderWithFormik(<InputContainer type="vacancies" />, { title: '' });

    const input = screen.getByPlaceholderText('Search for jobs...');
    expect(input).toHaveAttribute('name', 'title');
  });

  test('renders Field with name "name" when type="companies"', () => {
    renderWithFormik(<InputContainer type="companies" />, { name: '' });

    const input = screen.getByPlaceholderText('Search for jobs...');
    expect(input).toHaveAttribute('name', 'name');
  });

  test('renders Field with default name "title" when no type is provided', () => {
    renderWithFormik(<InputContainer />, { title: '' });

    const input = screen.getByPlaceholderText('Search for jobs...');
    expect(input).toHaveAttribute('name', 'title');
  });

  test('renders ErrorMessage for proper field', () => {
    renderWithFormik(<InputContainer />, { title: '' });

    expect(
      screen.getByPlaceholderText('Search for jobs...')
    ).toBeInTheDocument();
  });

  test('renders search button with animated icon', () => {
    renderWithFormik(<InputContainer />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('search-btn');

    expect(screen.getByTestId('animated-icon')).toBeInTheDocument();
  });
});

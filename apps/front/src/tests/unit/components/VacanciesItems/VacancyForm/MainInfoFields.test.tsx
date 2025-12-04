import { render, screen, fireEvent } from '@testing-library/react';
import { Formik } from 'formik';
import MainInfoForm from '@/components/VacanciesItems/VacancyForm/MainInfoFields';
import React from 'react';
import '@testing-library/jest-dom';

// -------------------------
// MOCKS
// -------------------------

jest.mock('framer-motion', () => {
  const React = require('react');
  const forbidden = [
    'initial',
    'animate',
    'exit',
    'whileHover',
    'whileTap',
    'whileDrag',
    'transition',
    'variants',
    'drag',
    'dragConstraints',
  ];

  const clean = (props) => {
    const safe = { ...props };
    forbidden.forEach((p) => delete safe[p]);
    return safe;
  };

  const Mock = React.forwardRef(({ children, ...rest }, ref) => (
    <div ref={ref} {...clean(rest)}>
      {children}
    </div>
  ));

  return {
    motion: new Proxy({}, { get: () => Mock }),
  };
});

jest.mock('@/components/HoveredItem/HoveredItem', () => {
  return ({ children }) => <span data-testid="hovered-item">{children}</span>;
});

jest.mock('@/components/MultiSelect/MultiSelect', () => {
  return ({ field }) => <div data-testid={`multiselect-${field.name}`} />;
});

// -------------------------
// Helper
// -------------------------

function renderWithFormik(initialValues: any) {
  return render(
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {() => <MainInfoForm />}
    </Formik>
  );
}

// -------------------------
// TESTS
// -------------------------

describe('MainInfoForm', () => {
  const initialValues = {
    title: '',
    description: '',
    salaryMin: '',
    salaryMax: '',
    officeLocation: '',
    workFormat: [],
    employmentType: [],
    experienceRequired: '',
    seniorityLevel: '',
    isActive: false,
  };

  test('renders Vacancy title field', () => {
    renderWithFormik(initialValues);
    expect(screen.getByPlaceholderText('Cool vacancy')).toBeInTheDocument();
  });

  test('renders Job description textarea', () => {
    renderWithFormik(initialValues);
    expect(screen.getByPlaceholderText('Some info...')).toBeInTheDocument();
  });

  test('renders salary fields', () => {
    renderWithFormik(initialValues);

    const salaryMin = screen
      .getAllByPlaceholderText('0')
      .find((el) => el.getAttribute('name') === 'salaryMin');
    expect(salaryMin).toBeInTheDocument();

    const salaryMax = screen.getByPlaceholderText('999');
    expect(salaryMax).toBeInTheDocument();
  });

  test('renders office location field', () => {
    renderWithFormik(initialValues);
    expect(screen.getByPlaceholderText('Hostel number 8')).toBeInTheDocument();
  });

  test('renders workFormat MultiSelect', () => {
    renderWithFormik(initialValues);
    expect(screen.getByTestId('multiselect-workFormat')).toBeInTheDocument();
  });

  test('renders employmentType MultiSelect', () => {
    renderWithFormik(initialValues);
    expect(
      screen.getByTestId('multiselect-employmentType')
    ).toBeInTheDocument();
  });

  test('toggles active/not active', () => {
    renderWithFormik(initialValues);

    const button = screen.getByRole('button');

    expect(screen.getByTestId('hovered-item')).toHaveTextContent('Not Active');

    fireEvent.click(button);

    expect(screen.getByTestId('hovered-item')).toHaveTextContent('Is Active');
  });

  test('renders experience and seniority fields', () => {
    renderWithFormik(initialValues);

    const experience = screen
      .getAllByPlaceholderText('0')
      .find((el) => el.getAttribute('name') === 'experienceRequired');
    expect(experience).toBeInTheDocument();

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});

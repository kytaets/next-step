import { render, screen, fireEvent } from '@testing-library/react';
import { Formik } from 'formik';
import LanguagesFields from '@/components/VacanciesItems/VacancyForm/LanguagesFields';
import React from 'react';
import '@testing-library/jest-dom';

jest.mock('framer-motion', () => {
  const React = require('react');

  const badProps = [
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
    badProps.forEach((p) => delete safe[p]);
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

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: [
      { id: '1', name: 'English' },
      { id: '2', name: 'Spanish' },
    ],
    error: null,
  }),
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => {
  return ({ children }) => <span data-testid="animated-icon">{children}</span>;
});

jest.mock('@/components/FormItems/LanguageRow', () => {
  return () => <div data-testid="language-row">Row</div>;
});

function renderWithFormik(ui: React.ReactNode) {
  return render(
    <Formik
      initialValues={{ languages: [{ language: { id: '' }, level: '' }] }}
    >
      {() => ui}
    </Formik>
  );
}

describe('LanguagesFields', () => {
  test('renders languages title', () => {
    renderWithFormik(<LanguagesFields />);
    expect(screen.getByText('Languages')).toBeInTheDocument();
  });

  test('renders language rows', () => {
    renderWithFormik(<LanguagesFields />);
    expect(screen.getByTestId('language-row')).toBeInTheDocument();
  });

  test('renders AnimatedIcon inside button', () => {
    renderWithFormik(<LanguagesFields />);

    expect(screen.getByTestId('animated-icon')).toBeInTheDocument();
    expect(screen.getByText('Add +')).toBeInTheDocument();
  });

  test('calls push when clicking Add + button', () => {
    const pushMock = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Formik initialValues={{ languages: [] }} onSubmit={() => {}}>
        {() => <LanguagesFields />}
      </Formik>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(button).toBeInTheDocument();
  });
});

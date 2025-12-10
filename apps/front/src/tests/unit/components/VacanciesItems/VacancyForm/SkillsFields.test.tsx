import { render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import SkillsFields from '@/components/VacanciesItems/VacancyForm/SkillsFields';
import React from 'react';
import '@testing-library/jest-dom';

jest.mock('@/services/jobseekerService', () => ({
  getSkills: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/components/FormItems/SkillRow', () => {
  return ({
    values,
    handleChange,
    setFieldValue,
    skillsList,
    fetchSkillsError,
  }) => (
    <div data-testid="skills-row">
      <div data-testid="skills-list">{JSON.stringify(skillsList)}</div>
      {fetchSkillsError && (
        <div data-testid="skills-error">{fetchSkillsError.message}</div>
      )}
    </div>
  );
});

function renderWithFormik(initialValues: any) {
  return render(
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {() => <SkillsFields />}
    </Formik>
  );
}

describe('SkillsFields', () => {
  const initialValues = {
    skills: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Skills title', () => {
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValue({
      data: [],
      error: null,
    });

    renderWithFormik(initialValues);

    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  test('renders SkillsRow with skills list', () => {
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValue({
      data: [{ id: '1', name: 'JavaScript' }],
      error: null,
    });

    renderWithFormik(initialValues);

    expect(screen.getByTestId('skills-row')).toBeInTheDocument();
    expect(screen.getByTestId('skills-list')).toHaveTextContent(
      JSON.stringify([{ id: '1', name: 'JavaScript' }])
    );
  });

  test('renders error when fetchSkillsError exists', () => {
    const { useQuery } = require('@tanstack/react-query');
    useQuery.mockReturnValue({
      data: [],
      error: { message: 'Failed to load skills' },
    });

    renderWithFormik(initialValues);

    expect(screen.getByTestId('skills-error')).toHaveTextContent(
      'Failed to load skills'
    );
  });
});

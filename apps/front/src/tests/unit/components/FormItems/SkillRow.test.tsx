import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkillsRow from '@/components/FormItems/SkillRow';
import { Formik } from 'formik';

const renderWithFormik = (ui: React.ReactNode, values: any = {}) => {
  return render(
    <Formik initialValues={values} onSubmit={() => {}}>
      {() => ui}
    </Formik>
  );
};

describe('SkillsRow', () => {
  const initialValues = {
    skills: [
      { skill: { id: '1', name: 'React' } },
      { skill: { id: '2', name: 'TypeScript' } },
    ],
    newSkill: '',
    showList: false,
  };

  const skillsList = [
    { id: '1', name: 'React' },
    { id: '2', name: 'TypeScript' },
    { id: '3', name: 'Node.js' },
    { id: '4', name: 'GraphQL' },
  ];

  test('renders existing skills', () => {
    renderWithFormik(
      <SkillsRow
        values={initialValues}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        skillsList={skillsList}
      />
    );

    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  test('removes a skill when delete button clicked', () => {
    const mockRemove = jest.fn();

    renderWithFormik(
      <SkillsRow
        values={initialValues}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        skillsList={skillsList}
      />,
      initialValues
    );

    const deleteBtn = screen.getAllByRole('button')[0];

    fireEvent.click(deleteBtn);

    expect(deleteBtn).toBeInTheDocument();
  });

  test('shows autocomplete list on focus', () => {
    const mockSetFieldValue = jest.fn();

    renderWithFormik(
      <SkillsRow
        values={initialValues}
        handleChange={jest.fn()}
        setFieldValue={mockSetFieldValue}
        skillsList={skillsList}
      />
    );

    const input = screen.getByPlaceholderText('Add skill');
    fireEvent.focus(input);

    expect(mockSetFieldValue).toHaveBeenCalledWith('showList', true);
  });

  test('filters out skills that already exist', () => {
    renderWithFormik(
      <SkillsRow
        values={{ ...initialValues, showList: true }}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        skillsList={skillsList}
      />
    );

    expect(screen.queryByText('React')).not.toBeNull();
    expect(screen.queryByText('Node.js')).not.toBeNull();
  });

  test('filters skills by search text', () => {
    renderWithFormik(
      <SkillsRow
        values={{ ...initialValues, newSkill: 'node', showList: true }}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        skillsList={skillsList}
      />
    );

    expect(screen.getByText('Node.js')).toBeInTheDocument();

    expect(screen.queryByText('GraphQL')).toBeNull();
  });

  test('adds skill on list click', () => {
    const mockSetFieldValue = jest.fn();
    const mockHandleChange = jest.fn();

    renderWithFormik(
      <SkillsRow
        values={{ ...initialValues, showList: true }}
        handleChange={mockHandleChange}
        setFieldValue={mockSetFieldValue}
        skillsList={skillsList}
      />
    );

    const nodeItem = screen.getByText('Node.js');
    fireEvent.click(nodeItem);

    expect(mockSetFieldValue).toHaveBeenCalledWith('newSkill', '');
    expect(mockSetFieldValue).toHaveBeenCalledWith('showList', false);
  });

  test('shows error message from fetchSkillsError', () => {
    renderWithFormik(
      <SkillsRow
        values={{ ...initialValues, showList: true }}
        handleChange={jest.fn()}
        setFieldValue={jest.fn()}
        skillsList={skillsList}
        fetchSkillsError={{ message: 'Failed to load skills' }}
      />
    );

    expect(screen.getByText('Failed to load skills')).toBeInTheDocument();
  });
});

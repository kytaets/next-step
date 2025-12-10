import { render, screen } from '@testing-library/react';
import ExperienceInput from '@/components/SearchItems/Fields/Experience';
import '@testing-library/jest-dom';

jest.mock('formik', () => ({
  Field: (props: any) => <input data-testid="field" {...props} />,
}));

describe('ExperienceInput Component', () => {
  test('renders Experience label', () => {
    render(<ExperienceInput />);
    expect(screen.getByText('Experience')).toBeInTheDocument();
  });

  test('renders Field with correct props', () => {
    render(<ExperienceInput />);

    const field = screen.getByTestId('field');

    expect(field).toBeInTheDocument();
    expect(field).toHaveAttribute('name', 'experienceRequired');
    expect(field).toHaveAttribute('type', 'number');
  });

  test('renders "years" label', () => {
    render(<ExperienceInput />);
    expect(screen.getByText('years')).toBeInTheDocument();
  });
});

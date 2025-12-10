import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import MultiSelect from '@/components/MultiSelect/MultiSelect';

jest.mock('@/utils/convertData', () => ({
  capitalize: (s: string) => s.charAt(0).toUpperCase() + s.slice(1),
  toKebabCase: (s: string) => s.toLowerCase().replace(/\s+/g, '-'),
}));

describe('MultiSelect component', () => {
  let field: any;
  let form: any;

  beforeEach(() => {
    field = {
      name: 'skills',
      value: [],
    };

    form = {
      setFieldValue: jest.fn(),
    };
  });

  test('renders placeholder when no values selected', () => {
    render(
      <MultiSelect
        field={field}
        form={form}
        options={['JavaScript', 'React']}
        placeholder="Choose skills"
      />
    );

    expect(screen.getByText('Choose skills')).toBeInTheDocument();
  });

  test('opens dropdown when clicked', () => {
    render(<MultiSelect field={field} form={form} options={['JavaScript']} />);

    fireEvent.click(screen.getByText('Select options'));

    expect(screen.getByText('Javascript')).toBeInTheDocument();
  });

  test('selecting option triggers setFieldValue', () => {
    render(<MultiSelect field={field} form={form} options={['JavaScript']} />);

    fireEvent.click(screen.getByText('Select options'));

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(form.setFieldValue).toHaveBeenCalledWith('skills', ['JavaScript']);
  });

  test('unselecting option removes it', () => {
    field.value = ['JavaScript'];

    render(<MultiSelect field={field} form={form} options={['JavaScript']} />);

    fireEvent.click(screen.getByText('Javascript'));

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(form.setFieldValue).toHaveBeenCalledWith('skills', []);
  });

  test('selected options appear in display', () => {
    field.value = ['JavaScript', 'React'];

    render(
      <MultiSelect
        field={field}
        form={form}
        options={['JavaScript', 'React']}
      />
    );

    expect(screen.getByText(/javascript, react/i)).toBeInTheDocument();
  });
});

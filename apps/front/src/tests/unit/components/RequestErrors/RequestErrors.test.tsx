import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import RequestErrors from '@/components/RequestErrors/RequestErrors';

// ------------------
// Mock MessageBox
// ------------------
jest.mock('@/components/MessageBox/MessageBox', () => (props: any) => (
  <div data-testid="mock-messagebox">{props.children}</div>
));

describe('RequestErrors', () => {
  test('renders nothing when error is null', () => {
    const { container } = render(<RequestErrors error={null} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders nothing when error is undefined', () => {
    const { container } = render(<RequestErrors error={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders MessageBox when error exists', () => {
    render(<RequestErrors error="Something went wrong" />);

    expect(screen.getByTestId('mock-messagebox')).toHaveTextContent(
      'Something went wrong'
    );
  });

  test('wraps MessageBox inside request-error-container', () => {
    const { container } = render(<RequestErrors error="Error!" />);

    const wrapper = container.querySelector('.request-error-container');
    expect(wrapper).toBeInTheDocument();
  });
});

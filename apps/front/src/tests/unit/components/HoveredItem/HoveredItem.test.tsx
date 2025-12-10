import React from 'react';
import { render, screen } from '@testing-library/react';
import HoveredItem from '@/components/HoveredItem/HoveredItem';
import { faHome } from '@fortawesome/free-solid-svg-icons';

jest.mock('@/components/HoveredItem/HoveredItem.module.css', () => ({
  'basic-icon': 'basic-icon',
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, ...rest }: any) => (
      <div data-while-hover={JSON.stringify(whileHover)} {...rest}>
        {children}
      </div>
    ),
  },
}));

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <svg data-testid="fa-icon">{icon.iconName}</svg>
  ),
}));

describe('HoveredItem component', () => {
  test('renders children', () => {
    render(<HoveredItem>Test content</HoveredItem>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders icon when iconType is provided', () => {
    render(<HoveredItem iconType={faHome} />);
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  test('does not render icon when iconType is not provided', () => {
    render(<HoveredItem />);
    expect(screen.queryByTestId('fa-icon')).toBeNull();
  });

  test('applies default hover scale (1.1)', () => {
    const { container } = render(<HoveredItem>Test</HoveredItem>);
    const motionDiv = container.querySelector(
      '[data-while-hover]'
    ) as HTMLElement;
    expect(motionDiv.dataset.whileHover).toBe(JSON.stringify({ scale: 1.1 }));
  });

  test('applies custom hover scale', () => {
    const { container } = render(<HoveredItem scale={2}>Test</HoveredItem>);
    const motionDiv = container.querySelector(
      '[data-while-hover]'
    ) as HTMLElement;
    expect(motionDiv.dataset.whileHover).toBe(JSON.stringify({ scale: 2 }));
  });
});

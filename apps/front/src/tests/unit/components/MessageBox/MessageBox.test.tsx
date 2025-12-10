import React from 'react';
import { render, screen } from '@testing-library/react';
import MessageBox from '@/components/MessageBox/MessageBox';

jest.mock('@/components/MessageBox/MessageBox.module.css', () => ({
  'error-box': 'error-box',
}));

describe('MessageBox component', () => {
  test('renders children correctly', () => {
    render(<MessageBox>Test message</MessageBox>);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('applies default "info" style (color = white)', () => {
    render(<MessageBox>Info text</MessageBox>);
    const box = screen.getByText('Info text');
    expect(box).toHaveStyle({ color: '#ffffff' });
  });

  test('applies "error" style (color = #f37199)', () => {
    render(<MessageBox type="error">Error text</MessageBox>);
    const box = screen.getByText('Error text');
    expect(box).toHaveStyle({ color: '#f37199' });
  });
});

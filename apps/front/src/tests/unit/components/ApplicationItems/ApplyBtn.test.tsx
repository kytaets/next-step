import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ApplyBtn from '@/components/ApplicationItems/ApplyBtn';

jest.mock('@/components/ApplicationItems/ApplicationItems.module.css', () => ({
  'apply-btn': 'apply-btn',
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => {
  return function MockHoveredItem({ children }) {
    return <div data-testid="hovered-item">{children}</div>;
  };
});

const mockOpenModalFn = jest.fn();

jest.mock('@/store/modalSlice', () => ({
  useModalStore: (selector) =>
    selector({
      openModal: mockOpenModalFn,
    }),
}));

jest.mock('@/components/ApplicationItems/ApplyFormModal', () => {
  return function MockApplyFormModal(props) {
    return <div data-testid="apply-form-modal" {...props} />;
  };
});

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }) => <div>{children}</div>,
}));

describe('ApplyBtn', () => {
  beforeEach(() => {
    mockOpenModalFn.mockClear();
  });

  test('calls openModal with AnimatePresence + ApplyFormModal', () => {
    render(<ApplyBtn vacancyId="123" />);

    fireEvent.click(screen.getByRole('button'));

    expect(mockOpenModalFn).toHaveBeenCalledTimes(1);

    const returned = mockOpenModalFn.mock.calls[0][0];

    expect(typeof returned.type).toBe('function');
    expect(returned.type.name).toBe('AnimatePresence');

    const modal = returned.props.children;

    expect(typeof modal.type).toBe('function');
    expect(modal.type.name).toBe('MockApplyFormModal');

    expect(modal.props.vacancyId).toBe('123');
  });
});

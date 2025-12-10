import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompanyInfoBox from '@/components/CompanyInfos/CompanyInfoBox';

const mockOpenModal = jest.fn();
jest.mock('@/store/modalSlice', () => ({
  useModalStore: (selector) =>
    selector({
      isOpen: false,
      openModal: mockOpenModal,
    }),
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }) => {
      const { whileHover, initial, animate, exit, transition, ...clean } = rest;
      return <div {...clean}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }) => (
    <div data-testid="animate">{children}</div>
  ),
}));

jest.mock('@/components/CompanyInfos/CompanyInfoModal', () => () => (
  <div data-testid="company-info-modal">Modal</div>
));

describe('CompanyInfoBox', () => {
  test('renders company information', () => {
    render(<CompanyInfoBox />);
    expect(screen.getByText('A company')).toBeInTheDocument();
  });

  test('opens modal on click', () => {
    render(<CompanyInfoBox />);

    fireEvent.click(screen.getByText('A company'));

    expect(mockOpenModal).toHaveBeenCalledTimes(1);

    const element = mockOpenModal.mock.calls[0][0];

    const { getByTestId } = render(element);

    expect(getByTestId('animate')).toBeInTheDocument();
    expect(getByTestId('company-info-modal')).toBeInTheDocument();
  });
});

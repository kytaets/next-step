import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CompanyInfoBox from '@/components/CompanyInfos/CompanyInfoBox';

const mockOpenModal = jest.fn();

jest.mock('@/store/modalSlice', () => ({
  useModalStore: (selector) =>
    selector({
      isOpen: false,
      openModal: mockOpenModal,
      closeModal: jest.fn(),
    }),
}));

jest.mock('framer-motion', () => {
  const React = require('react');

  const MotionMock = ({ children, ...rest }) => {
    const {
      whileHover,
      initial,
      animate,
      exit,
      variants,
      transition,
      ...cleanProps
    } = rest;

    return React.createElement('div', cleanProps, children);
  };

  return {
    motion: new Proxy({}, { get: () => MotionMock }),

    AnimatePresence: ({ children }) =>
      React.createElement('div', { 'data-testid': 'animate' }, children),
  };
});

jest.mock('@/components/CompanyInfos/CompanyInfoModal', () => () => (
  <div data-testid="company-info-modal">Mocked CompanyInfoModal</div>
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

    const reactNode = mockOpenModal.mock.calls[0][0];

    const { getByTestId } = render(reactNode);

    expect(getByTestId('animate')).toBeInTheDocument();
    expect(getByTestId('company-info-modal')).toBeInTheDocument();
  });
});

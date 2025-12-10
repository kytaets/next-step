import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Modal from '@/components/Modal/Modal';

const closeModalMock = jest.fn();

jest.mock('@/store/modalSlice', () => ({
  useModalStore: jest.fn(),
}));

import { useModalStore } from '@/store/modalSlice';

describe('Modal component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns null when closed or no content', () => {
    (useModalStore as jest.Mock).mockReturnValue({
      isOpen: false,
      content: null,
    });

    const { container } = render(<Modal />);
    expect(container.firstChild).toBeNull();
  });

  test('renders modal with provided content', () => {
    (useModalStore as jest.Mock).mockReturnValue({
      isOpen: true,
      content: <div>Modal Content</div>,
      closeModal: closeModalMock,
      isAbsolute: false,
    });

    render(<Modal />);

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  test('clicking backdrop closes modal when isAbsolute = false', () => {
    (useModalStore as jest.Mock).mockReturnValue({
      isOpen: true,
      content: <div>Test Content</div>,
      closeModal: closeModalMock,
      isAbsolute: false,
    });

    render(<Modal />);

    const backdrop =
      screen.getByText('Test Content').parentElement!.parentElement!;
    fireEvent.click(backdrop);

    expect(closeModalMock).toHaveBeenCalled();
  });

  test('clicking backdrop does NOT close modal when isAbsolute = true', () => {
    (useModalStore as jest.Mock).mockReturnValue({
      isOpen: true,
      content: <div>Test Content</div>,
      closeModal: closeModalMock,
      isAbsolute: true,
    });

    render(<Modal />);

    const backdrop =
      screen.getByText('Test Content').parentElement!.parentElement!;
    fireEvent.click(backdrop);

    expect(closeModalMock).not.toHaveBeenCalled();
  });

  test('clicking inside modal does NOT close it', () => {
    (useModalStore as jest.Mock).mockReturnValue({
      isOpen: true,
      content: <div>Inside</div>,
      closeModal: closeModalMock,
      isAbsolute: false,
    });

    render(<Modal />);

    const modalBox = screen.getByText('Inside').parentElement!;
    fireEvent.click(modalBox);

    expect(closeModalMock).not.toHaveBeenCalled();
  });
});

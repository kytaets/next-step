import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InviteBtn from '@/components/CompanyProfileItems/InviteBtn';

const mockOpenModal = jest.fn();
jest.mock('@/store/modalSlice', () => ({
  useModalStore: (selector: any) =>
    selector({
      openModal: mockOpenModal,
    }),
}));

jest.mock('@/components/CompanyProfileItems/InvitationModal', () => () => (
  <div data-testid="invitation-modal">Invitation</div>
));

jest.mock('@/components/CompanyProfileItems/CompanyProfile.module.css', () => ({
  'invite-btn': 'invite-btn',
}));

jest.mock('@/components/HoveredItem/HoveredItem', () => (props: any) => (
  <span>{props.children}</span>
));

describe('InviteBtn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('opens invitation modal on click', () => {
    render(<InviteBtn />);

    fireEvent.click(screen.getByRole('button', { name: /Invite/i }));

    expect(mockOpenModal).toHaveBeenCalledTimes(1);

    const node = mockOpenModal.mock.calls[0][0];
    const { getByTestId } = render(node);

    expect(getByTestId('invitation-modal')).toBeInTheDocument();
  });
});

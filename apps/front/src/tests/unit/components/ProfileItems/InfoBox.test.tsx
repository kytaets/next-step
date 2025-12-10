import { render, screen, fireEvent } from '@testing-library/react';
import InfoBox from '@/components/ProfileItems/InfoBox';

jest.mock('@/components/HoveredItem/HoveredItem', () => ({
  __esModule: true,
  default: ({ children }: any) => <span>{children}</span>,
}));

describe('InfoBox component', () => {
  test('renders title and children', () => {
    render(
      <InfoBox title="My Title">
        <p>Child content</p>
      </InfoBox>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('renders Edit button only when isEditable=true and onEdit provided', () => {
    const mockEdit = jest.fn();

    render(
      <InfoBox title="Test" isEditable={true} onEdit={mockEdit}>
        <div>Content</div>
      </InfoBox>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('does NOT render Edit button if isEditable=false', () => {
    render(
      <InfoBox title="Test" isEditable={false}>
        <div>Content</div>
      </InfoBox>
    );

    expect(screen.queryByRole('button')).toBeNull();
  });

  test('does NOT render Edit button if onEdit is not provided', () => {
    render(
      <InfoBox title="Test" isEditable={true}>
        <div>Content</div>
      </InfoBox>
    );

    expect(screen.queryByRole('button')).toBeNull();
  });

  test('calls onEdit when clicking edit button', () => {
    const mockEdit = jest.fn();

    render(
      <InfoBox title="Edit Test" isEditable={true} onEdit={mockEdit}>
        <div>Content</div>
      </InfoBox>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockEdit).toHaveBeenCalled();
  });
});

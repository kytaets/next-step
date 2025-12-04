import { render, screen } from '@testing-library/react';
import InfoItem from '@/components/ProfileItems/InfoItem';

describe('InfoItem component', () => {
  test('renders title and children', () => {
    render(
      <InfoItem title="Test Title">
        <p>Child content</p>
      </InfoItem>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  test('renders date when provided', () => {
    render(
      <InfoItem title="Test Title" date="2024-01-01">
        <p>Child content</p>
      </InfoItem>
    );

    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
  });

  test('does NOT render date when it is not provided', () => {
    render(
      <InfoItem title="No date test">
        <p>Child content</p>
      </InfoItem>
    );

    expect(screen.queryByText('2024-01-01')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import CompanyInvitationModal from '@/components/CompanyProfileItems/CompanyInvitationModal';

jest.mock('@/components/CompanyProfileItems/CompanyProfile.module.css', () => ({
  'check-box': 'check-box',
  'image-container': 'image-container',
}));

jest.mock('next/image', () => (props: any) => {
  // next/image replacement to render a native img for tests; omit priority prop
  const { src, alt, priority, ...rest } = props;
  return <img src={typeof src === 'string' ? src : src?.src} alt={alt} {...rest} />;
});

jest.mock('next/link', () => (props: any) => (
  <a href={props.href}>{props.children}</a>
));

describe('CompanyInvitationModal', () => {
  test('renders success state with link', () => {
    render(<CompanyInvitationModal status="success" />);

    expect(
      screen.getByText('Your invitation was successfully accepted!')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /your company page/i })
    ).toHaveAttribute('href', '/my-profile/recruiter/company');
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('check-arrow.png')
    );
  });

  test('renders loading state', () => {
    render(<CompanyInvitationModal status="loading" />);

    expect(
      screen.getByText('Wait while we are verifying your invitation...')
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('loading-spin.gif')
    );
  });

  test('renders error state', () => {
    render(<CompanyInvitationModal status="error" />);

    expect(
      screen.getByText('Sorry! We were unable to accept your invitation.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('black-on-white-cross.png')
    );
  });
});

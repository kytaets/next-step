import { render, screen } from '@testing-library/react';
import ProfileContainer from '@/components/ProfileItems/ProfileContainer';

import MainInfo from '@/components/ProfileItems/MainInfo';
import Contacts from '@/components/ProfileItems/Contacts';
import Bio from '@/components/ProfileItems/Description';
import Languages from '@/components/ProfileItems/Languages';
import Certificates from '@/components/ProfileItems/Certificates';
import WorkExperience from '@/components/ProfileItems/WorkExperience';
import Education from '@/components/ProfileItems/Education';
import BottomRow from '@/components/ProfileItems/BottomRow';

jest.mock('@/components/ProfileItems/MainInfo', () =>
  jest.fn(() => <div>MainInfoMock</div>)
);
jest.mock('@/components/ProfileItems/Contacts', () =>
  jest.fn(() => <div>ContactsMock</div>)
);
jest.mock('@/components/ProfileItems/Description', () =>
  jest.fn(() => <div>BioMock</div>)
);
jest.mock('@/components/ProfileItems/Languages', () =>
  jest.fn(() => <div>LanguagesMock</div>)
);
jest.mock('@/components/ProfileItems/Certificates', () =>
  jest.fn(() => <div>CertificatesMock</div>)
);
jest.mock('@/components/ProfileItems/WorkExperience', () =>
  jest.fn(() => <div>WorkExperienceMock</div>)
);
jest.mock('@/components/ProfileItems/Education', () =>
  jest.fn(() => <div>EducationMock</div>)
);
jest.mock('@/components/ProfileItems/BottomRow', () =>
  jest.fn(() => <div>BottomRowMock</div>)
);

const mockProfile = {
  id: 10,
  firstName: 'John',
  lastName: 'Doe',
  avatarUrl: '/avatar.png',
  bio: 'Hello world',
  contacts: { email: 'test@mail.com', phone: '12345' },
  languages: [],
  createdAt: '2023-01-01',
};

describe('ProfileContainer Component', () => {
  beforeEach(() => jest.clearAllMocks());

  test('renders all profile sections', () => {
    render(<ProfileContainer isEditable={false} profileData={mockProfile} />);

    expect(screen.getByText('MainInfoMock')).toBeInTheDocument();
    expect(screen.getByText('ContactsMock')).toBeInTheDocument();
    expect(screen.getByText('BioMock')).toBeInTheDocument();
    expect(screen.getByText('WorkExperienceMock')).toBeInTheDocument();
    expect(screen.getByText('EducationMock')).toBeInTheDocument();
    expect(screen.getByText('CertificatesMock')).toBeInTheDocument();
    expect(screen.getByText('LanguagesMock')).toBeInTheDocument();
    expect(screen.getByText('BottomRowMock')).toBeInTheDocument();
  });

  test('renders header when editable', () => {
    render(<ProfileContainer isEditable={true} profileData={mockProfile} />);
    expect(screen.getByText('Your Next Level Profile')).toBeInTheDocument();
  });

  test('passes correct props to child components', () => {
    render(<ProfileContainer isEditable={true} profileData={mockProfile} />);

    expect(MainInfo).toHaveBeenCalledWith(
      {
        isEditable: true,
        data: mockProfile,
      },
      undefined
    );

    expect(Contacts).toHaveBeenCalledWith(
      {
        isEditable: true,
        data: mockProfile.contacts,
      },
      undefined
    );

    expect(Bio).toHaveBeenCalledWith(
      {
        isEditable: true,
        data: mockProfile.bio,
      },
      undefined
    );

    expect(Languages).toHaveBeenCalledWith(
      {
        isEditable: true,
        data: mockProfile.languages,
      },
      undefined
    );

    expect(BottomRow).toHaveBeenCalledWith(
      {
        isEditable: true,
        data: mockProfile.createdAt,
      },
      undefined
    );
  });
});

import { render } from '@testing-library/react';
import MainInfo from '@/components/ProfileItems/MainInfo';

jest.mock('@/components/ProfileItems/Avatar', () =>
  jest.fn(() => <div>AvatarMock</div>)
);
jest.mock('@/components/ProfileItems/StatusController', () =>
  jest.fn(() => <div>StatusMock</div>)
);
jest.mock('@/components/ProfileItems/Skills', () =>
  jest.fn(() => <div>SkillsMock</div>)
);
jest.mock('@/components/ProfileItems/PersonalInfo', () =>
  jest.fn(() => <div>PersonalInfoMock</div>)
);

import Avatar from '@/components/ProfileItems/Avatar';
import OpenToWork from '@/components/ProfileItems/StatusController';
import Skills from '@/components/ProfileItems/Skills';
import PersonalInfo from '@/components/ProfileItems/PersonalInfo';

describe('MainInfo component', () => {
  const mockProfile = {
    id: 10,
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1990-05-10',
    location: 'Berlin',
    avatarUrl: 'https://example.com/avatar.png',
    isOpenToWork: true,
    skills: ['React', 'Node.js'],
  };

  const renderMain = () =>
    render(<MainInfo isEditable={true} data={mockProfile} />);

  test('passes correct props to Avatar', () => {
    renderMain();

    const lastCall = Avatar.mock.calls.at(-1)[0];

    expect(lastCall).toEqual({
      isEditable: true,
      data: mockProfile.avatarUrl,
    });
  });

  test('passes correct props to Skills', () => {
    renderMain();

    const lastCall = Skills.mock.calls.at(-1)[0];

    expect(lastCall).toEqual({
      isEditable: true,
      skills: mockProfile.skills,
    });
  });

  test('passes correct props to OpenToWork', () => {
    renderMain();

    const lastCall = OpenToWork.mock.calls.at(-1)[0];

    expect(lastCall).toEqual({
      isTrue: mockProfile.isOpenToWork,
      isEditable: true,
    });
  });

  test('passes correct props to PersonalInfo', () => {
    renderMain();

    const lastCall = PersonalInfo.mock.calls.at(-1)[0];

    expect(lastCall).toEqual({
      isEditable: true,
      data: {
        firstName: mockProfile.firstName,
        lastName: mockProfile.lastName,
        dateOfBirth: mockProfile.dateOfBirth,
        location: mockProfile.location,
      },
    });
  });
});

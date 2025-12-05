import Avatar from '@/components/ProfileItems/Avatar';
import OpenToWork from '@/components/ProfileItems/StatusController';
import Skills from '@/components/ProfileItems/Skills';
import PersonalInfo from '@/components/ProfileItems/PersonalInfo';
import classes from './Profile.module.css';
import { ProfileData } from '@/types/profile';

interface Props {
  isEditable: boolean;
  data: ProfileData;
}

export default function MainInfo({ isEditable, data }: Props) {
  const personalInfo = {
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    location: data.location,
  };

  return (
    <div className={classes['main-info']}>
      <Avatar
        key={`avatar-${data.id}`}
        isEditable={isEditable}
        data={data.avatarUrl}
      />
      <div className={classes['main-info-side']}>
        <div className={classes['skills-open-container']}>
          <Skills isEditable={isEditable} skills={data.skills} />
          <OpenToWork isEditable={isEditable} isTrue={data.isOpenToWork} />
        </div>
        <PersonalInfo isEditable={isEditable} data={personalInfo} />
      </div>
    </div>
  );
}

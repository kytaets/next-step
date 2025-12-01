import Contacts from '@/components/ProfileItems/Contacts';
import Bio from '@/components/ProfileItems/Description';
import Languages from '@/components/ProfileItems/Languages';
import Certificates from '@/components/ProfileItems/Certificates';
import WorkExperience from '@/components/ProfileItems/WorkExperience';
import Education from '@/components/ProfileItems/Education';

import classes from './Profile.module.css';
import { ProfileData } from '@/types/profile';
import { userData } from '@/lib/profile-data';
import BottomRow from './BottomRow';
import MainInfo from './MainInfo';

interface Props {
  isEditable?: boolean;
  profileData: ProfileData;
}

export default function ProfileContainer({
  isEditable = false,
  profileData,
}: Props) {
  return (
    <div className={classes['profile-container']}>
      {isEditable && (
        <h1 className={classes['page-header']}>Your Next Level Profile</h1>
      )}
      <MainInfo isEditable={isEditable} data={profileData} />
      <Contacts isEditable={isEditable} data={profileData.contacts} />
      <Bio isEditable={isEditable} data={profileData.bio} />
      <WorkExperience isEditable={isEditable} data={userData.experience} />
      <Education isEditable={isEditable} data={userData.education} />
      <Certificates isEditable={isEditable} data={userData.certificates} />
      <Languages isEditable={isEditable} data={profileData.languages} />
      <BottomRow isEditable={isEditable} data={profileData.createdAt} />
    </div>
  );
}

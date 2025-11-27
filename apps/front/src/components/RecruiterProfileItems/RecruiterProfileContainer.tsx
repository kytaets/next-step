import Avatar from '../ProfileItems/Avatar';

import profileClasses from '../ProfileItems/Profile.module.css';
import BottomRow from '../ProfileItems/BottomRow';
import RecruiterPersonalInfo from './RecruiterPersonalInfo';
import { RecruiterProfileData } from '@/types/recruiter';

interface Props {
  isEditable?: boolean;
  recruiterData: RecruiterProfileData;
}

export default function RecruiterProfileContainer({
  isEditable = false,
  recruiterData,
}: Props) {
  console.log(recruiterData);

  const mainInfoData = {
    id: recruiterData.id,
    firstName: recruiterData.firstName,
    lastName: recruiterData.lastName,
    role: recruiterData.role,
  };

  return (
    <div className={profileClasses['profile-container']}>
      {isEditable && (
        <h1 className={profileClasses['page-header']}>Your Amazing Company</h1>
      )}
      <div className={profileClasses['main-info']}>
        <Avatar
          key={`avatar-${recruiterData.id}`}
          isEditable={isEditable}
          data={recruiterData.avatarUrl}
          type="recruiter"
        />
        <div className="align-center">
          <div className={profileClasses['main-info-side']}>
            <RecruiterPersonalInfo
              isEditable={isEditable}
              data={mainInfoData}
            />
          </div>
        </div>
      </div>
      <BottomRow
        isEditable={isEditable}
        data={recruiterData.createdAt}
        type="recruiter"
      />
    </div>
  );
}

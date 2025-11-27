import { useRouter } from 'next/navigation';

import Avatar from '../ProfileItems/Avatar';
import profileClasses from '../ProfileItems/Profile.module.css';
import BottomRow from '../ProfileItems/BottomRow';
import RecruiterPersonalInfo from './RecruiterPersonalInfo';
import HoveredItem from '../HoveredItem/HoveredItem';

import classes from './RecruiterProfileItems.module.css';

import { RecruiterProfileData } from '@/types/recruiter';

interface Props {
  isEditable?: boolean;
  recruiterData: RecruiterProfileData;
}

export default function RecruiterProfileContainer({
  isEditable = false,
  recruiterData,
}: Props) {
  const router = useRouter();

  const mainInfoData = {
    id: recruiterData.id,
    firstName: recruiterData.firstName,
    lastName: recruiterData.lastName,
    role: recruiterData.role,
  };

  const handleCompany = () => {
    router.push('/my-profile/recruiter/company');
  };

  return (
    <div className={profileClasses['profile-container']}>
      {isEditable && (
        <h1 className={profileClasses['page-header']}>
          Your Recruiter Profile
        </h1>
      )}
      <div className={profileClasses['main-info']}>
        <Avatar
          key={`avatar-${recruiterData.id}`}
          isEditable={isEditable}
          data={recruiterData.avatarUrl}
          type="recruiter"
        />
        <div className={classes['main-info']}>
          <div className="align-center">
            <div className={classes['main-info-side']}>
              <RecruiterPersonalInfo
                isEditable={isEditable}
                data={mainInfoData}
              />
            </div>
          </div>

          {isEditable && (
            <div>
              <HoveredItem>
                <button
                  className={classes['create-btn']}
                  onClick={handleCompany}
                >
                  {recruiterData.companyId
                    ? 'Your Company'
                    : 'Create a Company'}
                </button>
              </HoveredItem>
            </div>
          )}
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

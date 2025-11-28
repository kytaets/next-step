import { CompanyProfileData } from '@/types/companyProfile';

import IsVerified from '../ProfileItems/StatusController';
import Avatar from '../ProfileItems/Avatar';

import classes from './CompanyProfile.module.css';
import profileClasses from '../ProfileItems/Profile.module.css';
import CompanyMainInfo from './CompanyMainInfo';
import Bio from '../ProfileItems/Description';
import CompanyBottomRow from './CompanyBottomRow';
import Cookies from 'js-cookie';
import Link from 'next/link';
import HoveredItem from '../HoveredItem/HoveredItem';

interface Props {
  isEditable?: boolean;
  companyData: CompanyProfileData;
}

export default function CompanyProfileContainer({
  isEditable = false,
  companyData,
}: Props) {
  console.log(companyData);

  const recruiterRole = Cookies.get('recruiter-role');

  const mainInfoData = {
    id: companyData.id,
    name: companyData.name,
    url: companyData.url,
  };

  return (
    <div className={profileClasses['profile-container']}>
      {isEditable && (
        <h1 className={profileClasses['page-header']}>Your Amazing Company</h1>
      )}
      <div className={profileClasses['main-info']}>
        <Avatar
          key={`avatar-${companyData.id}`}
          isEditable={isEditable}
          data={companyData.logoUrl}
          type="company"
        />
        <div className="align-center">
          <div className={classes['main-info-side']}>
            <CompanyMainInfo isEditable={isEditable} data={mainInfoData} />
            <div className={classes['verified-invite-container']}>
              <IsVerified
                isEditable={isEditable}
                isTrue={companyData.isVerified}
                type="isVerified"
              />
              {recruiterRole === 'ADMIN' && (
                <HoveredItem>
                  <Link
                    href="/my-profile/recruiter/company/members"
                    className={classes['company-members-link']}
                  >
                    Company Members
                  </Link>
                </HoveredItem>
              )}
            </div>
          </div>
        </div>
      </div>
      <Bio
        isEditable={isEditable}
        data={companyData.description}
        type="description"
      />
      <CompanyBottomRow
        isEditable={isEditable}
        companyId={companyData.id}
        createdAt={companyData.createdAt}
      />
    </div>
  );
}

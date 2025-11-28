'use client';

import InviteBtn from '@/components/CompanyProfileItems/InviteBtn';
import { RecruiterProfileData } from '@/types/recruiter';
import Cookies from 'js-cookie';
import { useState, useEffect } from 'react';
import CompanyMember from './CompanyMember';

import classes from './CompanyProfile.module.css';

interface Props {
  members: RecruiterProfileData[] | null | undefined;
}

export default function CompanyMembersContainer({ members }: Props) {
  const [recruiterRole, setRecruiterRole] = useState<string | null>(null);

  useEffect(() => {
    setRecruiterRole(Cookies.get('recruiter-role') ?? null);
  }, []);

  if (recruiterRole === null) return null;

  return (
    <div className={classes['members-container']}>
      {recruiterRole === 'ADMIN' && <InviteBtn />}
      {members?.map((member) => {
        return <CompanyMember data={member} key={member.id} />;
      })}
    </div>
  );
}

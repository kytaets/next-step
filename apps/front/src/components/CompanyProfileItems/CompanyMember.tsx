import { RecruiterProfileData } from '@/types/recruiter';

import classes from './CompanyProfile.module.css';
import HoveredItem from '../HoveredItem/HoveredItem';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { removeRecruiter } from '@/services/companyProfileService';
import Cookies from 'js-cookie';
import MessageBox from '../MessageBox/MessageBox';

interface Props {
  data: RecruiterProfileData;
}

export default function CompanyMember({ data }: Props) {
  const [requestError, setRequestError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate: removeMutate } = useMutation({
    mutationFn: removeRecruiter,
    onSuccess: async () => {
      setRequestError(null);
      const companyId = Cookies.get('company-id');
      await queryClient.invalidateQueries({
        queryKey: ['company-members', companyId],
      });
    },

    onError: (error) => {
      setRequestError(error.message);
    },
  });

  return (
    <div className={classes['company-member']}>
      <div className={classes['member-p']}>
        <div className="align-center">
          <span>
            {data.firstName} {data.lastName} - {data.role}
          </span>
        </div>

        {data.role === 'ADMIN' && ' (You)'}
        {data.role === 'MEMBER' && (
          <div>
            {requestError && <MessageBox>{requestError}</MessageBox>}
            <button
              className={classes['form-del-btn']}
              type="button"
              onClick={() => removeMutate(data.id)}
            >
              <HoveredItem iconType={faTrash} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

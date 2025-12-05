import { isoToDate } from '@/utils/convertData';
import classes from './CompanyProfile.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import HoveredItem from '../HoveredItem/HoveredItem';
import { leaveCompany } from '@/services/recruiterProfileService';
import { deleteCompany } from '@/services/companyProfileService';

interface Props {
  isEditable: boolean;
  companyId: string;
  createdAt: string;
}

export default function CompanyBottomRow({ isEditable, createdAt }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const recruiterRole = Cookies.get('recruiter-role');

  const { mutate: leaveMutate } = useMutation({
    mutationFn: leaveCompany,
    onSuccess: () => {
      router.push('/my-profile/recruiter');
      queryClient.invalidateQueries({
        queryKey: ['company-profile'],
        exact: false,
      });
    },
    onError: (err) => {
      console.error('Leaving failed:', err);
    },
  });

  const { mutate: deleteMutate } = useMutation({
    mutationFn: deleteCompany,
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: ['company-profile'],
        exact: false,
      });

      router.replace('/my-profile/recruiter');
    },
    onError: (err) => {
      console.error('Deleting failed:', err);
    },
  });

  const handleBtnClick = () => {
    const confirmLogout = window.confirm(
      `Are you sure you want to ${
        recruiterRole === 'ADMIN' ? 'delete' : 'leave'
      } the company?`
    );
    if (!confirmLogout) return;

    if (recruiterRole === 'ADMIN') {
      deleteMutate();
    } else {
      leaveMutate();
    }
  };

  return (
    <div>
      <div className="row-space-between">
        <h3 className={classes['created-at']}>
          Created at :<span>{isoToDate(createdAt)}</span>
        </h3>
        {isEditable && (
          <>
            <div className={classes['logout-btn-container']}>
              <HoveredItem scale={1.05}>
                <button
                  className={classes['logout-btn']}
                  onClick={handleBtnClick}
                >
                  {recruiterRole === 'ADMIN'
                    ? 'Delete Company'
                    : 'Leave Company'}
                </button>
              </HoveredItem>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { isoToDate } from '@/utils/convertData';
import classes from './Profile.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutUser } from '@/services/userService';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authSlice';
import Cookies from 'js-cookie';
import HoveredItem from '../HoveredItem/HoveredItem';

interface Props {
  isEditable: boolean;
  data: string;
  type?: 'recruiter' | 'job-seeker';
}

export default function BottomRow({ isEditable, data, type }: Props) {
  const router = useRouter();
  const { setIsLogged } = useAuthStore();
  const queryClient = useQueryClient();

  const { mutate: logoutMutate } = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      router.push('/sign-in');
      Cookies.remove('sid');
      Cookies.remove('company-id');
      queryClient.clear();
      setIsLogged(false);
    },
    onError: (err) => {
      console.error('Logout failed:', err);
    },
  });

  const handleLogoutAll = () => {
    const confirmLogout = window.confirm(
      'Are you sure you want to log out from all devices?'
    );
    if (!confirmLogout) return;

    logoutMutate();
  };

  const handleChangeAccount = () => {
    router.push(type === 'recruiter' ? 'job-seeker' : 'recruiter');
  };

  return (
    <div>
      <div className="row-space-between">
        <h3 className={classes['created-at']}>
          With us from: <span>{isoToDate(data)}</span>
        </h3>
        {isEditable && (
          <HoveredItem scale={1.05}>
            <button
              className={classes['change-btn']}
              onClick={handleChangeAccount}
            >
              Change to {type === 'recruiter' ? 'job-seeker' : 'recruiter'}{' '}
              account
            </button>
          </HoveredItem>
        )}
      </div>
      <div className={classes['logout-btn-container']}>
        <HoveredItem scale={1.05}>
          <button className={classes['logout-btn']} onClick={handleLogoutAll}>
            Log out from all devices
          </button>
        </HoveredItem>
      </div>
    </div>
  );
}

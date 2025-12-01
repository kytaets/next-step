'use client';
import ApplicationContainer from '@/components/ApplicationItems/ApplicationContainer';
import MessageBox from '@/components/MessageBox/MessageBox';
import { getApplication } from '@/services/application';
import { getProfileById } from '@/services/jobseekerService';
import { VacancyApplication } from '@/types/application';
import { ApiError } from '@/types/authForm';
import { ProfileData } from '@/types/profile';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function VacancyApplicationPage() {
  const params = useParams();
  const applicationId = params.applicationSlug as string;

  const {
    data: applicationData,
    isLoading,
    isError,
    error,
  } = useQuery<VacancyApplication | null, ApiError>({
    queryKey: ['application', applicationId],
    queryFn: () => getApplication(applicationId),
    staleTime: 1000,
    retry: false,
  });

  const { data: jobSeekerData } = useQuery<ProfileData | null, ApiError>({
    queryKey: ['vacancy', applicationData?.jobSeeker.id],
    queryFn: () => getProfileById(applicationData!.jobSeeker.id),
    enabled: !!applicationData?.vacancyId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  return (
    <div className="container">
      <h1 className="page-header">Vacancy Application</h1>
      {isLoading && (
        <MessageBox type="info">Loading your application...</MessageBox>
      )}
      {isError && <MessageBox>{error.message}</MessageBox>}
      {applicationData && (
        <ApplicationContainer
          applicationData={applicationData}
          jobSeekerData={jobSeekerData}
        />
      )}
    </div>
  );
}

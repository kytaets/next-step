'use client';
import ApplicationContainer from '@/components/ApplicationItems/ApplicationContainer';
import MessageBox from '@/components/MessageBox/MessageBox';
import { getApplication } from '@/services/application';
import { getVacancyById } from '@/services/vacanciesService';
import { VacancyApplication } from '@/types/application';
import { ApiError } from '@/types/authForm';
import { VacancyData } from '@/types/vacancies';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function ApplicationPage() {
  const params = useParams();
  console.log(params);
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

  const { data: vacancyData } = useQuery<VacancyData | null, ApiError>({
    queryKey: ['vacancy', applicationData?.vacancyId],
    queryFn: () => getVacancyById(applicationData!.vacancyId),
    enabled: !!applicationData?.vacancyId,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  console.log(applicationData);

  return (
    <div className="container">
      <h1 className="page-header">Your Application</h1>
      {isLoading && (
        <MessageBox type="info">Loading your application...</MessageBox>
      )}
      {isError && <MessageBox>{error.message}</MessageBox>}
      {applicationData && (
        <ApplicationContainer
          applicationData={applicationData}
          vacancyData={vacancyData}
        />
      )}
    </div>
  );
}

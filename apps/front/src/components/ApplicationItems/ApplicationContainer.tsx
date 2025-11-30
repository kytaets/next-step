import { VacancyApplication } from '@/types/application';
import SideBox from '../VacanciesItems/VacancyPage/SideBox';
import classes from './ApplicationItems.module.css';

import { VacancyData } from '@/types/vacancies';
import { isoToDate } from '@/utils/convertData';

interface Props {
  applicationData: VacancyApplication;
  vacancyData: VacancyData | null | undefined;
}

export default function ApplicationContainer({
  applicationData,
  vacancyData,
}: Props) {
  return (
    <>
      {vacancyData && (
        <div className={classes['application-container']}>
          <div className={classes['left-container']}>
            <h1>{vacancyData.title}</h1>
            <h2>{vacancyData.description}</h2>
            <p>{applicationData.coverLetter}</p>
            <p>Status: {applicationData.status}</p>
            <p>Applied: {isoToDate(applicationData.createdAt)}</p>
          </div>

          <SideBox data={vacancyData} applyBtn={false} />
        </div>
      )}
    </>
  );
}

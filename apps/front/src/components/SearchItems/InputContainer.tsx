import AnimatedIcon from '../HoveredItem/HoveredItem';

import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import classes from './SearchVacancies.module.css';
import { ErrorMessage, Field } from 'formik';

interface Props {
  type?: 'vacancies' | 'companies' | 'jobSeekers';
}

export default function InputContainer({ type = 'vacancies' }: Props) {
  let name = 'title';

  if (type === 'companies') {
    name = 'name';
  }

  return (
    <div className={classes['input-wrapper']}>
      <Field
        className={classes['input-container']}
        name={name}
        placeholder="Search for jobs..."
      />
      <ErrorMessage name={name} component="div" />
      <button className={classes['search-btn']} type="submit" id="search-btn">
        <AnimatedIcon iconType={faMagnifyingGlass} />
      </button>
    </div>
  );
}

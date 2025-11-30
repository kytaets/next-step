import { Field } from 'formik';

import classes from './Fields.module.css';

import { capitalize } from '@/utils/convertData';
import { statusOptions } from '@/lib/appplication-data';

export default function ApplicationStatus() {
  return (
    <>
      <div className={classes['seniority']}>
        <label>Seniority</label>
        <div>
          <Field as="select" name="status" className={classes['form-input']}>
            <option value="">Select status</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {capitalize(option)}
              </option>
            ))}
          </Field>
        </div>
      </div>
    </>
  );
}

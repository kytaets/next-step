'use client';

import { useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import MessageBox from '../MessageBox/MessageBox';
import AnimatedIcon from '@/components/HoveredItem/HoveredItem';

import { faPencil, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import classes from '../ProfileItems/Profile.module.css';

import { RecruiterPersonalData, UpdateRecruiterData } from '@/types/recruiter';
import { validateCreateRecruiterForm } from '@/utils/recruiterValidation';
import { capitalize } from '@/utils/convertData';
import { updateRecruiterProfile } from '@/services/recruiterProfileService';

interface Props {
  isEditable?: boolean;
  data: RecruiterPersonalData;
}

export default function RecruiterPersonalInfo({ isEditable, data }: Props) {
  const [isChanging, setIsChanging] = useState(false);
  const [requestErrors, setRequestErrors] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const { mutate: updateInfo, isPending } = useMutation({
    mutationFn: updateRecruiterProfile,
    onSuccess: async () => {
      setRequestErrors([]);
      await queryClient.invalidateQueries({ queryKey: ['recruiter-profile'] });
      setIsChanging(false);
    },
    onError: (error) => {
      setRequestErrors([error.message ?? 'Unexpected error']);
    },
  });

  const handleCancel = () => {
    setIsChanging(false);
  };

  const handleSubmit = async (values: UpdateRecruiterData) => {
    updateInfo(values);
  };

  const initialValues: UpdateRecruiterData = {
    firstName: data.firstName,
    lastName: data.lastName,
  };

  return (
    <>
      {!isChanging ? (
        <>
          <div className={classes['personal-info']}>
            <h2>
              {data.firstName} {data.lastName}
            </h2>
            <p>Role: {capitalize(data.role)}</p>
          </div>
          {isEditable && (
            <button
              className={classes['edit-personal-info-btn']}
              onClick={() => setIsChanging(true)}
            >
              <AnimatedIcon iconType={faPencil} />
            </button>
          )}
        </>
      ) : (
        <Formik
          initialValues={initialValues}
          validate={validateCreateRecruiterForm}
          onSubmit={handleSubmit}
        >
          {({ errors }) => (
            <Form className={classes['info-form']}>
              <div className={classes['personal-info']}>
                <Field
                  className={classes['name-input']}
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                />
                <Field
                  className={classes['name-input']}
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                />
                <p>Role: {capitalize(data.role)}</p>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className={classes['personal-info-error-container']}>
                  {Object.values(errors).map((err) => (
                    <MessageBox key={err}>{err}</MessageBox>
                  ))}
                </div>
              )}

              <div className={classes['personal-info-btn-container']}>
                <button
                  className={classes['personal-info-btn-cross']}
                  type="button"
                  onClick={handleCancel}
                >
                  <AnimatedIcon iconType={faXmark} />
                </button>
                <button
                  className={classes['personal-info-btn']}
                  type="submit"
                  disabled={isPending}
                >
                  <AnimatedIcon iconType={faCheck} />
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}

      {requestErrors.length > 0 && (
        <div className={classes['personal-info-error-container']}>
          {requestErrors.map((error) => (
            <MessageBox key={error}>{error}</MessageBox>
          ))}
        </div>
      )}
    </>
  );
}

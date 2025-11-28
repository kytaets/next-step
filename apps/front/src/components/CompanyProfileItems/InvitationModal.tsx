'use client';

import { Field, Form, Formik } from 'formik';
import HoveredItem from '../HoveredItem/HoveredItem';

import classes from './CompanyProfile.module.css';
import { useMutation } from '@tanstack/react-query';
import { sendInvite } from '@/services/companyProfileService';
import { useState } from 'react';
import MessageBox from '../MessageBox/MessageBox';
import { validateInvitationForm } from '@/utils/recruiterValidation';

export default function InvitationModal() {
  const [requestError, setRequestError] = useState<string | null>(null);

  const {
    mutate: sendInviteFn,
    isSuccess,
    isError,
    isPending,
  } = useMutation({
    mutationFn: sendInvite,
    onSuccess: async () => {
      setRequestError(null);
    },

    onError: (error) => {
      setRequestError(error.message);
    },
  });

  return (
    <div className={classes['invitation-modal']}>
      <h2>Send invitation</h2>
      <Formik
        initialValues={{ email: '' }}
        validate={validateInvitationForm}
        onSubmit={(values) => {
          sendInviteFn({
            email: values.email?.trim() === '' ? null : values.email?.trim(),
          });
        }}
      >
        {({ errors, touched }) => (
          <Form className={classes['invitation-form']}>
            <div className={classes['invitation-form-container']}>
              <Field
                name="email"
                type="text"
                placeholder="Enter email to send invitation..."
                className={`${classes['form-input']} ${classes['form-details']}`}
              />
            </div>

            {errors.email && touched.email && (
              <div className={classes['validation-error']}>{errors.email}</div>
            )}
            {isError && <MessageBox type="error">{requestError}</MessageBox>}
            {isSuccess && (
              <MessageBox type="info">Invitation sent successfully!</MessageBox>
            )}
            <div className={classes['info-form-btn-container']}>
              <button
                type="submit"
                className={classes['info-form-btn']}
                disabled={isPending}
              >
                <HoveredItem scale={1.07}>
                  {!isPending ? 'Send invitation' : 'Sending...'}
                </HoveredItem>
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

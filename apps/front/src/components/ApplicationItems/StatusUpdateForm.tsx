'use client';

import { Formik, Form, Field } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import classes from './ApplicationItems.module.css';
import { statusOptions } from '@/lib/appplication-data';
import { updateApplicationStatus } from '@/services/application';
import MessageBox from '@/components/MessageBox/MessageBox';
import { useRouter } from 'next/navigation';

interface Props {
  applicationId: string;
  currentStatus: string;
  onClose: () => void;
}

export default function StatusUpdateForm({
  applicationId,
  currentStatus,
  onClose,
}: Props) {
  const queryClient = useQueryClient();

  const router = useRouter();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (values: { status: string }) =>
      updateApplicationStatus(applicationId, { status: values.status }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['application', applicationId],
      });
      router.push('.');
      onClose();
    },
  });

  return (
    <Formik
      initialValues={{ status: currentStatus }}
      onSubmit={(values) => mutate(values)}
    >
      {() => (
        <Form className={classes['form-container']}>
          <Field as="select" name="status" className={classes['form-input']}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Field>

          {error && (
            <MessageBox type="error">
              {(error as any).message || 'Update failed'}
            </MessageBox>
          )}

          <div className={classes['btn-container']}>
            <button
              type="button"
              className={classes['cancel-btn']}
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={classes['submit-btn']}
              disabled={isPending}
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

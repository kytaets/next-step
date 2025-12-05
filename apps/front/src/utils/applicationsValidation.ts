import { ApplicationSearchData } from '@/types/application';

export function submitApplicationsSearchForm(
  values: ApplicationSearchData,
  onSubmit: (values: any) => void
) {
  const cleaned = Object.fromEntries(
    Object.entries(values).filter(([key, value]) => {
      if (key === 'status') return value !== undefined;
      if (key === 'page') return true;
      return value !== undefined && value !== null;
    })
  );

  if (!cleaned.page) cleaned.page = 1;

  onSubmit(cleaned);
}

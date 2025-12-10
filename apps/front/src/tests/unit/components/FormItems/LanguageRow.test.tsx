import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LanguageRow from '@/components/FormItems/LanguageRow';
import { Formik } from 'formik';
import { LanguageData } from '@/types/profile';
import { clientLanguageLevels } from '@/lib/profile-data';

function renderWithFormik(ui: React.ReactNode, initialValues = {}) {
  return render(
    <Formik initialValues={initialValues} onSubmit={() => {}}>
      {() => ui}
    </Formik>
  );
}

describe('LanguageRow component', () => {
  const languagesList: LanguageData[] = [
    { id: '1', name: 'English' },
    { id: '2', name: 'German' },
  ];

  test('renders language and level selects', () => {
    renderWithFormik(
      <LanguageRow
        index={0}
        languagesList={languagesList}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByText('Select language')).toBeInTheDocument();
    expect(screen.getByText('Select level')).toBeInTheDocument();
  });

  test('renders language options', () => {
    renderWithFormik(
      <LanguageRow
        index={0}
        languagesList={languagesList}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'German' })).toBeInTheDocument();
  });

  test('renders level options', () => {
    renderWithFormik(
      <LanguageRow
        index={0}
        languagesList={languagesList}
        onRemove={jest.fn()}
      />
    );

    clientLanguageLevels.forEach((label) => {
      expect(screen.getByRole('option', { name: label })).toBeInTheDocument();
    });
  });

  test('correct input names when type !== tagBox', () => {
    const { container } = renderWithFormik(
      <LanguageRow
        index={0}
        languagesList={languagesList}
        onRemove={jest.fn()}
      />
    );

    const langSelect = container.querySelector(
      'select[name="languages[0].language.id"]'
    );
    const levelSelect = container.querySelector(
      'select[name="languages[0].level"]'
    );

    expect(langSelect).toBeInTheDocument();
    expect(levelSelect).toBeInTheDocument();
  });

  test('correct input names when type = tagBox', () => {
    const { container } = renderWithFormik(
      <LanguageRow
        index={1}
        type="tagBox"
        languagesList={languagesList}
        onRemove={jest.fn()}
      />
    );

    const langSelect = container.querySelector(
      'select[name="requiredLanguages[1].language.id"]'
    );
    const levelSelect = container.querySelector(
      'select[name="requiredLanguages[1].level"]'
    );

    expect(langSelect).toBeInTheDocument();
    expect(levelSelect).toBeInTheDocument();
  });

  test('calls onRemove when delete button clicked', () => {
    const mockRemove = jest.fn();

    renderWithFormik(
      <LanguageRow
        index={0}
        languagesList={languagesList}
        onRemove={mockRemove}
      />
    );

    const btn = screen.getByRole('button');
    fireEvent.click(btn);

    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});

import { FieldArray, FormikValues } from 'formik';

import AnimatedIcon from '@/components/HoveredItem/HoveredItem';
import RequestErrors from '../RequestErrors/RequestErrors';

import { faTrash } from '@fortawesome/free-solid-svg-icons';
import classes from './FormItems.module.css';

import { SkillData, SkillItem } from '@/types/profile';

interface Props {
  values: FormikValues;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  skillsList: SkillItem[] | null;
  fetchSkillsError?: { message: string } | null;
}

export default function SkillsRow({
  values,
  handleChange,
  setFieldValue,
  skillsList,
  fetchSkillsError,
}: Props) {
  return (
    <FieldArray name="skills">
      {({ remove, push }) => {
        return (
          <div className={classes['skills']}>
            {values.skills.map((s: SkillData, index: number) => (
              <div key={s.skill.id} className={classes['del-btn-box']}>
                <span>{s.skill.name}</span>{' '}
                <button
                  type="button"
                  className={classes['del-skill-btn']}
                  onClick={() => remove(index)}
                >
                  <AnimatedIcon iconType={faTrash} />
                </button>
              </div>
            ))}

            <div className={classes['autocomplete-wrapper']}>
              <input
                type="text"
                name="newSkill"
                className={classes['form-input']}
                placeholder="Add skill"
                value={values.newSkill}
                onChange={handleChange}
                autoComplete="off"
                onFocus={() => setFieldValue('showList', true)} // нове
              />

              {(values.showList || values.newSkill.trim()) && (
                <ul className={classes['autocomplete-list']}>
                  {fetchSkillsError?.message && (
                    <RequestErrors error={fetchSkillsError.message} />
                  )}

                  {skillsList &&
                    skillsList
                      .filter((item) => {
                        const exists = values.skills.some(
                          (s: SkillData) => s.skill.id === item.id
                        );
                        if (exists) return false;

                        const search = values.newSkill.trim().toLowerCase();
                        if (!search) return true;

                        return item.name.toLowerCase().includes(search);
                      })
                      .slice(0, 8)
                      .map((item) => (
                        <li
                          key={item.id}
                          className={classes['autocomplete-item']}
                          onClick={() => {
                            push({ skill: item });
                            setFieldValue('newSkill', '');
                            setFieldValue('showList', false);
                          }}
                        >
                          {item.name}
                        </li>
                      ))}
                </ul>
              )}
            </div>
          </div>
        );
      }}
    </FieldArray>
  );
}

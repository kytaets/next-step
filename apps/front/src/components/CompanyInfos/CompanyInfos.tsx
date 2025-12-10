import CompanyInfoBox from './CompanyInfoBox';
import classes from './CompanyInfos.module.css';

export default function CompanyInfos() {
  return (
    <ul className={classes['companies-container']}>
      {Array.from({ length: 8 }).map((_, index) => (
        <li key={index}>
          <CompanyInfoBox />
        </li>
      ))}
    </ul>
  );
}

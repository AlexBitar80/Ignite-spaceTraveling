
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.headerContainer}>
      <a href="/" className={styles.headerContent}>
        <img src="/images/Logo.svg" alt="logo" />
      </a>
    </header >
  );
}

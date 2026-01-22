
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Notas Nocea</h1>
        <p>Selecciona un archivo para empezar o crea uno nuevo.</p>
      </header>
      <main className={styles.main}>
        <div className={styles.emptyState}>
          <p>No document selected</p>
        </div>
      </main>
    </div>
  );
}

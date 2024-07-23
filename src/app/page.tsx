import Image from 'next/image';
import styles from './page.module.css';

export default function Home() {
    return (
        <main className={styles.main}>
            <Image src='/logo.png' alt='' width={100} height={100} />
        </main>
    );
}

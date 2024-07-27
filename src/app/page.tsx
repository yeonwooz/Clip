import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';
import Button from './components/Buttons';

export default function Home() {
    return (
        <main className={styles.main}>
            <Image className={styles.logo} src='/logo.png' alt='' width={100} height={100} />
            <div className={styles.buttonWrapper}>
                <Link href='/chat' prefetch={true} shallow>
                    <Button type='ok' onClick={() => {}}>
                        채팅하러 가기
                    </Button>
                </Link>
            </div>
        </main>
    );
}

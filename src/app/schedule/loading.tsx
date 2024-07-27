import styles from './schedule.module.css';
import Image from 'next/image';

const LoadingSchedule: React.FC = () => {
    return (
        <div className={styles.loadingPageContainer}>
            <div>
                <Image className={styles.logo} src='/logo.png' alt='' width={136} height={136} />
            </div>
            <div className={styles.loadingText}>
                여행 일정을 <br />
                생성하고 있어요
            </div>
        </div>
    );
};

export default LoadingSchedule;

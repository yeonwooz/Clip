import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import Image from 'next/image';
import { useAtom } from 'jotai';
import { scheduleLoadingAtom } from '~/store/scheduleAtom';
import { pageTitleAtom, leftIconAtom, rightIconAtom, LeftIcon, RightIcon } from '~/store/headerAtoms';
import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();
    const [loading] = useAtom(scheduleLoadingAtom);
    const [pageTitle] = useAtom(pageTitleAtom);
    const [leftIcon] = useAtom(leftIconAtom);
    const [rightIcon] = useAtom(rightIconAtom);

    return (
        <div className={`${styles.headerContainer} ${loading ? styles.loadingSchedule : ''}`}>
            {leftIcon === LeftIcon.back ? (
                <span
                    className={styles.iconButton}
                    aria-label='go_back_button'
                    onClick={() => {
                        router.back();
                    }}
                >
                    <Image src='/icons/Chevron_left.svg' alt='go_back' width={20} height={20} />
                </span>
            ) : leftIcon === LeftIcon.chat ? (
                <span className={styles.iconButton} aria-label='chat_button'>
                    <Image src='/icons/Message_circle.svg' alt='chat' width={20} height={20} />
                </span>
            ) : (
                <div></div>
            )}

            {pageTitle ? (
                <span className={styles.title}>{pageTitle}</span>
            ) : (
                <Link href='/' prefetch={true} shallow>
                    <span className={styles.title}>CLIP</span>
                </Link>
            )}

            {rightIcon === RightIcon.calendar ? (
                <Link href='/schedule' prefetch={true} shallow>
                    <span aria-label='calendar_button'>
                        <Image src='/icons/Calendar.svg' alt='calendar' width={20} height={20} />
                    </span>
                </Link>
            ) : rightIcon === RightIcon.write ? (
                <span className={styles.iconButton} aria-label='chat_button'>
                    <Image src='/icons/Write.svg' alt='write' width={20} height={20} />
                </span>
            ) : (
                <div></div>
            )}
        </div>
    );
}

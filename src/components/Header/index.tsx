import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import Image from 'next/image';
import { useAtom } from 'jotai';
import { scheduleLoadingAtom } from '~/store/scheduleAtom';
import { pageTitleAtom } from '~/store/headerAtoms';

interface HeaderProps {
    showBackButton: boolean;
}

export default function Header({ showBackButton }: HeaderProps) {
    const [loading] = useAtom(scheduleLoadingAtom);
    const [pageTitle] = useAtom(pageTitleAtom);

    return (
        <div className={`${styles.headerContainer} ${loading ? styles.loadingSchedule : ''}`}>
            {showBackButton ? (
                <span aria-label='go_back_button'>
                    <Image src='/icons/Chevron_left.svg' alt='go_back' width={20} height={20} />
                </span>
            ) : (
                <span aria-label='chat_button'>
                    <Image src='/icons/Message_circle.svg' alt='chat' width={20} height={20} />
                </span>
            )}

            <Link href='/' prefetch={true} shallow>
                <span className={styles.title}>{pageTitle || 'CLIP'}</span>
            </Link>
            <Link href='/schedule' prefetch={true} shallow>
                <span aria-label='calendar_button'>
                    <Image src='/icons/Calendar.svg' alt='calendar' width={20} height={20} />
                </span>
            </Link>
        </div>
    );
}

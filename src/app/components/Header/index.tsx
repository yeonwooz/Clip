import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import Image from 'next/image';

interface HeaderProps {
    showBackButton: boolean;
}

export default function Header({ showBackButton }: HeaderProps) {
    return (
        <div className={styles.headerContainer}>
            {showBackButton ? (
                <span aria-label='go_back_button'>
                    <Image src='/icons/Chevron_left.svg' alt='go_back' width={20} height={20} />
                </span>
            ) : (
                <span aria-label='chat_button'>
                    <Image src='/icons/Message_circle.svg' alt='chat' width={20} height={20} />
                </span>
            )}

            <Link href='/'>
                <span className={styles.title}>CLIP</span>
            </Link>
            <span aria-label='calendar_button'>
                <Image src='/icons/Calendar.svg' alt='calendar' width={20} height={20} />
            </span>
        </div>
    );
}

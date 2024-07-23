import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
    return (
        <div className={styles.headerContainer}>
            <span className={styles.iconButton} aria-label='menu'>
                a
            </span>
            <Link href='/'>
                <span className={styles.title}>CLIP</span>
            </Link>{' '}
            <span className={styles.span} aria-label='calendar'>
                c
            </span>
        </div>
    );
}

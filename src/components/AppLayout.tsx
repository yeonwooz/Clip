'use client';

import React, { useEffect, useState } from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';
import styles from './AppLoyout.module.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showHeader, setShowHeader] = useState(false);

    useEffect(() => {
        if (pathname !== '/') {
            setShowHeader(true);
        } else {
            setShowHeader(false);
        }
        // TODO: setShowBackButton
    }, [pathname]);

    return (
        <div className={styles.container}>
            {showHeader && <Header />}
            <div className={styles.contentsContainer}>
                {React.cloneElement(children as React.ReactElement, { setShowHeader })}
            </div>
        </div>
    );
}

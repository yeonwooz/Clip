'use client';

import React, { useEffect, useState } from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showHeader, setShowHeader] = useState(false);
    const [showBackButton, setShowBackButton] = useState(false);

    useEffect(() => {
        if (pathname === '/') {
            setShowHeader(pathname !== '/');
        } else {
            setShowHeader(true);
        }
        // TODO: setShowBackButton
    }, [pathname]);

    return (
        <>
            {showHeader && <Header showBackButton={showBackButton} />}
            {React.cloneElement(children as React.ReactElement, { setShowHeader })}
        </>
    );
}

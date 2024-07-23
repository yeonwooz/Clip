'use client';

import React, { useEffect, useState } from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [showHeader, setShowHeader] = useState(false);

    useEffect(() => {
        if (pathname === '/') {
            setShowHeader(pathname !== '/');
        } else {
            setShowHeader(true);
        }
    }, [pathname]);
    return (
        <>
            {showHeader && <Header />}
            {React.cloneElement(children as React.ReactElement, { setShowHeader })}
        </>
    );
}

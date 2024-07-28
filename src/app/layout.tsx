import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import AppLayout from '~/components/AppLayout';
import localFont from 'next/font/local';

export const metadata: Metadata = {
    title: 'Clip',
    description: '네이버 클로바 AI가 추천해주는 여행 추천 어플',
};

const pretendard = localFont({
    src: '../../public/fonts/PretendardVariable.woff2',
    display: 'swap',
    weight: '45 920',
    variable: '--font-pretendard',
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='ko'>
            <body className={pretendard.className}>
                <Providers>
                    <AppLayout>{children}</AppLayout>
                </Providers>
            </body>
        </html>
    );
}

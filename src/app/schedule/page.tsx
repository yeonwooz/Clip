'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { scheduleAtom, scheduleLoadingAtom, scheduleErrorAtom } from '../store/scheduleAtom';
import { useFetchSchedule } from '../store/scheduleActions';

const SchedulePage: React.FC = () => {
    const [data] = useAtom(scheduleAtom);
    const [loading] = useAtom(scheduleLoadingAtom);
    const [error] = useAtom(scheduleErrorAtom);
    const fetchSchedule = useFetchSchedule();

    useEffect(() => {
        fetchSchedule();
    }, []);

    if (loading) {
        return <p>로딩 중...</p>;
    }
    if (error) {
        return <p>에러 발생: {error?.message}</p>;
    }

    return (
        <div>
            <h1>스케줄 페이지</h1>
            {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>데이터가 없습니다.</p>}
        </div>
    );
};

export default SchedulePage;

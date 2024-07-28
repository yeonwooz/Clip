import { useSetAtom } from 'jotai';
import { postData } from '../api';
import { schedulesAtom, scheduleLoadingAtom, scheduleErrorAtom } from './scheduleAtom';

// TODO: 사용자 정보 store 생기면 교체
export interface Param {
    region: string;
    startDate: string;
    endDate: string;
    min: number | null;
}

export const useFetchSchedule = () => {
    const setSchedule = useSetAtom(schedulesAtom);
    const setLoading = useSetAtom(scheduleLoadingAtom);
    const setError = useSetAtom(scheduleErrorAtom);

    const fetchSchedule = async (param: Param) => {
        setLoading(true);
        setError(null);
        try {
            const data = await postData('/schedule', param);
            setSchedule(data);
        } catch (error) {
            setError(error || null);
        } finally {
            setLoading(false);
        }
    };

    return fetchSchedule;
};

import { useSetAtom } from 'jotai';
import { fetchData } from '../api';
import { scheduleAtom, scheduleLoadingAtom, scheduleErrorAtom } from './scheduleAtom';

export const useFetchSchedule = () => {
    const setSchedule = useSetAtom(scheduleAtom);
    const setLoading = useSetAtom(scheduleLoadingAtom);
    const setError = useSetAtom(scheduleErrorAtom);

    const fetchSchedule = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchData('/schedule');
            setSchedule(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return fetchSchedule;
};

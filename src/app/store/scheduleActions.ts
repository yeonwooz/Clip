import { useSetAtom } from 'jotai';
import { postData } from '../api';
import { scheduleAtom, scheduleLoadingAtom, scheduleErrorAtom } from './scheduleAtom';

export const useFetchSchedule = () => {
    const setSchedule = useSetAtom(scheduleAtom);
    const setLoading = useSetAtom(scheduleLoadingAtom);
    const setError = useSetAtom(scheduleErrorAtom);

    const fetchSchedule = async (param) => {
        setLoading(true);
        setError(null);
        try {
            const data = await postData('/schedule', param);
            setSchedule(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    return fetchSchedule;
};

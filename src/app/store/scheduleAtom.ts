import { atom } from 'jotai';

interface ScheduleItem {
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    address: string;
}

interface Schedule {
    date: string;
    items: ScheduleItem[];
}

export const scheduleAtom = atom<Schedule[]>([]);

export const scheduleLoadingAtom = atom<boolean>(false);
export const scheduleErrorAtom = atom<Error | null>(null);

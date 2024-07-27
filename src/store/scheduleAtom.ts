import { atom } from 'jotai';

export interface ScheduleItem {
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    address: string;
    isDummy?: boolean;
}

export interface Schedule {
    date: string;
    item: ScheduleItem[];
}

export const shouldFetchSchedule = atom<boolean>(false);
export const schedulesAtom = atom<Schedule[]>([]);
export const scheduleLoadingAtom = atom<boolean>(false);
export const scheduleErrorAtom = atom<any | null>(null);

import { atom } from 'jotai';

export const birthYearAtom = atom<string | null>(null);
export const genderAtom = atom<string | null>(null);

export const regionAtom = atom<string | null>(null);
export const startDateAtom = atom<string>('');
export const endDateAtom = atom<string>('');
export const minAtom = atom<number | null>(null);

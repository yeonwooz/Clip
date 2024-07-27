import { atom } from 'jotai';

export enum LeftIcon {
    back,
    chat,
}

export enum RightIcon {
    calendar,
    write,
}

export const pageTitleAtom = atom<string>('');
export const leftIconAtom = atom<LeftIcon | null>(null);
export const rightIconAtom = atom<RightIcon | null>(null);

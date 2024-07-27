'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import {
    scheduleLoadingAtom,
    scheduleErrorAtom,
    Schedule,
    ScheduleItem,
    shouldFetchSchedule,
    schedulesAtom,
} from '../../store/scheduleAtom';
import { useFetchSchedule } from '../../store/scheduleActions';
import styles from './schedule.module.css';
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided } from '@hello-pangea/dnd';
import Button from '~/components/Buttons';
import LoadingSchedule from './loading';
import { dummy } from './dummy';
import { useRouter } from 'next/navigation';
import { pageTitleAtom, leftIconAtom, rightIconAtom, RightIcon } from '~/store/headerAtoms';
import { regionAtom } from '~/store/atom';

const SchedulePage: React.FC = () => {
    const router = useRouter();
    const fetchSchedule = useFetchSchedule();

    const [shouldFetch] = useAtom(shouldFetchSchedule);
    const [loading] = useAtom(scheduleLoadingAtom);
    const [error] = useAtom(scheduleErrorAtom);
    const [schedulesInStore] = useAtom(schedulesAtom);
    const [pageTitle, setPageTitle] = useAtom(pageTitleAtom);
    const [leftIcon, setLeftIcon] = useAtom(leftIconAtom);
    const [rightIcon, setRightIcon] = useAtom(rightIconAtom);
    const [region] = useAtom(regionAtom);

    const [schedules, setSchedules] = useState<Schedule[]>([]);

    useEffect(() => {
        setPageTitle(`${region} 여행`);
        setLeftIcon(null);
        setRightIcon(RightIcon.write);

        if (shouldFetch) {
            fetchSchedule({
                region: '부산',
                startDate: '2024080210', // YYYYMMDDHH
                endDate: '2024080310',
                min: 4, // 하루 최소 일정 갯수
            });
            setSchedules(
                schedulesInStore.map((schedule) => ({
                    ...schedule,
                    item: schedule.item.map((item) => ({
                        ...item,
                        startTime: item.startTime.slice(0, 2) + '0000',
                        endTime: item.endTime.slice(0, 2) + '0059',
                    })),
                })),
            );
            localStorage.setItem('schedules', JSON.stringify(schedules));
        } else {
            const schedulesInLocalstorage = localStorage.getItem('schedules');
            if (schedulesInLocalstorage) {
                setSchedules(JSON.parse(schedulesInLocalstorage));
            } else {
                setSchedules(
                    dummy.map((schedule) => ({
                        ...schedule,
                        item: schedule.item.map((item) => ({
                            ...item,
                            startTime: item.startTime.slice(0, 2) + '0000',
                            endTime: item.endTime.slice(0, 2) + '0059',
                        })),
                    })),
                );
                localStorage.setItem('schedules', JSON.stringify(dummy));
            }
        }
    }, []);

    const getTimeSlots = () => {
        const timeSlots = [];
        for (let i = 0; i < 24; i++) {
            timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return timeSlots;
    };

    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) return;

        const { source, destination } = result;

        const sourceDayIndex = parseInt(source.droppableId);
        const destDayIndex = parseInt(destination.droppableId);

        const sourceIndex = source.index;
        const destIndex = destination.index;

        const sourceDay = { ...schedules[sourceDayIndex] };
        const destDay = { ...schedules[destDayIndex] };

        const movedItem = sourceDay.item[sourceIndex];

        if (destIndex < destDay.item.length) {
            // 대상 위치에 다른 아이템이 있는 경우 자리 바꿈
            const targetItem = destDay.item[destIndex];

            const tempStartTime = movedItem.startTime;
            const tempEndTime = movedItem.endTime;

            movedItem.startTime = targetItem.startTime;
            movedItem.endTime = targetItem.endTime;

            targetItem.startTime = tempStartTime;
            targetItem.endTime = tempEndTime;
        } else {
            // 대상 위치에 다른 아이템이 없는 경우 해당 위치로 이동
            movedItem.startTime = calculateNewStartTime(destIndex);
            movedItem.endTime = calculateNewEndTime(destIndex);
        }

        // 스케줄 업데이트
        const newData = [...schedules];
        newData[sourceDayIndex] = {
            ...sourceDay,
            item: sourceDay.item.filter((_, index) => index !== sourceIndex),
        };
        newData[destDayIndex] = {
            ...destDay,
            item: [...destDay.item.slice(0, destIndex), movedItem, ...destDay.item.slice(destIndex)],
        };

        setSchedules(newData);
    };

    const calculateNewStartTime = (index: number) => {
        const hours = String(index).padStart(2, '0');
        return `${hours}0000`;
    };

    const calculateNewEndTime = (index: number) => {
        const hours = String(index).padStart(2, '0');
        return `${hours}0059`;
    };

    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

    const formatDate = (dateString: string) => {
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        const date = new Date(`${year}-${month}-${day}`);
        const dayOfWeek = daysOfWeek[date.getDay()];
        return {
            year,
            month,
            day,
            dayOfWeek,
        };
    };

    function saveDateToLocalStorage(dateString: string, timeString: string, key: string) {
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);

        const hours = timeString.slice(0, 2);
        const minutes = timeString.slice(2, 4);

        const timePattern = /^([01]\d|2[0-3])([0-5]\d)$/;
        if (!timePattern.test(timeString)) {
            console.error('Invalid time format. Please use HHmm format.');
            return;
        }

        const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:00`;

        localStorage.setItem(key, dateTimeString);
    }

    const handleClickItem = (date: string, item: ScheduleItem) => {
        const daysLength = schedules.length - 1;
        const firstDate = schedules[0];
        const lastDate = schedules[daysLength - 1];
        saveDateToLocalStorage(firstDate.date, firstDate.item[0].startTime, 'minDate');
        saveDateToLocalStorage(lastDate.date, lastDate.item[lastDate.item.length - 1].startTime, 'maxDate');
        saveDateToLocalStorage(date, item.startTime, 'scheduleDate');

        localStorage.setItem('scheduleDetail', JSON.stringify(item));
        router.push(`/scheduleDetail?${item.title}-${item.startTime}`);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.preventDefault();
    };

    const handleMouseUp = (date: string, item: ScheduleItem) => {
        handleClickItem(date, item);
    };
    const handleMouseLeave = () => {};

    if (loading) {
        return <LoadingSchedule />;
    }
    if (error) {
        return <div className={styles.errorPageContainer}>서버 에러{error?.message}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.scheduleGridContainer}>
                    <div className={styles.timeLabels}>
                        {getTimeSlots().map((timeSlot, idx) => (
                            <div className={styles.timeLabel} key={idx}>
                                {timeSlot}
                            </div>
                        ))}
                    </div>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <div className={styles.scheduleGrid}>
                            {schedules.map((daySchedule: Schedule, dayIndex) => (
                                <Droppable droppableId={`${dayIndex}`} key={dayIndex} type='ITEM'>
                                    {(provided, snapshot) => (
                                        <div
                                            className={styles.scheduleDay}
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            <div className={styles.dateTextContainer}>
                                                <div className={styles.dateText}>
                                                    {formatDate(daySchedule.date).month}.
                                                    {formatDate(daySchedule.date).day}.
                                                </div>
                                                <div className={styles.dateText}>
                                                    {formatDate(daySchedule.date).dayOfWeek}요일
                                                </div>
                                            </div>
                                            {daySchedule.item.map((item, itemIdx) => {
                                                const topPosition = parseInt(item.startTime.slice(0, 2)) * 60 + 'px';
                                                return (
                                                    <Draggable
                                                        key={`${dayIndex}-${item.title}-${item.startTime}`}
                                                        draggableId={`${dayIndex}-${item.title}-${item.startTime}`}
                                                        index={itemIdx}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                className={styles.scheduleItem}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onMouseDown={(e) => handleMouseDown(e)}
                                                                onMouseUp={() => handleMouseUp(daySchedule.date, item)}
                                                                onMouseLeave={() => handleMouseLeave()}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    top: topPosition,
                                                                    left: '0px',
                                                                    position: 'absolute',
                                                                    zIndex: snapshot.isDragging ? 1000 : 'auto',
                                                                    cursor: 'pointer',
                                                                }}
                                                            >
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className={styles.dragHandle}
                                                                >
                                                                    <p>
                                                                        <strong>{item.title}</strong>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                );
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ))}
                        </div>
                    </DragDropContext>
                </div>
            </div>

            <div className={styles.buttonGroup}>
                <Button
                    type='cancel'
                    onClick={() => {
                        router.back();
                    }}
                >
                    취소
                </Button>
                <span className={styles.buttonGap} />
                <Button type='ok' onClick={() => console.log('저장 버튼 클릭됨')}>
                    저장
                </Button>
            </div>
        </div>
    );
};

export default SchedulePage;

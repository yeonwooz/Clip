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
    const [shouldFetch] = useAtom(shouldFetchSchedule);
    const [loading] = useAtom(scheduleLoadingAtom);
    const [error] = useAtom(scheduleErrorAtom);
    const [schedulesInStore] = useAtom(schedulesAtom);
    const [pageTitle, setPageTitle] = useAtom(pageTitleAtom);
    const [leftIcon, setLeftIcon] = useAtom(leftIconAtom);
    const [rightIcon, setRightIcon] = useAtom(rightIconAtom);
    const [region] = useAtom(regionAtom);

    const fetchSchedule = useFetchSchedule();
    const router = useRouter();

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [dataWithDummyItems, setDataWithDummyItems] = useState<Schedule[]>([]);

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
            setSchedules(schedulesInStore);
            localStorage.setItem('schedules', JSON.stringify(schedules));
        } else {
            // setSchedules(dummy);
            // localStorage.setItem('schedules', JSON.stringify(dummy));

            const schedulesInLocalstorage = localStorage.getItem('schedules');
            if (schedulesInLocalstorage) {
                setSchedules(JSON.parse(schedulesInLocalstorage));
            }
        }
    }, []);

    useEffect(() => {
        const allItems: Schedule[] = schedules?.map((daySchedule) => addDummyItems(daySchedule));
        setDataWithDummyItems(allItems);
    }, [schedules]);

    const getTimeSlots = () => {
        const timeSlots = [];
        for (let i = 0; i < 24; i++) {
            timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return timeSlots;
    };

    const addDummyItems = (daySchedule: Schedule) => {
        const timeSlots = getTimeSlots();
        const existingTimes = daySchedule.item.map((item) => item.startTime.slice(0, 2) + ':00');
        const dummyItems = timeSlots
            .filter((timeSlot) => !existingTimes.includes(timeSlot))
            .map((timeSlot, index) => ({
                title: `빈 시간 ${index}`,
                startTime: timeSlot.replace(':', '') + '00',
                endTime: timeSlot.replace(':', '') + '59',
                description: '',
                address: '',
                isDummy: true, // 더미 아이템임을 표시
            }));

        return { ...daySchedule, item: [...daySchedule.item, ...dummyItems] };
    };

    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        if (!result.destination) return;

        const { source, destination } = result;

        const sourceDayIndex = parseInt(source.droppableId);
        const destDayIndex = parseInt(destination.droppableId);

        const sourceIndex = source.index;
        const destIndex = destination.index;

        const sourceDay = { ...dataWithDummyItems[sourceDayIndex] };
        const destDay = { ...dataWithDummyItems[destDayIndex] };

        const [movedItem] = sourceDay.item.splice(sourceIndex, 1);

        const newStartTime = calculateNewStartTime(destIndex);
        movedItem.startTime = newStartTime;

        destDay.item.splice(destIndex, 0, movedItem);

        const newData = [...dataWithDummyItems];
        newData[sourceDayIndex] = sourceDay;
        newData[destDayIndex] = destDay;

        setDataWithDummyItems(newData);
    };

    const calculateNewStartTime = (index: number) => {
        const hours = String(Math.floor(index)).padStart(2, '0');
        return `${hours}0000`;
    };

    // 요일 배열
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

    // 날짜 형식을 변경하는 함수
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
        // 날짜 문자열을 변환하여 원하는 형식으로 만듭니다.
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);

        // 시간 문자열을 HH:mm 형식으로 변환합니다.
        const hours = timeString.slice(0, 2);
        const minutes = timeString.slice(2, 4);

        // 시간 문자열이 올바른 형식인지 확인합니다.
        const timePattern = /^([01]\d|2[0-3])([0-5]\d)$/;
        if (!timePattern.test(timeString)) {
            console.error('Invalid time format. Please use HHmm format.');
            return;
        }

        // ISO 8601 형식의 날짜 및 시간 문자열 생성
        const dateTimeString = `${year}-${month}-${day}T${hours}:${minutes}:00`;

        // 로컬 스토리지에 저장
        localStorage.setItem(key, dateTimeString);
    }

    const handleClickItem = (date: string, item: ScheduleItem) => {
        if (item.isDummy) {
            return;
        }

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
        // setGrabbing(true);
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
                            {dataWithDummyItems.map((daySchedule: Schedule, dayIndex) => (
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
                                                                className={`${styles.scheduleItem} ${
                                                                    item.isDummy ? styles.hiddenItem : ''
                                                                }`}
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
                                                                    visibility:
                                                                        snapshot.isDragging || !item.isDummy
                                                                            ? 'visible'
                                                                            : 'hidden',
                                                                }}
                                                            >
                                                                <div
                                                                    {...provided.dragHandleProps}
                                                                    className={styles.dragHandle}
                                                                >
                                                                    {!item.isDummy && (
                                                                        <p>
                                                                            <strong>{item.title}</strong>
                                                                        </p>
                                                                    )}
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

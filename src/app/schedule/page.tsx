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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (shouldFetch) {
            fetchSchedule({
                region: '부산',
                startDate: '2024080210', // YYYYMMDDHH
                endDate: '2024080310',
                min: 4, // 하루 최소 일정 갯수
            });

            const newSchedules = schedulesInStore.map((schedule) => ({
                ...schedule,
                item: schedule.item.map((item) => ({
                    ...item,
                    startTime: item.startTime.slice(0, 2) + '0000',
                    endTime: item.endTime.slice(0, 2) + '0059',
                })),
            }));
            setSchedules(newSchedules);
            localStorage.setItem('schedules', JSON.stringify(newSchedules));
        } else {
            const schedulesInLocalstorage = localStorage.getItem('schedules');
            if (schedulesInLocalstorage) {
                setSchedules(JSON.parse(schedulesInLocalstorage));
            } else {
                setSchedules(dummy);
                localStorage.setItem('schedules', JSON.stringify(dummy));
            }
        }
        // shouldFetch, fetchSchedule, schedulesInStore, region, setPageTitle, setLeftIcon, setRightIcon
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldFetch, schedulesInStore]);

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

        // 기존 날짜와 날짜의 배열 복사
        const sourceDay = { ...schedules[sourceDayIndex] };
        const destDay = { ...schedules[destDayIndex] };

        // 드래그한 아이템을 기존 날짜에서 제거
        const movedItem = sourceDay.item[sourceIndex];
        const updatedSourceDayItems = sourceDay.item.filter((_, idx) => idx !== sourceIndex);

        // 새 날짜와 시간 슬롯 계산
        const newStartHour = parseInt(getTimeSlots()[destination.index].slice(0, 2), 10);
        const itemDuration =
            parseInt(movedItem.endTime.slice(0, 2), 10) - parseInt(movedItem.startTime.slice(0, 2), 10);
        const newEndHour = newStartHour + itemDuration;

        const newStartTime = `${newStartHour.toString().padStart(2, '0')}0000`;
        const newEndTime = `${newEndHour.toString().padStart(2, '0')}0059`;

        // 새 날짜에 아이템 추가
        const newItem = {
            ...movedItem,
            startTime: newStartTime,
            endTime: newEndTime,
        };
        const updatedDestDayItems = Array.from(destDay.item);
        updatedDestDayItems.splice(destIndex, 0, newItem);

        // 스케줄 업데이트
        const newSchedules = schedules.map((schedule, idx) => {
            if (idx === sourceDayIndex) {
                return {
                    ...schedule,
                    item: updatedSourceDayItems,
                };
            } else if (idx === destDayIndex) {
                return {
                    ...schedule,
                    item: updatedDestDayItems,
                };
            } else {
                return schedule;
            }
        });

        setSchedules(newSchedules);
        localStorage.setItem('schedules', JSON.stringify(newSchedules));
    };

    const calculateItemHeight = (startTime: string, endTime: string) => {
        const startHour = parseInt(startTime.slice(0, 2), 10);
        const endHour = parseInt(endTime.slice(0, 2), 10);

        // 시(hour)만을 기준으로 높이를 계산 (1시간 = 60px)
        const duration = endHour - startHour;
        return `${duration * 58}px`;
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

        // 기존 날짜와 시간으로 Date 객체 생성
        const date = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`);

        // 현재 시간에 9시간 더하기
        date.setHours(date.getHours() + 9);

        // 년, 월, 일, 시, 분 추출
        const updatedYear = date.getFullYear();
        const updatedMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const updatedDay = date.getDate().toString().padStart(2, '0');
        const updatedHours = date.getHours().toString().padStart(2, '0');
        const updatedMinutes = date.getMinutes().toString().padStart(2, '0');

        // ISO 8601 포맷으로 변환
        const dateTimeString = `${updatedYear}-${updatedMonth}-${updatedDay}T${updatedHours}:${updatedMinutes}:00`;

        // 로컬 스토리지에 저장
        localStorage.setItem(key, dateTimeString);
    }

    const handleClickItem = (date: string, item: ScheduleItem) => {
        const daysLength = schedules.length - 1;
        const firstDate = schedules[0];
        const lastDate = schedules[daysLength];
        saveDateToLocalStorage(firstDate.date, firstDate.item[0].startTime, 'minDate');
        saveDateToLocalStorage(lastDate.date, lastDate.item[lastDate.item.length - 1].startTime, 'maxDate');
        saveDateToLocalStorage(date, item.startTime, 'scheduleDetailStartTime');
        saveDateToLocalStorage(date, item.endTime, 'scheduleDetailEndTime');

        localStorage.setItem('scheduleDetail', JSON.stringify(item));
        router.push(`/scheduleDetail?${item.title}`);
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
                                                const height = calculateItemHeight(item.startTime, item.endTime);
                                                return (
                                                    <Draggable
                                                        key={`${dayIndex}-${item.title}-${item.startTime}`}
                                                        draggableId={`${dayIndex}-${item.title}-${item.startTime}`}
                                                        index={itemIdx}
                                                    >
                                                        {(provided, snapshot) => (
                                                            <div
                                                                className={`${styles.scheduleItem} ${
                                                                    snapshot.isDragging ? styles.draggingItem : ''
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
                                                                    marginBottom: snapshot.isDragging ? '60px' : '20px', // 드래그 중일 때 공간 확보
                                                                    height: height,
                                                                    transition: snapshot.isDragging
                                                                        ? 'none'
                                                                        : 'top 0.3s ease', // 드래그 중일 때 자연스러운 애니메이션 추가
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
                <Button
                    type='ok'
                    onClick={() => {
                        localStorage.setItem('schedules', JSON.stringify(schedules));
                    }}
                >
                    저장
                </Button>
            </div>
        </div>
    );
};

export default SchedulePage;

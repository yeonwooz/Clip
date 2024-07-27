'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { scheduleAtom, scheduleLoadingAtom, scheduleErrorAtom } from '../store/scheduleAtom';
import { useFetchSchedule } from '../store/scheduleActions';
import styles from './schedule.module.css';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import Button from '@/components/Buttons';
import LoadingSchedule from './loading';
import { dummy } from './dummy';

const SchedulePage: React.FC = () => {
    const [data, setData] = useAtom(scheduleAtom);
    const [loading] = useAtom(scheduleLoadingAtom);
    const [error] = useAtom(scheduleErrorAtom);
    const fetchSchedule = useFetchSchedule();

    const [dataWithDummyItems, setDataWithDummyItems] = useState([]);

    useEffect(() => {
        fetchSchedule({
            region: '부산',
            startDate: '2024080110', // YYYYMMDDHH
            endDate: '2024080310',
            min: 4, // 하루 최소 일정 갯수
        });
        // setData(dummy);
    }, []);

    useEffect(() => {
        const addDummyItems = (daySchedule) => {
            const timeSlots = getTimeSlots();
            const existingTimes = daySchedule.item.map((item) => item.startTime.slice(0, 2) + ':00');
            const dummyItems = timeSlots
                .filter((timeSlot) => !existingTimes.includes(timeSlot))
                .map((timeSlot, index) => ({
                    title: `빈 시간 ${index}`,
                    startTime: timeSlot.replace(':', '') + '00',
                    endTime: timeSlot.replace(':', '') + '59',
                    address: '',
                    isDummy: true, // 더미 아이템임을 표시
                }));
            return { ...daySchedule, items: [...daySchedule.item, ...dummyItems] };
        };

        setDataWithDummyItems(data?.map((daySchedule) => addDummyItems(daySchedule)));
    }, [data]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination } = result;

        const sourceDayIndex = parseInt(source.droppableId);
        const destDayIndex = parseInt(destination.droppableId);

        const sourceIndex = source.index;
        const destIndex = destination.index;

        const sourceDay = { ...dataWithDummyItems[sourceDayIndex] };
        const destDay = { ...dataWithDummyItems[destDayIndex] };

        const [movedItem] = sourceDay.items.splice(sourceIndex, 1);

        const newStartTime = calculateNewStartTime(destIndex);
        movedItem.startTime = newStartTime;

        destDay.items.splice(destIndex, 0, movedItem);

        const newData = [...dataWithDummyItems];
        newData[sourceDayIndex] = sourceDay;
        newData[destDayIndex] = destDay;

        setDataWithDummyItems(newData);
    };

    const calculateNewStartTime = (index: number) => {
        const hours = String(Math.floor(index)).padStart(2, '0');
        return `${hours}0000`;
    };

    const formatTime = (time: string) => {
        return time.slice(0, 2) + ':' + time.slice(2);
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
        return `${month}.${day}. ${dayOfWeek}요일`;
    };

    const getTimeSlots = () => {
        const timeSlots = [];
        for (let i = 0; i < 24; i++) {
            timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return timeSlots;
    };

    if (loading) {
        return <LoadingSchedule />;
    }
    if (error) {
        return <p>에러 발생: {error?.message}</p>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.contents}>
                <h1>부산여행</h1>
                {!loading && !error && (
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
                                {dataWithDummyItems.map((daySchedule, dayIndex) => (
                                    <Droppable droppableId={`${dayIndex}`} key={dayIndex} type='ITEM'>
                                        {(provided, snapshot) => (
                                            <div
                                                className={styles.scheduleDay}
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                            >
                                                <div className={styles.dateTextContainer}>
                                                    <div className={styles.dateText}>
                                                        {formatDate(daySchedule.date)}
                                                    </div>
                                                </div>
                                                {daySchedule.item.map((item, itemIdx) => {
                                                    const topPosition =
                                                        parseInt(item.startTime.slice(0, 2)) * 60 + 'px';
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
                                                                    style={{
                                                                        ...provided.draggableProps.style,
                                                                        top: topPosition,
                                                                        left: '0px',
                                                                        position: 'absolute',
                                                                        zIndex: snapshot.isDragging ? 1000 : 'auto',
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
                )}
            </div>
            <div className={styles.buttonGroup}>
                <Button type='cancel' onClick={() => console.log('취소 버튼 클릭됨')}>
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

'use client';

import { useAtom } from 'jotai';
import { scheduleAtom, scheduleLoadingAtom, scheduleErrorAtom } from '../store/scheduleAtom';
import { useFetchSchedule } from '../store/scheduleActions';
import styles from './schedule.module.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Button from '@/components/Buttons';

const SchedulePage: React.FC = () => {
    const [data, setData] = useAtom(scheduleAtom);
    const [loading] = useAtom(scheduleLoadingAtom);
    const [error] = useAtom(scheduleErrorAtom);
    const fetchSchedule = useFetchSchedule();

    // useEffect(() => {
    //     // fetchSchedule();
    // }, []);

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const { source, destination } = result;

        const sourceDayIndex = parseInt(source.droppableId.split('-')[0]);
        const destDayIndex = parseInt(destination.droppableId.split('-')[0]);

        const sourceIndex = source.index;
        const destIndex = destination.index;

        const sourceDay = data[sourceDayIndex];
        const destDay = data[destDayIndex];

        const [movedItem] = sourceDay.items.splice(sourceIndex, 1);
        destDay.items.splice(destIndex, 0, movedItem);

        const newData = Array.from(data);
        newData[sourceDayIndex] = sourceDay;
        newData[destDayIndex] = destDay;

        setData(newData);
    };

    const formatTime = (time: string) => {
        return time.slice(0, 2) + ':' + time.slice(2);
    };

    // 요일 배열
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

    // 날짜 형식을 변경하는 함수
    const formatDate = (dateString) => {
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        const date = new Date(`${year}-${month}-${day}`);
        const dayOfWeek = daysOfWeek[date.getDay()];
        return `${month}.${day}. ${dayOfWeek}요일`;
    };

    // if (loading) {
    //     return <p>로딩 중...</p>;
    // }
    // if (error) {
    //     return <p>에러 발생: {error?.message}</p>;
    // }

    const getTimeSlots = () => {
        const timeSlots = [];
        for (let i = 0; i < 24; i++) {
            timeSlots.push(`${i.toString().padStart(2, '0')}:00`);
        }
        return timeSlots;
    };

    const addDummyItems = (daySchedule) => {
        const timeSlots = getTimeSlots();
        const existingTimes = daySchedule.items.map((item) => item.startTime.slice(0, 2) + ':00');
        const dummyItems = timeSlots
            .filter((timeSlot) => !existingTimes.includes(timeSlot))
            .map((timeSlot, index) => ({
                title: `빈 시간 ${index}`,
                startTime: timeSlot.replace(':', '') + '00',
                endTime: timeSlot.replace(':', '') + '59',
                address: '',
                isDummy: true, // 더미 아이템임을 표시
            }));
        return { ...daySchedule, items: [...daySchedule.items, ...dummyItems] };
    };

    const dataWithDummyItems = data.map((daySchedule) => addDummyItems(daySchedule));

    return (
        <div className={styles.container}>
            <div className={styles.contents}>
                <h1>부산여행</h1>
                {loading && <p>로딩 중...</p>}
                {error && <p>에러 발생: {error?.message}</p>}
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
                                        {(provided) => (
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
                                                {daySchedule.items.map((item, itemIdx) => (
                                                    <Draggable
                                                        key={`${dayIndex}-${item.title}-${item.startTime}`}
                                                        draggableId={`${dayIndex}-${item.title}-${item.startTime}`}
                                                        index={itemIdx}
                                                    >
                                                        {(provided) => (
                                                            <div
                                                                className={`${styles.scheduleItem} ${
                                                                    item.isDummy ? styles.hiddenItem : ''
                                                                }`}
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                            >
                                                                {!item.isDummy && (
                                                                    <>
                                                                        <p>
                                                                            <strong>{item.title}</strong>
                                                                        </p>
                                                                        <p>
                                                                            시간: {formatTime(item.startTime)} -{' '}
                                                                            {formatTime(item.endTime)}
                                                                        </p>
                                                                        {item.address && <p>주소: {item.address}</p>}
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
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

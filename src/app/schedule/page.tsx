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

        // 같은 리스트 안에서의 이동
        if (source.droppableId === destination.droppableId) {
            const items = Array.from(data);
            const [movedItem] = items[source.index].items.splice(source.index, 1);
            items[destination.index].items.splice(destination.index, 0, movedItem);
            setData(items);
        } else {
            // 다른 리스트로의 이동
            const sourceItems = Array.from(data[source.droppableId].items);
            const destinationItems = Array.from(data[destination.droppableId].items);
            const [movedItem] = sourceItems.splice(source.index, 1);
            destinationItems.splice(destination.index, 0, movedItem);
            const newData = Array.from(data);
            newData[source.droppableId].items = sourceItems;
            newData[destination.droppableId].items = destinationItems;
            setData(newData);
        }
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

    const calculatePosition = (startTime, endTime) => {
        const start = parseInt(startTime.slice(0, 2)) + parseInt(startTime.slice(2)) / 60;
        const end = parseInt(endTime.slice(0, 2)) + parseInt(endTime.slice(2)) / 60;
        return {
            top: `${start * 60}px`,
            height: `${(end - start) * 60}px`,
        };
    };

    return (
        <div className={styles.container}>
            <div className={styles.contents}>
                <h1>부산여행</h1>
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
                            {data.map((daySchedule, index) => (
                                <Droppable droppableId={`${index}`} key={index} direction='horizontal'>
                                    {(provided) => (
                                        <div
                                            className={styles.scheduleDay}
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                        >
                                            <div className={styles.dateTextContainer}>
                                                <div className={styles.dateText}>{formatDate(daySchedule.date)}</div>
                                            </div>
                                            {getTimeSlots().map((timeSlot, timeIdx) => (
                                                <div className={styles.timeSlotContainer} key={timeIdx}>
                                                    <div className={styles.itemsContainer}>
                                                        {daySchedule.items
                                                            .filter((item) =>
                                                                item.startTime.startsWith(timeSlot.slice(0, 2)),
                                                            )
                                                            .map((item, itemIdx) => (
                                                                <Draggable
                                                                    key={item.title}
                                                                    draggableId={item.title}
                                                                    index={itemIdx}
                                                                >
                                                                    {(provided) => (
                                                                        <div
                                                                            className={styles.scheduleItem}
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            style={{
                                                                                ...provided.draggableProps.style,
                                                                            }}
                                                                        >
                                                                            <p>
                                                                                <strong>{item.title}</strong>
                                                                            </p>
                                                                            <p>
                                                                                시간: {formatTime(item.startTime)} -{' '}
                                                                                {formatTime(item.endTime)}
                                                                            </p>
                                                                            <p>주소: {item.address}</p>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
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

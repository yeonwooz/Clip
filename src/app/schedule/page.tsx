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

    // if (loading) {
    //     return <p>로딩 중...</p>;
    // }
    // if (error) {
    //     return <p>에러 발생: {error?.message}</p>;
    // }

    return (
        <div className={styles.container}>
            <h1>부산여행</h1>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className={styles.scheduleGrid}>
                    {data.map((daySchedule, index) => (
                        <Droppable droppableId={`${index}`} key={index}>
                            {(provided) => (
                                <div
                                    className={styles.scheduleDay}
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                >
                                    <h2>{daySchedule.date}</h2>
                                    {daySchedule.items.map((item, idx) => (
                                        <Draggable key={item.title} draggableId={item.title} index={idx}>
                                            {(provided) => (
                                                <div
                                                    className={styles.scheduleItem}
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <p>
                                                        <strong>{item.title}</strong>
                                                    </p>
                                                    <p>
                                                        시간: {formatTime(item.startTime)} - {formatTime(item.endTime)}
                                                    </p>
                                                    {/* <p>{item.description}</p> */}
                                                    {/*  상세페이지에서 보여줄 예정 */}
                                                    <p>주소: {item.address}</p>
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
            <div className={styles.buttonGroup}>
                <Button type='cancel' onClick={() => console.log('취소 버튼 클릭됨')}>
                    취소
                </Button>
                <span className={styles.buttonGap} />
                <Button type='ok' onClick={() => console.log('저장 버튼 클릭됨')}>
                    저장
                </Button>
                {/* // TODO:저장 누르면 로컬스토리지에 저장 */}
            </div>
        </div>
    );
};

export default SchedulePage;

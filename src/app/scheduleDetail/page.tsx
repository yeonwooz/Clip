'use client';

import { Input } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import styles from './scheduleDetail.module.css';
import Button from '~/components/Buttons';
import _ from 'lodash';
import { useAtom } from 'jotai';
import { LeftIcon, leftIconAtom, pageTitleAtom, rightIconAtom } from '~/store/headerAtoms';

const ScheduleDetailPage: React.FC = () => {
    const router = useRouter();
    const [pageTitle, setPageTitle] = useAtom(pageTitleAtom);
    const [leftIcon, setLeftIcon] = useAtom(leftIconAtom);
    const [rightIcon, setRightIcon] = useAtom(rightIconAtom);

    const [scheduleDetail, setScheduleDetail] = useState({
        title: '',
        startTime: '',
        endTime: '',
        description: '',
        address: '',
    });

    const [dateInfo, setDateInfo] = useState({
        minDate: '',
        maxDate: '',
        startTime: '',
        endTime: '',
    });

    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    useEffect(() => {
        setLeftIcon(LeftIcon.back);
        setRightIcon(null);

        const detailInfoInLocalStorage = localStorage.getItem('scheduleDetail');
        if (detailInfoInLocalStorage) {
            const info = JSON.parse(detailInfoInLocalStorage);
            setScheduleDetail(info);
            setPageTitle(info.title);
        }

        const minDateInLocalStorage = localStorage.getItem('minDate');
        const maxDateInLocalStorage = localStorage.getItem('maxDate');
        const scheduleDetailStartTimeInLocalStorage = localStorage.getItem('scheduleDetailStartTime');
        const scheduleDetailEndTimeInLocalStorage = localStorage.getItem('scheduleDetailEndTime');

        if (
            minDateInLocalStorage &&
            maxDateInLocalStorage &&
            scheduleDetailStartTimeInLocalStorage &&
            scheduleDetailEndTimeInLocalStorage
        ) {
            const minDate = new Date(minDateInLocalStorage).toISOString().split('T')[0];
            const maxDate = new Date(maxDateInLocalStorage).toISOString().split('T')[0];
            const startTime = new Date(scheduleDetailStartTimeInLocalStorage).toISOString().slice(0, 16);
            const endTime = new Date(scheduleDetailEndTimeInLocalStorage).toISOString().slice(0, 16);

            setDateInfo({
                minDate,
                maxDate,
                startTime,
                endTime,
            });
            setStart(startTime);
            setEnd(endTime);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function handleStartDate(event: React.ChangeEvent<HTMLInputElement>) {
        const startDateTime = event.target.value;
        setStart(startDateTime);
        setScheduleDetail((prevDetail) => ({
            ...prevDetail,
            startTime: startDateTime,
        }));
    }

    function handleEndDate(event: React.ChangeEvent<HTMLInputElement>) {
        const endDateTime = event.target.value;
        setEnd(endDateTime);
        setScheduleDetail((prevDetail) => ({
            ...prevDetail,
            endTime: endDateTime,
        }));
    }

    function deleteItem() {
        const schedulesInLocalStorage = localStorage.getItem('schedules');
        if (!schedulesInLocalStorage) {
            return;
        }

        const currentSchedules = JSON.parse(schedulesInLocalStorage);

        // scheduleAtom에서 삭제
        const newSchedules = _.map(currentSchedules, (day) => {
            return {
                ...day,
                item: _.filter(day.item, (item) => item.title !== scheduleDetail.title),
            };
        });

        localStorage.setItem('schedules', JSON.stringify(newSchedules));

        // scheduleDetailAtom 초기화
        setScheduleDetail({
            title: '',
            startTime: '',
            endTime: '',
            description: '',
            address: '',
        });
        router.push('/schedule');
    }

    function getFormattedTime(dateTime: string): string {
        const date = new Date(dateTime);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return hours + minutes;
    }

    function save() {
        deleteItem();
        const schedulesInLocalStorage = localStorage.getItem('schedules');
        if (!schedulesInLocalStorage) {
            return;
        }

        const currentSchedules = JSON.parse(schedulesInLocalStorage);
        const startDate = start.split('T')[0].split('-').join('');

        const formattedStartTime = getFormattedTime(start);
        const formattedEndTime = getFormattedTime(end);

        const updatedSchedules = _.map(currentSchedules, (day: any) => {
            if (day.date === startDate) {
                // 기존 항목을 삭제하고 업데이트된 항목을 추가
                const updatedItems = day.item.filter((item: any) => item.title !== scheduleDetail.title);
                updatedItems.push({ ...scheduleDetail, startTime: formattedStartTime, endTime: formattedEndTime });
                return {
                    ...day,
                    item: updatedItems,
                };
            }
            return day;
        });

        localStorage.setItem('schedules', JSON.stringify(updatedSchedules));

        router.push('/schedule');
    }

    return (
        <div className={styles.container}>
            <div className={styles.form}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>일정 이름</label>
                    <Input
                        className={styles.scheduleTitle}
                        placeholder='일정 이름'
                        value={scheduleDetail.title}
                        height={14}
                        readOnly
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>일정 시작/종료</label>
                    <Input
                        className={styles.startTimeInput}
                        placeholder='일정 시작'
                        height={14}
                        type='datetime-local'
                        value={start}
                        onChange={handleStartDate}
                        min={dateInfo.minDate}
                        max={dateInfo.maxDate}
                    />
                    <Input
                        placeholder='일정 종료'
                        height={14}
                        type='datetime-local'
                        value={end}
                        onChange={handleEndDate}
                        min={dateInfo.minDate}
                        max={dateInfo.maxDate}
                    />
                </div>
                <div className={styles.descriptionTitle}>
                    <span>여행지 정보</span>
                    <span className={styles.annotation}>네이버 API 활용</span>
                </div>
                <div>
                    <div className={styles.descriptionContent}>
                        <div className={styles.descriptionLabel}>주소 </div>
                        <div className={styles.descriptionValue}>{scheduleDetail.address}</div>
                    </div>

                    <div className={styles.descriptionContent}>
                        <div className={styles.descriptionLabel}>설명 </div>
                        <div
                            className={styles.descriptionValue}
                            dangerouslySetInnerHTML={{ __html: scheduleDetail.description }}
                        ></div>
                    </div>
                </div>
                <div className={styles.buttonGroup}>
                    <Button type='cancel' onClick={deleteItem}>
                        삭제
                    </Button>
                    <span className={styles.buttonGap} />
                    <Button type='ok' onClick={save}>
                        저장
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDetailPage;

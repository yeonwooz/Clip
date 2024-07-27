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
        date: '',
    });

    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');

    function getEndDateFromStartDate(startDateTime: string): string {
        const startDate = new Date(startDateTime);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 60분 더하기

        const offset = startDate.getTimezoneOffset() * 60000; // 타임존 오프셋 계산
        const correctedEndDate = new Date(endDate.getTime() - offset); // 타임존 보정

        return correctedEndDate.toISOString().slice(0, 16);
    }

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
        const scheduleDateInLocalStorage = localStorage.getItem('scheduleDate');

        if (minDateInLocalStorage && maxDateInLocalStorage && scheduleDateInLocalStorage) {
            const minDate = minDateInLocalStorage;
            const maxDate = maxDateInLocalStorage;
            const date = scheduleDateInLocalStorage;
            setDateInfo({
                minDate,
                maxDate,
                date,
            });
            setStart(date);
            const formattedEndDate = getEndDateFromStartDate(date);
            setEnd(formattedEndDate);
        }
    }, []);

    // @ts-ignore
    function handleStartDate(event) {
        const startDateTime = event.target.value;
        setStart(startDateTime);
        const formattedEndDate = getEndDateFromStartDate(startDateTime);
        setEnd(formattedEndDate);
        setScheduleDetail((prevDetail) => ({
            ...prevDetail,
            startTime: startDateTime,
            endTime: formattedEndDate,
        }));
        console.log(startDateTime);
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
        console.log(startDate);

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
                    <Input placeholder='일정 종료' height={14} type='datetime-local' readOnly value={end} />
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
                    <Button
                        type='cancel'
                        onClick={() => {
                            deleteItem();
                        }}
                    >
                        삭제
                    </Button>
                    <span className={styles.buttonGap} />
                    <Button
                        type='ok'
                        onClick={() => {
                            save();
                        }}
                    >
                        저장
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleDetailPage;

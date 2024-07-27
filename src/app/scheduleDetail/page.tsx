'use client';

import { Input } from '@chakra-ui/react';
import { atom, useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import styles from './scheduleDetail.module.css';
import Button from '~/components/Buttons';
import _ from 'lodash';

const ScheduleDetailPage: React.FC = () => {
    const router = useRouter();
    const [scheduleDetail, setScheduleDetail] = useState({
        title: '',
        startTime: '',
        endTime: '',
        description: '',
        address: '',
    });

    useEffect(() => {
        const detailInfoInLocalStorage = localStorage.getItem('scheduleDetail');
        if (detailInfoInLocalStorage) {
            setScheduleDetail(JSON.parse(detailInfoInLocalStorage));
        }
    }, []);

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

    function save() {
        const schedulesInLocalStorage = localStorage.getItem('schedules');
        if (!schedulesInLocalStorage) {
            return;
        }

        const currentSchedules = JSON.parse(schedulesInLocalStorage);
        const updatedSchedules = _.map(currentSchedules, (day: any) => {
            return {
                ...day,
                item: _.map(day.item, (item: any) => (item.title === scheduleDetail.title ? scheduleDetail : item)),
            };
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
                    <Input placeholder='일정 시작' height={14} />
                    <Input placeholder='일정 종료' height={14} />
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

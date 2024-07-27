// src/app/api.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';

const apiClient = axios.create({
    baseURL: 'http://118.67.130.17:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosRetry(apiClient, {
    retries: 3, // 최대 재시도 횟수
    retryDelay: (retryCount) => {
        console.log(`재시도 횟수: ${retryCount}`);
        return retryCount * 1000; // 재시도 간격 (밀리초)
    },
    // retryCondition: (error) => {
    //     // 재시도 조건 (기본값: idempotent한 요청에 대해서만 재시도)
    //     return error.response.status === 503; // 예: 503 에러일 경우 재시도
    // },
});

export const fetchData = async (endpoint: string) => {
    try {
        const response = await apiClient.get(endpoint);
        return response.data;
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
};

export const postData = async (endpoint: string, data: any) => {
    try {
        const response = await apiClient.post(endpoint, data);
        return response.data.data;
    } catch (error) {
        console.error('API 호출 에러:', error);
        throw error;
    }
};

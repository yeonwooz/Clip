import { atom } from 'jotai';

interface ScheduleItem {
    title: string;
    startTime: string;
    endTime: string;
    description: string;
    address: string;
}

interface Schedule {
    date: string;
    items: ScheduleItem[];
}

export const scheduleAtom = atom<Schedule[]>([
    {
        date: '20240801',
        items: [
            {
                title: '해운대 해수욕장',
                startTime: '1000',
                endTime: '1400',
                description:
                    '안녕하세요~ 얼마 전 새로 오픈한 곳을 다녀왔는데요~ 와 ㅠ 부산 해운대 해수욕장 숙소 오션뷰 펜트하우스 추천 뉴시즈 해운대 레지던스 정말 좋았어요 ㅠ 장마기간에 가서 중간 중간 비가 와서 아쉬웠지만...',
                address: '',
            },
            {
                title: '광안리 해수욕장',
                startTime: '1500',
                endTime: '1900',
                description:
                    '부산 광안리 호텔 광안리해수욕장 광안리 오션뷰 숙소 아쿠아펠리스 안녕하세요. 해피한 여행 에디터 해피팅이에요. 지난주 평일 3박 4일 동안 짝꿍과 함께 부산 여행을 다녀왔는데요, 장마철이라 생각보다...',
                address: '부산광역시 수영구 광안해변로 219',
            },
            {
                title: '민락회타운',
                startTime: '1800',
                endTime: '2000',
                description:
                    '□ 광안리 전망대 오륙도횟집 ○ 주소:부산 수영구 민락수변로1 민락회타운 9층 ○ 영업시간 : 11시30분 ~ 24시 ○ ☎️ : 051-751-1133 ○ 주차가능 1층에서 횟감을 직접사서 올라갈 수도 있지만 미리 친구가...',
                address: '부산광역시 수영구 민락수변로 1 민락타운',
            },
        ],
    },
    {
        date: '20240802',
        items: [
            {
                title: '동백섬',
                startTime: '1000',
                endTime: '1300',
                description:
                    '지나가는길에 동백섬 공영주차장 나오길래 저기도 한번 돌아보자고 왔습니다ㅋㅋ 섬이라고 되어있지만 육지랑 아예 연결되어서 지금은 섬이 아니에요~ 동백공원 공영주차장에 주차~ 여기 주차료 비쌌던걸로...',
                address: '',
            },
        ],
    },
    {
        date: '20240803',
        items: [
            {
                title: '자갈치 시장',
                startTime: '1400',
                endTime: '1500',
                description: '부산의 유명한 자갈치 시장입니다. 신선한 해산물을 맛볼 수 있습니다.',
                address: '부산광역시 중구 자갈치해안로 52',
            },
            {
                title: '감천문화마을',
                startTime: '1500',
                endTime: '1600',
                description: '부산의 예술과 문화가 어우러진 아름다운 마을입니다.',
                address: '부산광역시 사하구 감내2로 203',
            },
            {
                title: '부산 타워',
                startTime: '1600',
                endTime: '1700',
                description: '부산의 전경을 한눈에 볼 수 있는 부산 타워입니다.',
                address: '부산광역시 중구 용두산길 37-30',
            },
        ],
    },
]);

export const scheduleLoadingAtom = atom<boolean>(false);
export const scheduleErrorAtom = atom<Error | null>(null);

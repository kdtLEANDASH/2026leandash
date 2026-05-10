import { createContext, useContext, useState, useEffect } from "react";
export const AppContext = createContext(undefined);
const initialEmployees = [
    {
        id: 0,
        name: "관리자",
        department: "경영진",
        position: "대표이사",
        email: "admin@company.com",
        phone: "010-0000-0000",
        status: "업무 중",
        mbti: "ENTJ",
        hireDate: "2015-01-01",
        role: "최고관리자",
    },
    {
        id: 1,
        name: "홍길동",
        department: "개발팀",
        position: "개발 팀장",
        email: "hong@company.com",
        phone: "010-1234-5678",
        status: "업무 중",
        mbti: "INTJ",
        hireDate: "2020-03-15",
        role: "팀장",
    },
    {
        id: 2,
        name: "김민수",
        department: "개발팀",
        position: "시니어 개발자",
        email: "kim@company.com",
        phone: "010-2345-6789",
        status: "업무 중",
        mbti: "ENFP",
        hireDate: "2022-01-10",
        role: "일반직원",
    },
    {
        id: 3,
        name: "박지훈",
        department: "개발팀",
        position: "주니어 개발자",
        email: "park.j@company.com",
        phone: "010-2222-3333",
        status: "업무 중",
        mbti: "INTP",
        hireDate: "2024-03-01",
        role: "일반직원",
    },
    {
        id: 4,
        name: "최유진",
        department: "개발팀",
        position: "프론트엔드 개발자",
        email: "choi@company.com",
        phone: "010-3333-4444",
        status: "집중 모드",
        mbti: "ISFP",
        hireDate: "2023-06-15",
        role: "일반직원",
    },
    {
        id: 5,
        name: "강서현",
        department: "개발팀",
        position: "백엔드 개발자",
        email: "kang@company.com",
        phone: "010-4444-5555",
        status: "업무 중",
        mbti: "ISTP",
        hireDate: "2023-08-20",
        role: "일반직원",
    },
    {
        id: 6,
        name: "이지은",
        department: "마케팅팀",
        position: "마케팅 팀장",
        email: "lee@company.com",
        phone: "010-3456-7890",
        status: "자리 비움",
        mbti: "ESFJ",
        hireDate: "2019-06-01",
        role: "팀장",
    },
    {
        id: 7,
        name: "윤서아",
        department: "마케팅팀",
        position: "마케팅 매니저",
        email: "yoon@company.com",
        phone: "010-5555-6666",
        status: "업무 중",
        mbti: "ENFJ",
        hireDate: "2021-04-10",
        role: "일반직원",
    },
    {
        id: 8,
        name: "정민호",
        department: "마케팅팀",
        position: "콘텐츠 기획자",
        email: "jung.m@company.com",
        phone: "010-6666-7777",
        status: "업무 중",
        mbti: "INFP",
        hireDate: "2022-11-05",
        role: "일반직원",
    },
    {
        id: 9,
        name: "한소율",
        department: "마케팅팀",
        position: "디지털 마케터",
        email: "han@company.com",
        phone: "010-7777-8888",
        status: "자리 비움",
        mbti: "ESFP",
        hireDate: "2023-02-14",
        role: "일반직원",
    },
    {
        id: 10,
        name: "박철수",
        department: "인사팀",
        position: "인사 팀장",
        email: "park@company.com",
        phone: "010-4567-8901",
        status: "업무 중",
        mbti: "ISTJ",
        hireDate: "2018-03-20",
        role: "팀장",
    },
    {
        id: 11,
        name: "임채원",
        department: "인사팀",
        position: "인사 담당",
        email: "lim@company.com",
        phone: "010-8888-9999",
        status: "업무 중",
        mbti: "ISFJ",
        hireDate: "2021-07-01",
        role: "일반직원",
    },
    {
        id: 12,
        name: "오지훈",
        department: "인사팀",
        position: "채용 담당",
        email: "oh@company.com",
        phone: "010-9999-0000",
        status: "업무 중",
        mbti: "ESTJ",
        hireDate: "2022-09-12",
        role: "일반직원",
    },
    {
        id: 13,
        name: "정수진",
        department: "경영지원팀",
        position: "경영지원 팀장",
        email: "jung@company.com",
        phone: "010-5678-9012",
        status: "업무 중",
        mbti: "INFP",
        hireDate: "2021-09-01",
        role: "팀장",
    },
    {
        id: 14,
        name: "신동욱",
        department: "경영지원팀",
        position: "총무 담당",
        email: "shin@company.com",
        phone: "010-1111-2222",
        status: "업무 중",
        mbti: "ESTP",
        hireDate: "2022-05-20",
        role: "일반직원",
    },
    {
        id: 15,
        name: "송하은",
        department: "경영지원팀",
        position: "재무 담당",
        email: "song@company.com",
        phone: "010-2222-1111",
        status: "집중 모드",
        mbti: "INTJ",
        hireDate: "2020-11-30",
        role: "일반직원",
    },
    {
        id: 16,
        name: "배준서",
        department: "디자인팀",
        position: "디자인 팀장",
        email: "bae@company.com",
        phone: "010-3333-2222",
        status: "업무 중",
        mbti: "INFJ",
        hireDate: "2019-01-15",
        role: "팀장",
    },
    {
        id: 17,
        name: "나예린",
        department: "디자인팀",
        position: "UI/UX 디자이너",
        email: "na@company.com",
        phone: "010-4444-3333",
        status: "업무 중",
        mbti: "ISFP",
        hireDate: "2021-08-10",
        role: "일반직원",
    },
    {
        id: 18,
        name: "류민재",
        department: "디자인팀",
        position: "그래픽 디자이너",
        email: "ryu@company.com",
        phone: "010-5555-4444",
        status: "휴가 중",
        mbti: "ENFP",
        hireDate: "2022-03-25",
        role: "일반직원",
    },
    {
        id: 19,
        name: "서윤아",
        department: "디자인팀",
        position: "브랜드 디자이너",
        email: "seo@company.com",
        phone: "010-6666-5555",
        status: "업무 중",
        mbti: "ESFP",
        hireDate: "2023-01-18",
        role: "일반직원",
    },
    {
        id: 20,
        name: "장하늘",
        department: "영업팀",
        position: "영업 팀장",
        email: "jang@company.com",
        phone: "010-7777-6666",
        status: "자리 비움",
        mbti: "ENTJ",
        hireDate: "2018-07-01",
        role: "팀장",
    },
    {
        id: 21,
        name: "문지혜",
        department: "영업팀",
        position: "영업 매니저",
        email: "moon@company.com",
        phone: "010-8888-7777",
        status: "업무 중",
        mbti: "ENFJ",
        hireDate: "2020-05-12",
        role: "일반직원",
    },
    {
        id: 22,
        name: "곽태양",
        department: "영업팀",
        position: "영업 사원",
        email: "kwak@company.com",
        phone: "010-9999-8888",
        status: "자리 비움",
        mbti: "ESTP",
        hireDate: "2023-04-05",
        role: "일반직원",
    },
];
const initialNotices = [
    {
        id: 1,
        title: "2026년 2분기 전사 회의 안내",
        content: "다음 주 목요일 오후 2시에 전사 회의가 있습니다. 전 직원 참석 부탁드립니다.\n\n일시: 2026년 4월 10일 (목) 14:00\n장소: 본사 대회의실\n내용: 1분기 성과 발표 및 2분기 계획 공유",
        category: "전체",
        author: "인사팀",
        date: "2026-04-08",
        isPinned: true,
        views: 245,
        isNew: true,
    },
    {
        id: 2,
        title: "개발팀 신규 프로젝트 착수 공지",
        content: "모바일 앱 리뉴얼 프로젝트가 시작됩니다.\n\n프로젝트명: 모바일 앱 3.0 리뉴얼\n기간: 2026.04.15 ~ 2026.08.31\n참여 인원: 개발팀 전체\n\n상세 내용은 추후 공유하겠습니다.",
        category: "개발",
        author: "개발팀장",
        date: "2026-04-07",
        isPinned: true,
        views: 189,
        isNew: true,
    },
    {
        id: 3,
        title: "근무 시간 조정 안내",
        content: "하절기(5월~9월) 근무 시간이 조정됩니다.\n\n변경 전: 09:00 ~ 18:00\n변경 후: 08:30 ~ 17:30\n\n5월 1일부터 적용됩니다.",
        category: "인사",
        author: "인사팀",
        date: "2026-04-05",
        isPinned: false,
        views: 312,
        isNew: false,
    },
    {
        id: 4,
        title: "Q2 마케팅 캠페인 런칭 안내",
        content: "2분기 마케팅 캠페인이 시작됩니다.\n\n캠페인명: Spring Innovation 2026\n기간: 2026.04.20 ~ 2026.06.30\n목표: 신규 고객 확보 20% 증가",
        category: "마케팅",
        author: "마케팅팀",
        date: "2026-04-03",
        isPinned: false,
        views: 156,
        isNew: false,
    },
    {
        id: 5,
        title: "사내 복지 제도 개선 안내",
        content: "직원 복지 제도가 개선됩니다.\n\n1. 자기계발비 연 100만원 → 150만원 증액\n2. 건강검진 지원 범위 확대\n3. 동호회 활동비 지원 신설\n\n자세한 내용은 인사팀으로 문의 바랍니다.",
        category: "인사",
        author: "인사팀",
        date: "2026-04-01",
        isPinned: false,
        views: 421,
        isNew: false,
    },
    {
        id: 6,
        title: "경영 실적 보고 - 2026년 1분기",
        content: "1분기 경영 실적을 보고드립니다.\n\n매출: 목표 대비 108% 달성\n영업이익: 전년 동기 대비 15% 증가\n신규 고객: 45개사\n\n모든 임직원의 노고에 감사드립니다.",
        category: "경영",
        author: "경영지원팀",
        date: "2026-03-31",
        isPinned: false,
        views: 387,
        isNew: false,
    },
    {
        id: 7,
        title: "서버 정기 점검 안내",
        content: "서버 정기 점검이 예정되어 있습니다.\n\n일시: 2026년 4월 13일 (토) 02:00 ~ 06:00\n영향: 사내 시스템 일시 중단\n\n점검 시간에는 시스템 접속이 불가합니다.",
        category: "개발",
        author: "개발팀",
        date: "2026-03-28",
        isPinned: false,
        views: 234,
        isNew: false,
    },
];
const initialVacationRequests = [
    {
        id: 1,
        type: "연차",
        startDate: "2026-04-15",
        endDate: "2026-04-17",
        days: 3,
        reason: "개인 사유",
        status: "대기",
        requestDate: "2026-04-08",
        employeeId: 1,
        employeeName: "홍길동",
    },
    {
        id: 2,
        type: "반차",
        startDate: "2026-04-20",
        endDate: "2026-04-20",
        days: 0.5,
        reason: "병원 진료",
        status: "승인",
        requestDate: "2026-04-05",
        approver: "박철수",
        employeeId: 1,
        employeeName: "홍길동",
    },
    {
        id: 3,
        type: "연차",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
        days: 3,
        reason: "가족 여행",
        status: "대기",
        requestDate: "2026-04-07",
        employeeId: 1,
        employeeName: "홍길동",
    },
];
const initialCalendarEvents = [
    {
        id: 1,
        title: "전체 회의",
        date: "2026-04-10",
        startTime: "14:00",
        endTime: "16:00",
        type: "전사",
        description: "2분기 전사 회의",
    },
    {
        id: 2,
        title: "분기 평가",
        date: "2026-04-15",
        startTime: "09:00",
        endTime: "12:00",
        type: "전사",
        description: "1분기 성과 평가",
    },
    // 2026년 공휴일
    {
        id: 3,
        title: "신정",
        date: "2026-01-01",
        type: "공휴일",
    },
    {
        id: 4,
        title: "설날",
        date: "2026-02-16",
        type: "공휴일",
    },
    {
        id: 5,
        title: "설날 연휴",
        date: "2026-02-17",
        type: "공휴일",
    },
    {
        id: 6,
        title: "설날 연휴",
        date: "2026-02-18",
        type: "공휴일",
    },
    {
        id: 7,
        title: "삼일절",
        date: "2026-03-01",
        type: "공휴일",
    },
    {
        id: 8,
        title: "어린이날",
        date: "2026-05-05",
        type: "공휴일",
    },
    {
        id: 9,
        title: "노동절",
        date: "2026-05-01",
        type: "공휴일",
    },
    {
        id: 10,
        title: "부처님오신날",
        date: "2026-05-24",
        type: "공휴일",
    },
    {
        id: 11,
        title: "현충일",
        date: "2026-06-06",
        type: "공휴일",
    },
    {
        id: 12,
        title: "광복절",
        date: "2026-08-15",
        type: "공휴일",
    },
    {
        id: 13,
        title: "추석",
        date: "2026-09-24",
        type: "공휴일",
    },
    {
        id: 14,
        title: "추석 연휴",
        date: "2026-09-25",
        type: "공휴일",
    },
    {
        id: 15,
        title: "추석 연휴",
        date: "2026-09-26",
        type: "공휴일",
    },
    {
        id: 16,
        title: "개천절",
        date: "2026-10-03",
        type: "공휴일",
    },
    {
        id: 17,
        title: "한글날",
        date: "2026-10-09",
        type: "공휴일",
    },
    {
        id: 18,
        title: "크리스마스",
        date: "2026-12-25",
        type: "공휴일",
    },
];
export function AppProvider({ children }) {
    const [notices, setNotices] = useState(initialNotices.map((notice) => ({
        ...notice,
        author: typeof notice.author === "object" ? notice.author?.name || "관리자" : notice.author,
    })));
    const [vacationRequests, setVacationRequests] = useState(initialVacationRequests);
    const [employees, setEmployees] = useState(initialEmployees);
    const [notifications, setNotifications] = useState([]);
    const [calendarEvents, setCalendarEvents] = useState(initialCalendarEvents);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [registrationRequests, setRegistrationRequests] = useState([]);
    // Chat state
    const [chatRooms, setChatRooms] = useState([
        {
            id: 1,
            name: "김민수",
            lastMessage: "프로젝트 진행 상황 공유드립니다",
            timestamp: "5분 전",
            unread: 2,
            avatar: "김",
            online: true,
            isGroup: false,
        },
        {
            id: 2,
            name: "개발팀",
            lastMessage: "저는 괜찮습니다!",
            timestamp: "30분 전",
            unread: 0,
            avatar: "개",
            online: false,
            isGroup: true,
            participants: [1, 2, 3],
        },
        {
            id: 3,
            name: "이지은",
            lastMessage: "네, 확인했습니다!",
            timestamp: "1시간 전",
            unread: 0,
            avatar: "이",
            online: true,
            isGroup: false,
        },
    ]);
    const [chatMessages, setChatMessages] = useState({
        1: [
            {
                id: 1,
                sender: "김민수",
                senderId: 2,
                content: "안녕하세요! 프로젝트 관련해서 문의드릴 게 있습니다.",
                timestamp: "오전 10:30",
                isMe: false,
            },
            {
                id: 2,
                sender: "홍길동",
                senderId: 1,
                content: "네, 말씀하세요!",
                timestamp: "오전 10:32",
                isMe: true,
            },
            {
                id: 3,
                sender: "김민수",
                senderId: 2,
                content: "이번 주 금요일까지 완료 가능할까요?",
                timestamp: "오전 10:33",
                isMe: false,
            },
            {
                id: 4,
                sender: "홍길동",
                senderId: 1,
                content: "네, 가능합니다. 일정 맞춰서 진행하겠습니다.",
                timestamp: "오전 10:35",
                isMe: true,
            },
            {
                id: 5,
                sender: "김민수",
                senderId: 2,
                content: "프로젝트 진행 상황 공유드립니다",
                timestamp: "오전 11:20",
                isMe: false,
            },
        ],
        2: [
            {
                id: 1,
                sender: "이지은",
                senderId: 6,
                content: "다음 주 회의 일정 조율 부탁드립니다",
                timestamp: "오전 9:00",
                isMe: false,
            },
            {
                id: 2,
                sender: "홍길동",
                senderId: 1,
                content: "월요일 오후 2시 어떠세요?",
                timestamp: "오전 9:15",
                isMe: true,
            },
            {
                id: 3,
                sender: "김민수",
                senderId: 2,
                content: "저는 괜찮습니다!",
                timestamp: "오전 9:20",
                isMe: false,
            },
        ],
        3: [
            {
                id: 1,
                sender: "이지은",
                senderId: 6,
                content: "코드 리뷰 부탁드립니다",
                timestamp: "어제",
                isMe: false,
            },
            {
                id: 2,
                sender: "홍길동",
                senderId: 1,
                content: "네, 확인하겠습니다",
                timestamp: "어제",
                isMe: true,
            },
            {
                id: 3,
                sender: "이지은",
                senderId: 6,
                content: "네, 확인했습니다!",
                timestamp: "1시간 전",
                isMe: false,
            },
        ],
    });
    // employees가 변경될 때 currentUser도 동기화
    useEffect(() => {
        if (currentUser) {
            const updatedUser = employees.find(emp => emp.id === currentUser.id);
            if (updatedUser) {
                setCurrentUser(updatedUser);
            }
        }
    }, [employees]);
    const addNotice = (notice) => {
        const newNotice = {
            ...notice,
            id: Math.max(...notices.map(n => n.id), 0) + 1,
            views: 0,
            date: new Date().toISOString().split("T")[0],
            author: typeof notice.author === "object"
                ? notice.author?.name || "관리자"
                : notice.author || "관리자",
        };
        setNotices([newNotice, ...notices]);
    };
    const incrementNoticeViews = (id) => {
        setNotices(notices.map(notice => notice.id === id ? { ...notice, views: notice.views + 1 } : notice));
    };
    const addVacationRequest = (request) => {
        const newRequest = {
            ...request,
            id: Math.max(...vacationRequests.map(r => r.id), 0) + 1,
            requestDate: new Date().toISOString().split("T")[0],
            status: "대기",
            employeeId: currentUser ? currentUser.id : 0,
            employeeName: currentUser ? currentUser.name : "",
        };
        setVacationRequests([newRequest, ...vacationRequests]);
        // 알림 생성
        addNotification({
            type: "vacation",
            title: "휴가 신청 완료",
            message: `${request.type} 신청이 제출되었습니다. (${request.startDate} ~ ${request.endDate})`,
            relatedId: newRequest.id,
        });
    };
    const approveVacation = (id, approver) => {
        setVacationRequests(vacationRequests.map(req => {
            if (req.id === id) {
                // 휴가 승인 시 직원 상태를 "휴가 중"으로 변경
                const today = new Date().toISOString().split("T")[0];
                if (req.startDate <= today && req.endDate >= today) {
                    updateEmployeeStatus(req.employeeId, "휴가 중");
                }
                // 캘린더에 휴가 일정 추가
                addCalendarEvent({
                    title: `${req.employeeName} - ${req.type}`,
                    date: req.startDate,
                    type: "휴가",
                    description: req.reason,
                });
                // 알림 생성
                addNotification({
                    type: "vacation",
                    title: "휴가 승인",
                    message: `${req.type} 신청이 승인되었습니다. (${req.startDate} ~ ${req.endDate})`,
                    relatedId: id,
                });
                return { ...req, status: "승인", approver };
            }
            return req;
        }));
    };
    const rejectVacation = (id, approver) => {
        const request = vacationRequests.find(r => r.id === id);
        if (request) {
            addNotification({
                type: "vacation",
                title: "휴가 반려",
                message: `${request.type} 신청이 반려되었습니다. (${request.startDate} ~ ${request.endDate})`,
                relatedId: id,
            });
        }
        setVacationRequests(vacationRequests.map(req => req.id === id ? { ...req, status: "반려", approver } : req));
    };
    const cancelVacation = (id) => {
        setVacationRequests(vacationRequests.filter(req => req.id !== id));
    };
    const addEmployee = (employee) => {
        const newEmployee = {
            ...employee,
            id: Math.max(...employees.map(e => e.id), 0) + 1,
        };
        setEmployees([...employees, newEmployee]);
    };
    const updateEmployee = (id, updates) => {
        setEmployees(employees.map(emp => emp.id === id ? { ...emp, ...updates } : emp));
    };
    const deleteEmployee = (id) => {
        setEmployees(employees.filter(emp => emp.id !== id));
    };
    const updateEmployeeStatus = (id, status) => {
        setEmployees(employees.map(emp => emp.id === id ? { ...emp, status } : emp));
    };
    const addNotification = (notification) => {
        const newNotification = {
            ...notification,
            id: Math.max(...notifications.map(n => n.id), 0) + 1,
            date: new Date().toISOString(),
            read: false,
        };
        setNotifications([newNotification, ...notifications]);
    };
    const markNotificationRead = (id) => {
        setNotifications(notifications.map(notif => notif.id === id ? { ...notif, read: true } : notif));
    };
    const addCalendarEvent = (event) => {
        const newEvent = {
            ...event,
            id: Math.max(...calendarEvents.map(e => e.id), 0) + 1,
        };
        setCalendarEvents([...calendarEvents, newEvent]);
    };
    const updateCalendarEvent = (id, updates) => {
        setCalendarEvents(calendarEvents.map(event => event.id === id ? { ...event, ...updates } : event));
    };
    const deleteCalendarEvent = (id) => {
        setCalendarEvents(calendarEvents.filter(event => event.id !== id));
    };
    const getVacationBalance = (employeeId) => {
        const total = 15; // 기본 연차
        const approvedRequests = vacationRequests.filter(req => req.employeeId === employeeId && req.status === "승인");
        const used = approvedRequests.reduce((sum, req) => sum + req.days, 0);
        const remaining = total - used;
        return { total, used, remaining };
    };
    const login = (email, password) => {
        // 데모 버전 - 이메일만 확인
        const user = employees.find(emp => emp.email === email);
        if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
        }
        else {
            alert("등록되지 않은 사용자입니다.");
        }
    };
    const logout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
    };
    const register = (name, email, password, department, position) => {
        // 회원가입 요청 생성 (최고관리자 승인 필요)
        const newRequest = {
            id: Math.max(...registrationRequests.map(r => r.id), 0) + 1,
            name,
            email,
            password,
            department,
            position,
            requestDate: new Date().toISOString().split("T")[0],
            status: "대기",
        };
        setRegistrationRequests([...registrationRequests, newRequest]);
        alert("회원가입 요청이 전송되었습니다. 관리자 승인 후 로그인이 가능합니다.");
    };
    const approveRegistration = (id) => {
        const request = registrationRequests.find(r => r.id === id);
        if (!request)
            return;
        // 새 직원 추가
        const newEmployee = {
            id: Math.max(...employees.map(e => e.id), 0) + 1,
            name: request.name,
            email: request.email,
            password: request.password,
            department: request.department,
            position: request.position,
            phone: "",
            status: "업무 중",
            hireDate: new Date().toISOString().split("T")[0],
            role: "일반직원",
        };
        setEmployees([...employees, newEmployee]);
        // 요청 상태 변경
        setRegistrationRequests(registrationRequests.map(r => r.id === id ? { ...r, status: "승인" } : r));
        alert(`${request.name}님의 가입이 승인되었습니다.`);
    };
    const rejectRegistration = (id) => {
        setRegistrationRequests(registrationRequests.map(r => r.id === id ? { ...r, status: "거절" } : r));
        const request = registrationRequests.find(r => r.id === id);
        if (request) {
            alert(`${request.name}님의 가입 요청이 거절되었습니다.`);
        }
    };
    const addChatRoom = (room) => {
        const newRoom = {
            ...room,
            id: Math.max(...chatRooms.map(r => r.id), 0) + 1,
        };
        setChatRooms([...chatRooms, newRoom]);
        return newRoom.id;
    };
    const updateChatRoom = (id, updates) => {
        setChatRooms(chatRooms.map(room => room.id === id ? { ...room, ...updates } : room));
    };
    const sendMessage = (roomId, content) => {
        const newMessage = {
            id: Math.max(...(chatMessages[roomId]?.map(m => m.id) || []), 0) + 1,
            sender: currentUser ? currentUser.name : "익명",
            senderId: currentUser ? currentUser.id : 0,
            content,
            timestamp: new Date().toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
            isMe: !!currentUser,
        };
        setChatMessages(prev => ({
            ...prev,
            [roomId]: [...(prev[roomId] || []), newMessage],
        }));
    };
    return (<AppContext.Provider value={{
            notices,
            addNotice,
            incrementNoticeViews,
            vacationRequests,
            addVacationRequest,
            approveVacation,
            rejectVacation,
            cancelVacation,
            employees,
            addEmployee,
            updateEmployee,
            deleteEmployee,
            updateEmployeeStatus,
            notifications,
            addNotification,
            markNotificationRead,
            calendarEvents,
            addCalendarEvent,
            updateCalendarEvent,
            deleteCalendarEvent,
            currentUser,
            isAuthenticated,
            login,
            logout,
            register,
            registrationRequests,
            approveRegistration,
            rejectRegistration,
            getVacationBalance,
            chatRooms,
            chatMessages,
            addChatRoom,
            updateChatRoom,
            sendMessage,
        }}>
      {children}
    </AppContext.Provider>);
}
export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
}

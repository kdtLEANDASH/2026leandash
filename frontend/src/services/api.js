import axios from 'axios';

export const testApiConnection = async () => {
    try {

        const response = await axios.get('/api/chat/rooms');
        console.log("백엔드 응답 성공:", response.data);
        return response.data;
    } catch (error) {
        console.error("에러 발생:", error);
    }
};
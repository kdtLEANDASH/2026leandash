// src/components/Login.jsx (형 로그인 화면 파일)
import React, { useState } from 'react';
// 💡 방금 만든 도구상자에서 loginAPI 스킬만 쏙 빼온다!
import { loginAPI } from '../api/authApi';

const Login = () => {
    const [employeeNo, setEmployeeNo] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            // 💡 여기서 드디어 아나 궁(Q)을 쏘는 거임!!!
            // 아까 만든 loginAPI에 사번이랑 비번 넣어서 발사!
            const data = await loginAPI({ employeeNo, password });

            // 200 OK 떨어지면 토큰 훔쳐서 금고에 넣기
            const token = data.accessToken;
            localStorage.setItem('accessToken', token);

            alert('형! 로그인 성공! 토큰 수금 완료 ㅋㅋㅋ');

        } catch (error) {
            console.error('로그인 에러:', error);
            alert('아씨 튕겼다! 사번 비번 다시 확인해!');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="text"
                placeholder="사번 (ex. EMP999)"
                onChange={(e) => setEmployeeNo(e.target.value)}
            />
            <input
                type="password"
                placeholder="비밀번호"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">로그인 가즈아</button>
        </form>
    );
};

export default Login;
# 🚀 LeanDash (린대쉬)
> **스타트업 및 소규모 기업을 위한 통합 사내 서포트 플랫폼**

[![Notion](https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white)](https://www.notion.so/334f734340a78006940eff7e1e7988b2?v=334f734340a780d482e8000c4b8f5903)
[![Wireframe](https://img.shields.io/badge/Wireframe-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.notion.so/334f734340a78017b915f79f01ab2ec2?v=334f734340a7804595e1000ced1050f3&p=341f734340a780749469c3a5e3a0b780&pm=s)

## 1. Project Overview
**LeanDash**는 파편화된 사내 업무 프로세스를 하나의 플랫폼으로 통합하여 업무 효율을 높이는 **HR(인사관리) 및 협업 솔루션**입니다. 카카오톡이나 구두로 처리되던 근태 관리, 일정 공유, 사내 소통을 디지털화하여 데이터 기반의 체계적인 조직 관리를 지원합니다.

---

## 2. Team: 2026KDT 남자만있조 👨‍💻
| 역할 | 이름 | 담당 업무 | GitHub |
| :--- | :--- | :--- | :--- |
| **Team Leader** | **이지온** | 프로젝트 총괄 및 시스템 아키텍처 설계 | 각자 작성 바람 |
| **Frontend** | **김병훈** | 각자 작성 바람 | 각자 작성 바람|
| **Frontend** | **장영우** | 각자 작성 바람 | 각자 작성 바람|
| **Backend** | **박현** | 각자 작성 바람 | 각자 작성 바람|
| **Backend** | **김두현** | 각자 작성 바람 | 각자 작성 바람|
| **Documentation** | **이훈희** | 각자 작성 바람 | 각자 작성 바람|

---

## 3. Tech Stack

### Frontend
- **Framework:** React (Vite)
- **Language:** TypeScript
- **State Management:** (진행 시 추가 예: Zustand, React Query)
- **Styling:** (진행 시 추가 예: Tailwind CSS)

### Backend
- **Main Server:** Java 21 / Spring Boot 3.x
- **Security:** Spring Security 6.x / JWT
- **Chat Server:** Node.js 20.x / Socket.io
- **Build Tool:** Gradle

### Database & Infra
- **Database:** MySQL 8.0
- **Infrastructure:** Docker / Docker Compose

---

## 4. Key Features

### 👤 직원 및 상태 관리 (HR Management)
- **실시간 상태 대시보드:** 업무 중/자리 비움/휴가 등 팀원의 상태를 한눈에 파악
- **인사 정보 관리:** 직원 프로필 등록, 수정 및 부서별 목록 조회
- **자동 상태 업데이트:** 휴가 승인 시 시스템 내 상태 실시간 자동 반영

### 📅 근태 및 일정 관리 (Attendance & Calendar)
- **휴가 워크플로우:** 연차/병가 신청 및 팀장 승인/반려 시스템
- **연차 자동 관리:** 잔여 연차 실시간 조회 및 자동 차감 기능
- **시각화 캘린더:** 팀별 휴가 현황 및 전사 일정을 색상별로 구분하여 시각화

### 💬 실시간 협업 (Communication)
- **메신저:** Socket.io 기반의 1:1 다이렉트 메시지 및 그룹 채팅
- **공지 채널:** 전사/부서별 공지사항 등록 및 실시간 푸시 알림
- **파일 공유:** 업무에 필요한 문서 및 이미지 파일 전송 기능

---

## 5. Non-Functional Requirements
- **가용성:** 24시간 상시 접속 가능한 서비스 환경 구축
- **성능:** API 요청 및 데이터 검색 결과 2초 이내 응답 보장
- **무결성:** 장애 복구 시 데이터 정합성 유지 및 일괄 입력 지원
- **사용성:** 직관적인 UI를 통한 낮은 학습 곡선 제공

---

## 6. Document Links
- [요구사항 정의서](https://www.notion.so/33bf734340a780589465f3730cea7bbe)

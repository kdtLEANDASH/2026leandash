import { useNavigate } from "react-router-dom";
import TopNav from "../../components/TopNav";
import "./VacationPage.css";

function VacationPage() {
  const navigate = useNavigate();

  return (
    <div className="vacation-page">
      <TopNav />

      <div className="vacation-page-body">
        <div className="vacation-page-shell">
          <aside className="vacation-sidebar">
            <button
              className="vacation-side-btn active"
              onClick={() => navigate("/vacation/apply")}
            >
              휴가 신청하기
            </button>

            <button
              className="vacation-side-btn"
              onClick={() => navigate("/vacation/list")}
            >
              신청 휴가목록
            </button>
          </aside>

          <main className="vacation-content">
            <section className="vacation-summary-card">
              <div className="section-title">내 휴가 현황</div>

              <div className="vacation-summary-grid">
                <div className="summary-item">
                  <span className="summary-label">총 연차</span>
                  <strong className="summary-value">15일</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">사용 연차</span>
                  <strong className="summary-value">4일</strong>
                </div>

                <div className="summary-item">
                  <span className="summary-label">잔여 연차</span>
                  <strong className="summary-value highlight">11일</strong>
                </div>
              </div>
            </section>

            <section className="vacation-calendar-card">
              <div className="section-title">캘린더</div>
              <p className="section-desc">
                사내 일정 + 소속 부서 직원 휴가 표기
              </p>

              <div className="calendar-placeholder">
                <div className="calendar-placeholder-inner">
                  <div className="calendar-icon">📅</div>
                  <div className="calendar-main-text">휴가 일정 캘린더 영역</div>
                  <div className="calendar-sub-text">
                    추후 시작일 / 종료일 선택 및 일정 표시 기능 연결
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>

        <button className="chat-btn">채팅</button>
      </div>
    </div>
  );
}

export default VacationPage;
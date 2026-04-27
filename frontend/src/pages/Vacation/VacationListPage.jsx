import { useNavigate } from "react-router-dom";
import TopNav from "../../components/TopNav";
import "./VacationList.css";

const vacationList = [
  {
    id: 1,
    type: "연차",
    period: "2026-05-01 ~ 2026-05-03",
    status: "승인",
  },
  {
    id: 2,
    type: "반차",
    period: "2026-05-10",
    status: "대기",
  },
  {
    id: 3,
    type: "병가",
    period: "2026-05-15 ~ 2026-05-16",
    status: "반려",
  },
];

export default function VacationListPage() {
  const navigate = useNavigate();

  return (
    <div className="vacation-list-page">
      <TopNav />

      <div className="vacation-list-body">
        <div className="vacation-list-layout">

          {/* 좌측 메뉴 */}
          <aside className="vacation-sidebar">
            <button
              className="vacation-side-btn"
              onClick={() => navigate("/vacation/apply")}
            >
              휴가 신청하기
            </button>

            <button className="vacation-side-btn active">
              신청 휴가목록
            </button>
          </aside>

          {/* 메인 */}
          <main className="vacation-list-content">
            <section className="vacation-list-card">
              <div className="vacation-list-title">
                내가 신청한 휴가 목록
              </div>

              <div className="vacation-list-desc">
                * 휴가 승인 상태 표시, 취소 / 수정 기능 추가 예정
              </div>

              <div className="vacation-table">
                <div className="vacation-table-header">
                  <span>휴가 종류</span>
                  <span>기간</span>
                  <span>상태</span>
                  <span>관리</span>
                </div>

                {vacationList.map((item) => (
                  <div key={item.id} className="vacation-row">
                    <span>{item.type}</span>
                    <span>{item.period}</span>

                    <span
                      className={`status ${item.status}`}
                    >
                      {item.status}
                    </span>

                    <div className="row-actions">
                      <button>수정</button>
                      <button className="danger">취소</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

              <button className="chat-btn">채팅</button>
           
          </main>
        </div>
      </div>
    </div>
  );
}
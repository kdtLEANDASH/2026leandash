import { useState } from "react";
import TopNav from "../../components/TopNav";
import "./CalendarPage.css";

function CalendarPage() {
  const [editMode, setEditMode] = useState(false);

  const schedules = [
    { id: 1, title: "휴가", memo: "내 생일" },
    { id: 2, title: "반차", memo: "병원" },
  ];

  return (
    <div className="calendar-page">
      <TopNav />

      <main className="calendar-page-body">
        <div className="calendar-shell">

          {/* 좌측 */}
          <aside className="calendar-sidebar">
            <button
              className={`calendar-side-btn ${!editMode ? "active" : ""}`}
              onClick={() => setEditMode(false)}
            >
              일정 목록
            </button>

            <button
              className={`calendar-side-btn ${editMode ? "active" : ""}`}
              onClick={() => setEditMode(true)}
            >
              일정 추가/수정
            </button>
          </aside>

          {/* 우측 */}
          <section className="calendar-content">

            {/* 캘린더 */}
            <div className="calendar-card">
              <div className="calendar-top">
                <button>&lt;</button>
                <strong>2026년 4월</strong>
                <button>&gt;</button>
              </div>

              <table className="calendar-table">
                <thead>
                  <tr>
                    <th>일</th>
                    <th>월</th>
                    <th>화</th>
                    <th>수</th>
                    <th>목</th>
                    <th>금</th>
                    <th>토</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td className="muted">29</td>
                    <td className="muted">30</td>
                    <td className="muted">31</td>
                    <td>1</td>
                    <td>2</td>
                    <td>3</td>
                    <td>4</td>
                  </tr>
                  <tr>
                    <td>5</td>
                    <td>6</td>
                    <td>7</td>
                    <td>8</td>
                    <td>9</td>
                    <td className="today">10</td>
                    <td>11</td>
                  </tr>
                  <tr>
                    <td>12</td>
                    <td>13</td>
                    <td>14</td>
                    <td>15</td>
                    <td>16</td>
                    <td className="has-schedule">17</td>
                    <td>18</td>
                  </tr>
                  <tr>
                    <td>19</td>
                    <td>20</td>
                    <td>21</td>
                    <td>22</td>
                    <td>23</td>
                    <td>24</td>
                    <td>25</td>
                  </tr>
                  <tr>
                    <td>26</td>
                    <td>27</td>
                    <td>28</td>
                    <td>29</td>
                    <td>30</td>
                    <td className="muted">1</td>
                    <td className="muted">2</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 하단 */}
            {!editMode ? (
              <div className="schedule-card">
                <h2>상세 일정 목록</h2>

                <div className="schedule-columns">
                  <div>
                    <h3>사내 일정</h3>
                    <ul>
                      <li>팀 회의</li>
                    </ul>
                  </div>

                  <div>
                    <h3>내 일정</h3>
                    <ul>
                      {schedules.map((s) => (
                        <li key={s.id}>
                          {s.title} ({s.memo})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="schedule-card">
                <h2>내 일정 관리</h2>

                <ul className="my-list">
                  {schedules.map((s) => (
                    <li key={s.id}>
                      <div>
                        <strong>{s.title}</strong>
                        <span>{s.memo}</span>
                      </div>

                      <div className="actions">
                        <button className="edit-btn">수정</button>
                        <button className="delete-btn">삭제</button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="form">
                  <input type="date" />
                  <input type="text" placeholder="제목" />
                  <textarea placeholder="메모" />
                  <button className="save-btn">저장</button>
                </div>
              </div>
            )}

          </section>
        </div>
      </main>

      <button className="chat-btn">채팅</button>
    </div>
  );
}

export default CalendarPage;
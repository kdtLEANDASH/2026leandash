import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/TopNav";
import "./vacationApply.css";

export default function VacationApplyPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    leaveType: "연차",
    startDate: "",
    endDate: "",
    reason: "",
    emergencyContact: "",
    handoverNote: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleReset = () => {
    setForm({
      leaveType: "연차",
      startDate: "",
      endDate: "",
      reason: "",
      emergencyContact: "",
      handoverNote: "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      alert("시작일, 종료일, 사유는 필수 입력 항목입니다.");
      return;
    }

    alert("휴가 신청이 접수되었습니다.");
  };

  return (
    <div className="vacation-apply-page">
      <TopNav />

      <div className="vacation-apply-body">
        <div className="vacation-apply-layout">
          <aside className="vacation-sidebar">
            <button
              className="vacation-side-btn active"
              type="button"
              onClick={() => navigate("/vacation")}
            >
              휴가 신청하기
            </button>

            <button
              className="vacation-side-btn"
              type="button"
              onClick={() => navigate("/vacation/list")}
            >
              신청 휴가목록
            </button>
          </aside>

          <main className="vacation-apply-content">
            <section className="vacation-apply-card">
              <div className="vacation-apply-title">&lt;휴가 신청&gt;</div>

              <form className="vacation-form" onSubmit={handleSubmit}>
                <div className="vacation-form-grid">
                  <div className="form-group">
                    <label>휴가 종류</label>
                    <select
                      name="leaveType"
                      value={form.leaveType}
                      onChange={handleChange}
                    >
                      <option value="연차">연차</option>
                      <option value="반차">반차</option>
                      <option value="병가">병가</option>
                      <option value="공가">공가</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>비상 연락처</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={form.emergencyContact}
                      onChange={handleChange}
                      placeholder="예: 010-1234-5678"
                    />
                  </div>

                  <div className="form-group">
                    <label>시작일</label>
                    <input
                      type="date"
                      name="startDate"
                      value={form.startDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>종료일</label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="vacation-calendar-box">
                  <div className="calendar-box-title">캘린더</div>
                  <div className="calendar-box-desc">
                    시작일, 종료일 선택 및 표시 영역
                  </div>
                  <div className="calendar-box-placeholder">
                    추후 캘린더 컴포넌트 연결 예정
                  </div>
                </div>

                <div className="form-group full">
                  <label>사유</label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="휴가 신청 사유를 입력하세요."
                    rows={5}
                  />
                </div>

                <div className="form-group full">
                  <label>인수인계 / 비고</label>
                  <textarea
                    name="handoverNote"
                    value={form.handoverNote}
                    onChange={handleChange}
                    placeholder="업무 인수인계 사항 또는 참고 내용을 입력하세요."
                    rows={4}
                  />
                </div>

                <div className="vacation-form-actions">
                  <button
                    type="button"
                    className="vacation-action-btn"
                    onClick={handleReset}
                  >
                    초기화
                  </button>

                  <button
                    type="submit"
                    className="vacation-action-btn primary"
                  >
                    신청하기
                  </button>
                </div>
              </form>
            </section>

            <button className="chat-btn">채팅</button>
          </main>
        </div>
      </div>
    </div>
  );
}
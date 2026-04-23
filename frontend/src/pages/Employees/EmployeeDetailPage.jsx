import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopNav from "../../components/TopNav";
import "./employee-detail.css";

const departments = ["개발팀", "기획팀", "인사팀", "디자인팀"];

const employeeData = [
  {
    id: 1,
    name: "김두현",
    department: "개발팀",
    position: "백엔드 개발자",
    status: "재직",
    phone: "010-1111-2222",
    email: "dscd12@leandash.com",
    photo: "https://placehold.co/160x160?text=EMP",
  },
  {
    id: 2,
    name: "김병훈",
    department: "기획팀",
    position: "프론트엔드 개발자",
    status: "재직",
    phone: "010-2222-3333",
    email: "k-bang0518@leandash.com",
    photo: "https://placehold.co/160x160?text=EMP",
  },
  {
    id: 3,
    name: "박현",
    department: "개발팀",
    position: "백엔드 개발자",
    status: "재직",
    phone: "010-3333-4444",
    email: "Sdasvazx@leandash.com",
    photo: "https://placehold.co/160x160?text=EMP",
  },
  {
    id: 4,
    name: "이훈희",
    department: "인사팀",
    position: "인사 담당자",
    status: "휴가",
    phone: "010-4444-5555",
    email: "hunhee22@leandash.com",
    photo: "https://placehold.co/160x160?text=EMP",
  },
  {
    id: 5,
    name: "이지온",
    department: "인사팀",
    position: "팀장",
    status: "재직",
    phone: "010-5555-6666",
    email: "izzyon0121@leandash.com",
    photo: "https://placehold.co/160x160?text=EMP",
  },
  {
    id: 6,
    name: "정영우",
    department: "개발팀",
    position: "프론트엔드 개발자",
    status: "재직",
    phone: "010-5555-6666",
    email: "youngwoo0110121@leandash.com",
    photo: "https://placehold.co/160x160?text=EMP",
  },
];

export default function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const employee = useMemo(
    () => employeeData.find((item) => String(item.id) === String(id)),
    [id]
  );

  if (!employee) {
    return (
      <div className="employee-detail-page">
        <TopNav />
        <div className="not-found-box">
          <h2>직원 정보를 찾을 수 없습니다.</h2>
          <button
            className="action-btn active"
            onClick={() => navigate("/employees")}
          >
            직원 조회로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-detail-page">
      <TopNav />

      <div className="employee-detail-layout">
        <aside className="employee-sidebar">
          <div className="sidebar-title">부서</div>
          <ul className="department-list">
            {departments.map((dept) => (
              <li key={dept}>
                <button className="department-btn" type="button">
                  {dept}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="employee-detail-content">
          <section className="employee-detail-box">
            <div className="detail-header">&lt;해당 직원 정보&gt;</div>

            <div className="detail-body">
              <div className="detail-info">
                <ul>
                  <li><strong>이름</strong><span>{employee.name}</span></li>
                  <li><strong>부서</strong><span>{employee.department}</span></li>
                  <li><strong>직급</strong><span>{employee.position}</span></li>
                  <li><strong>상태</strong><span>{employee.status}</span></li>
                  <li><strong>연락처</strong><span>{employee.phone}</span></li>
                  <li><strong>이메일</strong><span>{employee.email}</span></li>
                </ul>
              </div>

              <div className="detail-profile">
                <img src={employee.photo} alt={employee.name} />
              </div>
            </div>

            <div className="detail-actions">
              <button className="inquiry-btn" type="button">
                1:1 문의(채팅)하기
              </button>
            </div>
          </section>

          <div className="employee-bottom-actions">
            <div className="left-actions">
              <button
                className="action-btn"
                type="button"
                onClick={() => navigate("/employees")}
              >
                목록으로
              </button>
            </div>

            <button className="chat-btn" type="button">
              채팅
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
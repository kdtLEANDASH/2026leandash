import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopNav from "../../components/TopNav";
import "./employee.css";

const departments = ["개발팀"];

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
    department: "개발팀",
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
    department: "개발팀",
    position: "기획/협업 담당",
    status: "휴가",
    phone: "010-4444-5555",
    email: "hunhee22@leandash.com",
    photo: "https://placehold.co/160x160?text=EMP",
  },
  {
    id: 5,
    name: "이지온",
    department: "개발팀",
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
    phone: "010-6666-7777",
    email: "youngwoo0110121@leandash.com",
    photo: "https://placehold.co/160x160?text=EMP",
  },
];

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const [selectedDept, setSelectedDept] = useState("개발팀");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [viewMode, setViewMode] = useState("org");

  const filteredEmployees = useMemo(() => {
    let list = employeeData.filter((emp) => emp.department === selectedDept);

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.trim().toLowerCase();
      list = list.filter(
        (emp) =>
          emp.name.toLowerCase().includes(keyword) ||
          emp.position.toLowerCase().includes(keyword) ||
          emp.department.toLowerCase().includes(keyword)
      );
    }

    return list;
  }, [selectedDept, searchKeyword]);

  const teamLeader = useMemo(
    () => filteredEmployees.find((emp) => emp.position === "팀장"),
    [filteredEmployees]
  );

  const teamMembers = useMemo(
    () => filteredEmployees.filter((emp) => emp.position !== "팀장"),
    [filteredEmployees]
  );

  return (
    <div className="employee-page">
      <TopNav />

      <div className="employee-layout employee-layout-top">
        <aside className="employee-sidebar">
          <div className="sidebar-title">부서</div>

          <ul className="department-list">
            {departments.map((dept) => (
              <li key={dept}>
                <button
                  className={`department-btn ${
                    selectedDept === dept ? "selected" : ""
                  }`}
                  onClick={() => setSelectedDept(dept)}
                >
                  {dept}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="employee-content">
          <div className="employee-search-box">
            <input
              type="text"
              placeholder="직원명, 직급으로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          <section className="employee-board">
            <div className="board-title">
              {viewMode === "org"
                ? `${selectedDept} 직원 조직도`
                : `${selectedDept} 전체 직원 목록`}
            </div>

            {viewMode === "org" ? (
              <div className="org-tree">
                {teamLeader ? (
                  <>
                    <div className="org-leader-wrap">
                      <div
                        className="org-card leader"
                        onClick={() => navigate(`/employees/${teamLeader.id}`)}
                      >
                        <img
                          src={teamLeader.photo}
                          alt={teamLeader.name}
                          className="org-thumb"
                        />
                        <h3>{teamLeader.name}</h3>
                        <p>{teamLeader.position}</p>
                        <span
                          className={`status-badge ${
                            teamLeader.status === "재직" ? "working" : "vacation"
                          }`}
                        >
                          {teamLeader.status}
                        </span>
                      </div>
                    </div>

                    <div className="org-top-line"></div>

                    <div className="org-members-wrap">
                      <div className="org-horizontal-line"></div>

                      <div className="org-members-row">
                        {teamMembers.length > 0 ? (
                          teamMembers.map((emp) => (
                            <div
                              key={emp.id}
                              className="org-member-column"
                              onClick={() => navigate(`/employees/${emp.id}`)}
                            >
                              <div className="org-member-line"></div>

                              <div className="org-card member">
                                <img
                                  src={emp.photo}
                                  alt={emp.name}
                                  className="org-thumb"
                                />
                                <h3>{emp.name}</h3>
                                <p>{emp.position}</p>
                                <span
                                  className={`status-badge ${
                                    emp.status === "재직" ? "working" : "vacation"
                                  }`}
                                >
                                  {emp.status}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-message">팀원 정보가 없습니다.</div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-message">팀장 정보가 없습니다.</div>
                )}
              </div>
            ) : (
              <div className="employee-card-grid">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="employee-card"
                      onClick={() => navigate(`/employees/${emp.id}`)}
                    >
                      <img
                        src={emp.photo}
                        alt={emp.name}
                        className="employee-thumb"
                      />
                      <div className="employee-card-info">
                        <h3>{emp.name}</h3>
                        <p>{emp.department}</p>
                        <p>{emp.position}</p>
                        <span
                          className={`status-badge ${
                            emp.status === "재직" ? "working" : "vacation"
                          }`}
                        >
                          {emp.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">조회된 직원이 없습니다.</div>
                )}
              </div>
            )}
          </section>

          <div className="employee-bottom-actions">
            <div className="left-actions">
              <button
                type="button"
                className={`action-btn ${viewMode === "org" ? "active" : ""}`}
                onClick={() => setViewMode("org")}
              >
                조직도 표시
              </button>

              <button
                type="button"
                className={`action-btn ${viewMode === "all" ? "active" : ""}`}
                onClick={() => setViewMode("all")}
              >
                전체 직원 표시
              </button>
            </div>

            <button className="chat-btn">채팅</button>
          </div>
        </main>
      </div>
    </div>
  );
}
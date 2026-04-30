import hero from "../../assets/hero.png";
import Header from "../../components/Header";
import "./UserMainPage.css";

function UserMainPage() {
    return (
        <div className="user-main-page">
            <section className="user-main-hero">
                <div
                    className="user-hero-bg"
                    style={{ backgroundImage: `url(${hero})` }}
                />
                <div className="user-hero-dim" />

                <Header />

                <div className="user-hero-content">
                    <article className="employee-dashboard-card">
                        <div className="employee-main-info">
                            <p className="card-label">내 정보</p>
                            <h1>김뱅 님</h1>
                            <p className="employee-sub">개발팀 · 사원</p>

                            <div className="employee-info-list">
                                <span>사번 202604001</span>
                                <span>입사일 2026.04.01</span>
                            </div>
                        </div>

                        <div className="dashboard-divider" />

                        <div className="employee-summary-list">
                            <div className="summary-item">
                                <span>총 연차</span>
                                <strong>15일</strong>
                            </div>

                            <div className="summary-item">
                                <span>사용 연차</span>
                                <strong>3일</strong>
                            </div>

                            <div className="summary-item highlight">
                                <span>남은 연차</span>
                                <strong>12일</strong>
                            </div>

                            <div className="summary-item">
                                <span>승인 대기</span>
                                <strong>1건</strong>
                            </div>
                        </div>
                    </article>
                </div>
            </section>

            <section className="user-content-section">
                <article className="user-content-card user-calendar-card">
                    <div className="user-card-header">
                        <h2>캘린더</h2>
                        <a href="#">전체보기</a>
                    </div>

                    <div className="user-calendar-box">
                        <div className="user-calendar-top">
                            <button type="button">&lt;</button>
                            <strong>2026년 4월</strong>
                            <button type="button">&gt;</button>
                        </div>

                        <table className="user-calendar-table">
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
                                    <td>17</td>
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

                        <p className="user-calendar-note">
                            저장한 개인 일정과 휴가 일정이 표시됩니다.
                        </p>
                    </div>
                </article>

                <div className="user-right-column">
                    <article className="user-content-card">
                        <div className="user-card-header">
                            <h2>사내 공지</h2>
                            <a href="#">더보기</a>
                        </div>

                        <ul className="user-list">
                            <li>등록된 사내 공지가 없습니다.</li>
                        </ul>
                    </article>

                    <article className="user-content-card">
                        <div className="user-card-header">
                            <h2>금일 일정</h2>
                            <a href="#">더보기</a>
                        </div>

                        <ul className="user-list">
                            <li>오늘 등록된 일정이 없습니다.</li>
                        </ul>
                    </article>
                </div>
            </section>

            <button className="chat-btn" type="button">
                채팅
            </button>
        </div>
    );
}

export default UserMainPage;
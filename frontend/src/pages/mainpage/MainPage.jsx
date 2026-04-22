import hero from "../../assets/hero.png";
import Header from "../../components/Header";

function MainPage() {
  return (
    <div className="page">
      <section className="main-hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(${hero})` }}
        />
        <div className="hero-dim" />

        <Header />

        <div className="hero-content">
          <h1>사내 업무를 한눈에 관리하세요</h1>
          <p>인사 · 근태 · 휴가를 하나의 시스템에서</p>
        </div>
      </section>

      <section className="content-section">
        <div className="content-card calendar-card">
          <div className="card-header">
            <h2>캘린더</h2>
            <a href="#">전체보기</a>
          </div>

          <div className="calendar-box">
            <div className="calendar-top">
              <button type="button">&lt;</button>
              <strong>2026년 4월</strong>
              <button type="button">&gt;</button>
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

            <p className="calendar-note">
              비로그인 상태에서는 주요 사내 일정만 간략하게 표시됩니다.
            </p>
          </div>
        </div>

        <div className="right-column">
          <div className="content-card notice-card">
            <div className="card-header">
              <h2>사내 공지</h2>
              <a href="#">더보기</a>
            </div>

            <ul className="notice-list">
              
            </ul>
          </div>

          <div className="content-card today-card">
            <div className="card-header">
              <h2>금일 일정</h2>
              <a href="#">더보기</a>
            </div>

            <ul className="today-list">
            </ul>
          </div>
        </div>
      </section>

      <button className="chat-btn" type="button">
        채팅
      </button>
    </div>
  );
}

export default MainPage;
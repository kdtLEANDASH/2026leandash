import logo from "../../assets/Logo.png";
import hero from "../../assets/hero.png";
import "../../pages/Auth/LoginPage.css";

function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-left">
          <div className="login-left-inner">
            <div className="login-logo-box">
              <img src={logo} alt="Leandash 로고" />
            </div>

            <form className="login-form">
              <div className="login-field">
                <label htmlFor="userId">아이디</label>
                <input
                  id="userId"
                  type="text"
                  placeholder="아이디를 입력하세요"
                />
              </div>

              <div className="login-field">
                <label htmlFor="userPw">비밀번호</label>
                <input
                  id="userPw"
                  type="password"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>

              <button type="submit" className="login-primary-btn">
                로그인
              </button>

              <button type="button" className="login-secondary-btn">
                비밀번호 찾기
              </button>

              <p className="login-join-text">
                * 회원가입은 가입양식만 추가, 형태는 동일
              </p>
            </form>
          </div>
        </div>

        <div className="login-right">
          <div
            className="login-right-visual"
            style={{ backgroundImage: `url(${hero})` }}
          >
            <div className="login-right-dim" />
            <div className="login-right-text">
              <strong>LEANDASH</strong>
              <p>인사 · 근태 · 휴가 · 결재를 하나의 시스템에서</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
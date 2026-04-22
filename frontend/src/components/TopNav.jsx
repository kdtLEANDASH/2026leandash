import { Link, useLocation } from "react-router-dom";
import logo from "../assets/Logo.png";
import "./TopNav.css";

function TopNav() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/" className="topnav-logo" aria-label="홈으로 이동">
          <img src={logo} alt="LeanDash 로고" />
        </Link>

        <nav className="topnav-menu">
          <Link
            to="/employees"
            className={`topnav-link ${isActive("/employees") ? "active" : ""}`}
          >
            직원조회
          </Link>

          <Link
            to="/vacation"
            className={`topnav-link ${isActive("/vacation") ? "active" : ""}`}
          >
            휴가신청
          </Link>

          <Link
            to="/approval"
            className={`topnav-link ${isActive("/approval") ? "active" : ""}`}
          >
            결재신청
          </Link>

          <Link
            to="/callendar"
            className={`topnav-link ${isActive("/callendar") ? "active" : ""}`}
          >
            캘린더
          </Link>
		  
          <Link
            to="/search"
            className={`topnav-link ${isActive("/search") ? "active" : ""}`}
          >
            통합검색
          </Link>
		  
          <Link
            to="/notice"
            className={`topnav-link ${isActive("/notice") ? "active" : ""}`}
          >
            문의/공지사항
          </Link>
        </nav>

        <div className="topnav-right">
          <button type="button">로그아웃</button>
        </div>
      </div>
    </header>
  );
}

export default TopNav;
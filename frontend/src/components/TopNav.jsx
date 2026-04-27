import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/Logo.png";
import "./css/TopNav.css";

function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // 나중에 로그인 연동되면 여기만 실제 회원명으로 바꾸면 됨
  const userName = "홍길동";

  const isActive = (path) => location.pathname === path;

  const toggleUserMenu = () => {
    setIsUserMenuOpen((prev) => !prev);
  };

  const handleMyPage = () => {
    setIsUserMenuOpen(false);
    navigate("/mypage");
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
            to="/calendar"
            className={`topnav-link ${isActive("/calendar") ? "active" : ""}`}
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

		<div className="topnav-right" ref={userMenuRef}>
		  <button
		    type="button"
		    className="topnav-user-btn"
		    onClick={toggleUserMenu}
		  >
		    내 정보
		  </button>

		  {isUserMenuOpen && (
		    <div className="topnav-user-dropdown">
		      <div className="topnav-user-name">{userName}님</div>

		      <button
		        type="button"
		        className="topnav-dropdown-btn"
		        onClick={handleMyPage}
		      >
		        마이페이지
		      </button>

		      <button
		        type="button"
		        className="topnav-dropdown-btn logout"
		        onClick={handleLogout}
		      >
		        로그아웃
		      </button>
		    </div>
		  )}
		</div>
      </div>
    </header>
  );
}

export default TopNav;
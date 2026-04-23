import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const logoUrl = new URL("../assets/Logo.png", import.meta.url).href;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 120);
    };

    window.addEventListener("scroll", onScroll);
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`hero-header ${scrolled ? "scrolled" : ""}`}>
      <div className="hero-header-inner">

        {/* 로고 */}
        <Link to="/" className="logo">
          <img src={logoUrl} alt="Leandash 로고" />
        </Link>

        {/* 네비 */}
        <nav className="hero-nav">
          <Link to="/employees" className="nav-link">직원조회</Link>
          <Link to="/vacation" className="nav-link">휴가신청</Link>
          <Link to="/approval" className="nav-link">결재신청</Link>
          <Link to="/calendar" className="nav-link">캘린더</Link>
          <Link to="/search" className="nav-link">통합검색</Link>
          <Link to="/notice" className="nav-link">문의/공지사항</Link>
        </nav>

        {/* 로그인 */}
        <div className="hero-icons">
          <button type="button" onClick={() => navigate("/login")}>
            로그인
          </button>
        </div>

      </div>
    </header>
  );
}

export default Header;
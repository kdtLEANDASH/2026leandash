import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/mainpage/MainPage";
import LoginPage from "./pages/Auth/LoginPage";
import EmployeeListPage from "./pages/Employees/EmployeeListPage";
import EmployeeDetailPage from "./pages/Employees/EmployeeDetailPage";
import VacationPage from "./pages/Vacation/VacationPage";
import VacationApplyPage from "./pages/Vacation/VacationApplyPage";
import VacationListPage from "./pages/Vacation/VacationListPage";
import UserMainPage from "./pages/mainpage/UserMainPage";
import CalendarPage from "./pages/Calendar/CalendarPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
	  <Route path="/user/main" element={<UserMainPage />} />

      {/* 직원 조회 */}
      <Route path="/employees" element={<EmployeeListPage />} />
      <Route path="/employees/:id" element={<EmployeeDetailPage />} />
	  
	  {/* 휴가 신청 및 조회 */}
	  <Route path="/vacation" element={<VacationPage />} />
	  <Route path="/vacation/apply" element={<VacationApplyPage />} />
	  <Route path="/vacation/list" element={<VacationListPage />} />
	  
	  {/* 캘린더 */})
	  <Route path="/calendar" element={<CalendarPage />} />
    </Routes>
  );
}

export default App;
import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/mainpage/MainPage";
import LoginPage from "./pages/Auth/LoginPage";
import EmployeeListPage from "./pages/Employees/EmployeeListPage";
import EmployeeDetailPage from "./pages/Employees/EmployeeDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* 직원 조회 */}
      <Route path="/employees" element={<EmployeeListPage />} />
      <Route path="/employees/:id" element={<EmployeeDetailPage />} />
    </Routes>
  );
}

export default App;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Label } from "@/components/UI/label";
import { useAppContext } from "@/store/AppProvider";
import { loginApi } from "@/api/authApi";

import hero from "../../assets/hero.png";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, employees = [] } = useAppContext() || {};

  const [employeeNo, setEmployeeNo] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const loginWithDummyUser = (inputEmployeeNo) => {
    const matchedUser = employees.find((emp) => {
      const empNo =
        emp.employeeNo ||
        emp.employee_no ||
        emp.employeeId ||
        emp.id;

      return String(empNo).toLowerCase() === inputEmployeeNo.toLowerCase();
    });

    if (!matchedUser) {
      alert("등록되지 않은 사번입니다.");
      return false;
    }

    const userEmail = matchedUser.email || "";

    localStorage.setItem("isLogin", "true");
    localStorage.setItem("employeeNo", inputEmployeeNo);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("loginMode", "dummy");

    if (login) {
      login(inputEmployeeNo, password, {
        loginType: "employeeNo",
        user: matchedUser,
      });
    }

    navigate("/dashboard");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const inputEmployeeNo = employeeNo.trim();

    if (!inputEmployeeNo) {
      alert("사번을 입력하세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력하세요.");
      return;
    }

    try {
      setIsLoading(true);

      const result = await loginApi({
        employeeNo: inputEmployeeNo,
        password,
      });
	  
	  console.log("로그인 응답:", result);

      const token =
        result?.accessToken ||
        result?.token ||
        result?.data?.accessToken ||
        result?.data?.token;
		
		console.log("토큰:", token);

      const userEmail =
        result?.email ||
        result?.user?.email ||
        result?.data?.email ||
        result?.data?.user?.email ||
        "";

      if (!token) {
        console.warn("로그인 응답에 토큰이 없어 더미 로그인으로 전환합니다.");
        loginWithDummyUser(inputEmployeeNo);
        return;
      }
	  
	  localStorage.setItem("accessToken", token);

      localStorage.setItem("accessToken", token);
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("employeeNo", inputEmployeeNo);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("loginMode", "api");

      if (login) {
        login(inputEmployeeNo, password, {
          ...result,
          loginType: "employeeNo",
        });
      }

      navigate("/dashboard");
    } catch (error) {
      console.warn("API 로그인 실패. 더미 로그인으로 전환합니다.", error);

      loginWithDummyUser(inputEmployeeNo);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-5xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <CardContent className="p-10 flex flex-col justify-center">
            <div className="mb-8">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="mb-8 inline-flex"
              >
                <img
                  src="/leandash-logo.png"
                  alt="LeanDash 로고"
                  className="h-20 w-auto"
                />
              </button>

              <h2 className="text-2xl font-bold text-gray-900">로그인</h2>
              <p className="mt-2 text-sm text-gray-500">
                사번과 비밀번호로 로그인하세요.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="employeeNo">사번</Label>
                <Input
                  id="employeeNo"
                  type="text"
                  placeholder="예: EMP001"
                  value={employeeNo}
                  onChange={(e) => setEmployeeNo(e.target.value)}
                  autoComplete="username"
                />
              </div>

              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
            </form>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-sm text-blue-600 hover:underline"
              >
                회원가입
              </button>

              <button
                type="button"
                className="text-sm text-gray-500 hover:underline"
              >
                비밀번호 찾기
              </button>
            </div>
          </CardContent>

          <div className="hidden md:block relative">
            <img
              src={hero}
              alt="로그인 이미지"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-white text-center px-6">
                <h2 className="text-2xl font-bold mb-2">LeanDash</h2>
                <p className="text-sm opacity-90">HR 업무를 더 간단하게</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default LoginPage;
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Label } from "@/components/UI/label";
import { useAppContext } from "@/store/AppProvider";

import hero from "../../assets/hero.png"; // 👉 우측 이미지

export function LoginPage() {
  const navigate = useNavigate();
  const { login, employees = [] } = useAppContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const inputEmail = email.trim().toLowerCase();

    if (!inputEmail) {
      alert("이메일을 입력하세요.");
      return;
    }

    const matchedUser = employees.find(
      (emp) => emp.email.toLowerCase() === inputEmail
    );

    if (!matchedUser) {
      alert("등록되지 않은 사용자입니다.");
      return;
    }

    login(matchedUser.email, password);

    localStorage.setItem("isLogin", "true");
    localStorage.setItem("userEmail", matchedUser.email);

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-5xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* 🔹 좌측 로그인 영역 */}
          <CardContent className="p-10 flex flex-col justify-center">
            <div className="mb-8">
              <img
                src="/leandash-logo.png"
                alt="로고"
                className="h-20 w-auto mb-8"
              />

              <h2 className="text-2xl font-bold text-gray-900">
                로그인
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label>이메일</Label>
                <Input
                  type="email"
                  placeholder="example@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label>비밀번호</Label>
                <Input
                  type="password"
                  placeholder="비밀번호 입력"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                로그인
              </Button>
            </form>

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => navigate("/register")}
                className="text-sm text-blue-600 hover:underline"
              >
                회원가입
              </button>

              <button className="text-sm text-gray-500 hover:underline">
                비밀번호 찾기
              </button>
            </div>
          </CardContent>

          {/* 🔹 우측 이미지 영역 */}
          <div className="hidden md:block relative">
            <img
              src={hero}
              alt="로그인 이미지"
              className="h-full w-full object-cover"
            />

            {/* 👉 이미지 위 문구 넣고 싶으면 여기 */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="text-white text-center px-6">
                <h2 className="text-2xl font-bold mb-2">
                  LeanDash
                </h2>
                <p className="text-sm opacity-90">
                  HR 업무를 더 간단하게
                </p>
              </div>
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}
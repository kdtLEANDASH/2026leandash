import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Label } from "@/components/UI/label";
import { signupApi } from "@/api/authApi";
import { getDepartmentsApi } from "@/api/departmentApi";

export function RegisterPage({ onRegister, onToggleLogin }) {
  const navigate = useNavigate();

  const [employeeNo, setEmployeeNo] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [position, setPosition] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const result = await getDepartmentsApi();

        const list = Array.isArray(result)
          ? result
          : result?.data || result?.content || [];

        setDepartments(list);
      } catch (error) {
        console.warn("부서 목록 조회 실패:", error);

        setDepartments([
          { departmentId: 1, department_id: 1, name: "개발팀", departmentName: "개발팀" },
          { departmentId: 2, department_id: 2, name: "인사팀", departmentName: "인사팀" },
          { departmentId: 3, department_id: 3, name: "기획팀", departmentName: "기획팀" },
        ]);
      }
    };

    loadDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!employeeNo.trim()) {
      alert("사번을 입력해주세요.");
      return;
    }

    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    if (!departmentId) {
      alert("부서를 선택해주세요.");
      return;
    }

    if (!password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsLoading(true);

      const signupData = {
        employeeNo: employeeNo.trim(),
        userName: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        departmentId: Number(departmentId),
        phone: phone.trim() || null,
        position: position.trim() || null,
      };

      await signupApi(signupData);

      if (onRegister) {
        onRegister(
          name.trim(),
          email.trim().toLowerCase(),
          password,
          departmentId,
          position.trim()
        );
      }

      alert("회원가입이 완료되었습니다. 로그인해주세요.");

      if (onToggleLogin) {
        onToggleLogin();
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다. 입력값 또는 서버 상태를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-600 mb-2">
            회원가입
          </CardTitle>
          <p className="text-gray-600">새 계정을 만드세요</p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeNo">사번</Label>
              <Input
                id="employeeNo"
                type="text"
                placeholder="EMP001"
                value={employeeNo}
                onChange={(e) => setEmployeeNo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                type="text"
                placeholder="홍길동"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="text"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">부서</Label>
              <select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">부서를 선택하세요</option>
                {departments.map((dept) => {
                  const id = dept.departmentId ?? dept.department_id ?? dept.id;
                  const name =
                    dept.departmentName ?? dept.name ?? dept.department_name;

                  return (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">직급</Label>
              <Input
                id="position"
                type="text"
                placeholder="시니어 개발자"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "가입 처리 중..." : "회원가입"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <button
                type="button"
                onClick={() => {
                  if (onToggleLogin) {
                    onToggleLogin();
                  } else {
                    navigate("/login");
                  }
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                로그인
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RegisterPage;
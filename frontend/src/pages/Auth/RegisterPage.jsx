import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Label } from "@/components/UI/label";
export function RegisterPage({ onRegister, onToggleLogin }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [department, setDepartment] = useState("");
    const [position, setPosition] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }
        onRegister(name, email, password, department, position);
    };
    return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
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
              <Label htmlFor="name">이름</Label>
              <Input id="name" type="text" placeholder="홍길동" value={name} onChange={(e) => setName(e.target.value)} required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input id="email" type="email" placeholder="example@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">부서</Label>
              <Input id="department" type="text" placeholder="개발팀" value={department} onChange={(e) => setDepartment(e.target.value)} required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">직급</Label>
              <Input id="position" type="text" placeholder="시니어 개발자" value={position} onChange={(e) => setPosition(e.target.value)} required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input id="password" type="password" placeholder="비밀번호를 입력하세요" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <Input id="confirmPassword" type="password" placeholder="비밀번호를 다시 입력하세요" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              회원가입
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <button onClick={onToggleLogin} className="text-blue-600 hover:underline font-semibold">
                로그인
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>);
}

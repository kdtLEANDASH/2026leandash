import { useState } from "react";
import { User, Mail, Phone, Briefcase, Calendar, MapPin, Award, Edit2, Save, X, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Badge } from "@/components/UI/badge";
import { useAppContext } from "@/store/AppProvider";
export function MyPage() {
    const { currentUser } = useAppContext();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        phone: currentUser?.phone || "",
        position: currentUser?.position || "",
        department: currentUser?.department || "",
    });
    const handleSave = () => {
        // TODO: 실제 저장 로직 구현
        setIsEditing(false);
    };
    const handleCancel = () => {
        setFormData({
            name: currentUser?.name || "",
            email: currentUser?.email || "",
            phone: currentUser?.phone || "",
            position: currentUser?.position || "",
            department: currentUser?.department || "",
        });
        setIsEditing(false);
    };
    const handleChangePassword = () => {
        alert("비밀번호 변경 기능은 추후 연결 예정입니다.");
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "업무 중":
                return "bg-green-100 text-green-700";
            case "자리 비움":
                return "bg-yellow-100 text-yellow-700";
            case "집중 모드":
                return "bg-purple-100 text-purple-700";
            case "휴가 중":
                return "bg-blue-100 text-blue-700";
            case "오프라인":
                return "bg-gray-100 text-gray-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };
    const getMBTIColor = (mbti) => {
        const type = mbti.slice(0, 2);
        const colors = {
            IS: "bg-blue-100 text-blue-700",
            IN: "bg-purple-100 text-purple-700",
            ES: "bg-green-100 text-green-700",
            EN: "bg-orange-100 text-orange-700",
        };
        return colors[type] || "bg-gray-100 text-gray-700";
    };
    if (!currentUser) {
        return (<div className="flex items-center justify-center h-full">
        <p className="text-gray-500">사용자 정보를 불러올 수 없습니다.</p>
      </div>);
    }
    return (<div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <User className="size-7 text-blue-600"/>
            내 정보
          </h2>
          <p className="text-gray-600">개인 정보를 확인하고 수정할 수 있습니다</p>
        </div>
        {!isEditing ? (<Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
            <Edit2 className="size-4 mr-2"/>
            정보 수정
          </Button>) : (<div className="flex gap-2">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="size-4 mr-2"/>
              저장
            </Button>
            <Button onClick={handleCancel} variant="outline">
              <X className="size-4 mr-2"/>
              취소
            </Button>
          </div>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="size-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-4xl font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <Badge className={`absolute bottom-2 right-2 ${getStatusColor(currentUser.status)}`}>
                  {currentUser.status}
                </Badge>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {currentUser.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3">{currentUser.position}</p>
              <Badge className={getMBTIColor(currentUser.mbti)} variant="outline">
                {currentUser.mbti}
              </Badge>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="size-4 text-gray-400"/>
                <span className="text-gray-600">{currentUser.department}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Award className="size-4 text-gray-400"/>
                <span className="text-gray-600">{currentUser.role}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-gray-400"/>
                <span className="text-gray-600">입사일: {currentUser.hireDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  {isEditing ? (<Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}/>) : (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <User className="size-4 text-gray-400"/>
                      <span className="text-gray-900">{currentUser.name}</span>
                    </div>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  {isEditing ? (<Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>) : (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Mail className="size-4 text-gray-400"/>
                      <span className="text-gray-900">{currentUser.email}</span>
                    </div>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  {isEditing ? (<Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}/>) : (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Phone className="size-4 text-gray-400"/>
                      <span className="text-gray-900">{currentUser.phone}</span>
                    </div>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">직급</Label>
                  {isEditing ? (<Input id="position" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })}/>) : (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Briefcase className="size-4 text-gray-400"/>
                      <span className="text-gray-900">{currentUser.position}</span>
                    </div>)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">부서</Label>
                  {isEditing ? (<Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })}/>) : (<div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <MapPin className="size-4 text-gray-400"/>
                      <span className="text-gray-900">{currentUser.department}</span>
                    </div>)}
                </div>

                <div className="space-y-2">
                  <Label>MBTI</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Award className="size-4 text-gray-400"/>
                    <span className="text-gray-900">{currentUser.mbti}</span>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>비밀번호</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex-1 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Lock className="size-4 text-gray-400"/>
                      <span className="text-gray-900">*****</span>
                    </div>
                    <Button type="button" variant="outline" onClick={handleChangePassword}>
                      비밀번호 변경
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">근무 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>입사일</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Calendar className="size-4 text-gray-400"/>
                    <span className="text-gray-900">{currentUser.hireDate}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>권한</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Award className="size-4 text-gray-400"/>
                    <span className="text-gray-900">{currentUser.role}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>현재 상태</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="size-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-900">{currentUser.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>사원 번호</Label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <User className="size-4 text-gray-400"/>
                    <span className="text-gray-900">
                      EMP-{currentUser.id.toString().padStart(4, "0")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">통계</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">총 휴가 일수</p>
                  <p className="text-2xl font-bold text-blue-700">15일</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600 mb-1">사용 휴가</p>
                  <p className="text-2xl font-bold text-green-700">7일</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600 mb-1">잔여 휴가</p>
                  <p className="text-2xl font-bold text-purple-700">8일</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
}

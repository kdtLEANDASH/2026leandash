import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  Award,
  Edit2,
  Save,
  X,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Badge } from "@/components/UI/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/UI/dialog";
import { updateMyProfileApi, changeMyPasswordApi } from "@/api/userApi";
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";

export function MyPage() {
  const { currentUser, customSettings, refreshMyProfile } = useAppContext();
  const isDark = customSettings?.darkMode;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    position: currentUser?.position || "",
    department: currentUser?.department || "",
    mbti: currentUser?.mbti || "",
  });

  useEffect(() => {
    setFormData({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      position: currentUser?.position || "",
      department: currentUser?.department || "",
      mbti: currentUser?.mbti || "",
    });
  }, [currentUser]);

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const fieldClass = isDark
    ? "bg-[#2f2f36] border border-[#5c5c73] text-zinc-100"
    : "bg-gray-50 text-gray-900";

  const textMainClass = isDark ? "text-white" : "text-gray-900";
  const textSubClass = isDark ? "text-zinc-300" : "text-gray-600";
  const textMutedClass = isDark ? "text-zinc-400" : "text-gray-500";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700 text-white";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const handleSave = async () => {
    // TODO: 실제 저장 로직 구현
    // 현재는 UI 반영용으로 formData 값을 화면에 유지한다.
    try {
      setIsSaving(true);

      await updateMyProfileApi({
        userName: formData.name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        mbti: formData.mbti,
      });

      await refreshMyProfile();
      setIsEditing(false);
      alert("내 정보가 저장되었습니다.");
    } catch (error) {
      console.error("내 정보 수정 실패:", error);
      alert("내 정보 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      position: currentUser?.position || "",
      department: currentUser?.department || "",
      mbti: currentUser?.mbti || "",
    });

    setIsEditing(false);
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!currentPassword.trim()) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }

    if (!newPassword.trim()) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword.length < 4) {
      alert("새 비밀번호는 최소 4자 이상 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await changeMyPasswordApi({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      alert("비밀번호가 변경되었습니다.");

      resetPasswordForm();
      setShowPasswordModal(false);
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);

      let message = "비밀번호 변경에 실패했습니다.";

      try {
        const parsed = JSON.parse(error.message);
        message = parsed.message || message;
      } catch {
        if (error.message) {
          message = error.message;
        }
      }

      alert(message);
    }
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

  const getMBTIColor = (mbti = "") => {
    const type = mbti.slice(0, 2);

    const colors = {
      IS: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      IN: "bg-purple-100 text-purple-700 hover:bg-purple-100",
      ES: "bg-green-100 text-green-700 hover:bg-green-100",
      EN: "bg-orange-100 text-orange-700 hover:bg-orange-100",
    };

    return colors[type] || "bg-gray-100 text-gray-700 hover:bg-gray-100";
  };

  const displayUser = {
    ...currentUser,
    ...formData,
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className={textMutedClass}>사용자 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2
            className={cn(
              "text-2xl font-semibold mb-1 flex items-center gap-2",
              textMainClass
            )}
          >
            <User
              className={cn(
                "size-7",
                isDark ? "text-[#d8d8e3]" : "text-blue-600"
              )}
            />
            내 정보
          </h2>

          <p className={textSubClass}>
            개인 정보를 확인하고 수정할 수 있습니다
          </p>
        </div>

        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className={primaryButtonClass}
          >
            <Edit2 className="size-4 mr-2" />
            정보 수정
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className={primaryButtonClass} disabled={isSaving}>
              <Save className="size-4 mr-2" />
              저장
            </Button>

            <Button
              onClick={handleCancel}
              variant="outline"
              className={outlineButtonClass}
            >
              <X className="size-4 mr-2" />
              취소
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={cn("lg:col-span-1", cardClass)}>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div
                  className={cn(
                    "size-32 rounded-full flex items-center justify-center text-white text-4xl font-bold",
                    isDark
                      ? "bg-[#5c5c73]"
                      : "bg-gradient-to-br from-blue-600 to-blue-800"
                  )}
                >
                  {displayUser.name?.charAt(0)}
                </div>

                <Badge
                  className={`absolute bottom-2 right-2 ${getStatusColor(
                    currentUser.status
                  )}`}
                >
                  {currentUser.status}
                </Badge>
              </div>

              <h3 className={cn("text-xl font-semibold mb-1", textMainClass)}>
                {displayUser.name}
              </h3>

              <p className={cn("text-sm mb-3", textMutedClass)}>
                {displayUser.position}
              </p>

              <Badge className={getMBTIColor(displayUser.mbti)}>
                {displayUser.mbti || "MBTI 없음"}
              </Badge>
            </div>

            <div
              className={cn(
                "mt-6 pt-6 space-y-3 border-t",
                isDark ? "border-[#5c5c73]" : "border-gray-200"
              )}
            >
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="size-4 text-gray-400" />
                <span className={textSubClass}>{displayUser.department}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Award className="size-4 text-gray-400" />
                <span className={textSubClass}>{currentUser.role}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-gray-400" />
                <span className={textSubClass}>
                  입사일: {currentUser.hireDate}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className={cardClass}>
            <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>

                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className={inputClass}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg",
                        fieldClass
                      )}
                    >
                      <User className="size-4 text-gray-400" />
                      <span>{displayUser.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>

                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={inputClass}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg",
                        fieldClass
                      )}
                    >
                      <Mail className="size-4 text-gray-400" />
                      <span>{displayUser.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>

                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={inputClass}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg",
                        fieldClass
                      )}
                    >
                      <Phone className="size-4 text-gray-400" />
                      <span>{displayUser.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">직급</Label>

                  {isEditing ? (
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) =>
                        setFormData({ ...formData, position: e.target.value })
                      }
                      className={inputClass}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg",
                        fieldClass
                      )}
                    >
                      <Briefcase className="size-4 text-gray-400" />
                      <span>{displayUser.position}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">부서</Label>

                  {isEditing ? (
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          department: e.target.value,
                        })
                      }
                      className={inputClass}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg",
                        fieldClass
                      )}
                    >
                      <MapPin className="size-4 text-gray-400" />
                      <span>{displayUser.department}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mbti">MBTI</Label>

                  {isEditing ? (
                    <Input
                      id="mbti"
                      value={formData.mbti}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mbti: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="예: INTJ"
                      maxLength={4}
                      className={inputClass}
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg",
                        fieldClass
                      )}
                    >
                      <Award className="size-4 text-gray-400" />
                      <span>{displayUser.mbti || "MBTI 없음"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>비밀번호</Label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div
                      className={cn(
                        "flex-1 flex items-center gap-2 p-2 rounded-lg",
                        fieldClass
                      )}
                    >
                      <Lock className="size-4 text-gray-400" />
                      <span>*****</span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleChangePassword}
                      className={outlineButtonClass}
                    >
                      비밀번호 변경
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
              <CardTitle className="text-lg">근무 정보</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>입사일</Label>

                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      fieldClass
                    )}
                  >
                    <Calendar className="size-4 text-gray-400" />
                    <span>{currentUser.hireDate}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>권한</Label>

                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      fieldClass
                    )}
                  >
                    <Award className="size-4 text-gray-400" />
                    <span>{currentUser.role}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>현재 상태</Label>

                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      fieldClass
                    )}
                  >
                    <div className="size-2 rounded-full bg-green-500" />
                    <span>{currentUser.status}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>사원 번호</Label>

                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      fieldClass
                    )}
                  >
                    <User className="size-4 text-gray-400" />
                    <span>{currentUser.employeeNo || currentUser.employee_no || "-"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
              <CardTitle className="text-lg">통계</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-[#2f2f36]" : "bg-blue-50"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm mb-1",
                      isDark ? "text-zinc-300" : "text-blue-600"
                    )}
                  >
                    총 휴가 일수
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-white" : "text-blue-700"
                    )}
                  >
                    15일
                  </p>
                </div>

                <div
                  className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-[#2f2f36]" : "bg-green-50"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm mb-1",
                      isDark ? "text-zinc-300" : "text-green-600"
                    )}
                  >
                    사용 휴가
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-white" : "text-green-700"
                    )}
                  >
                    7일
                  </p>
                </div>

                <div
                  className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-[#2f2f36]" : "bg-purple-50"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm mb-1",
                      isDark ? "text-zinc-300" : "text-purple-600"
                    )}
                  >
                    잔여 휴가
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-white" : "text-purple-700"
                    )}
                  >
                    8일
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={showPasswordModal}
        onOpenChange={(open) => {
          setShowPasswordModal(open);

          if (!open) {
            resetPasswordForm();
          }
        }}
      >
        <DialogContent
          className={cn(
            "max-w-md",
            isDark ? "bg-[#35353d] border-[#5c5c73] text-white" : ""
          )}
        >
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">새 비밀번호</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="새 비밀번호를 입력하세요"
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호를 다시 입력하세요"
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetPasswordForm();
                  setShowPasswordModal(false);
                }}
                className={outlineButtonClass}
              >
                취소
              </Button>

              <Button
                type="button"
                onClick={handlePasswordSubmit}
                className={primaryButtonClass}
              >
                변경하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MyPage;

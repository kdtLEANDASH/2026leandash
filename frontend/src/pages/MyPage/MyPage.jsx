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
  RefreshCw,
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
import { useAppContext } from "@/store/AppProvider";
import { cn } from "@/components/UI/utils";
import {
  getMyProfileApi,
  updateMyProfileApi,
  changeMyPasswordApi,
} from "@/api/userApi";

function unwrapResponse(result) {
  return result?.data ?? result?.result ?? result;
}

function normalizeUser(user) {
  if (!user) return null;

  const department =
    user.departmentName ||
    user.department ||
    user.deptName ||
    user.department_name ||
    user.raw?.departmentName ||
    user.raw?.department ||
    "-";

  const status =
    user.status ??
    user.userStatus ??
    user.user_status ??
    user.currentStatus ??
    "업무 중";

  return {
    id: user.id ?? user.userId ?? user.user_id ?? "",
    userId: user.userId ?? user.user_id ?? user.id ?? "",
    employeeNo: user.employeeNo ?? user.employee_no ?? "",
    name: user.name ?? user.userName ?? user.user_name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
    position: user.position ?? "",
    department,
    role:
      user.role === "ADMIN"
        ? "최고관리자"
        : user.role === "MANAGER"
        ? "팀장"
        : user.role === "USER"
        ? "일반직원"
        : user.role ?? "",
    status,
    hireDate:
      user.hireDate ??
      user.hire_date ??
      user.createdAt?.slice?.(0, 10) ??
      user.created_at?.slice?.(0, 10) ??
      "-",
    mbti: user.mbti ?? "",
    birthDate: user.birthDate ?? user.birth_date ?? "",
    gender: user.gender ?? "",
    raw: user,
  };
}

function displayStatus(status) {
  const map = {
    ONLINE: "업무 중",
    OFFLINE: "오프라인",
    AWAY: "자리 비움",
    FOCUS: "집중 모드",
    VACATION: "휴가 중",
  };

  return map[status] || status || "업무 중";
}

export function MyPage() {
  const { currentUser, customSettings } = useAppContext();
  const isDark = customSettings?.darkMode;

  const [profile, setProfile] = useState(() => normalizeUser(currentUser));
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    mbti: "",
  });

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const fieldClass = isDark
    ? "bg-[#2f2f36] border border-[#5c5c73] text-zinc-100"
    : "bg-gray-50 text-gray-900";

  const pageClass = isDark
    ? "bg-[#27272a] text-white"
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

  const modalClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "";

  const applyProfileToForm = (user) => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      mbti: user?.mbti || "",
    });
  };

  const loadMyProfile = async () => {
    try {
      setIsLoading(true);

      const result = await getMyProfileApi();
      const data = unwrapResponse(result);
      const normalized = normalizeUser(data);

      setProfile(normalized);
      applyProfileToForm(normalized);
    } catch (error) {
      console.error("내 정보 조회 실패:", error);

      const fallback = normalizeUser(currentUser);
      setProfile(fallback);
      applyProfileToForm(fallback);

      alert("내 정보를 불러오지 못했습니다. 로그인 상태를 확인해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        userName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        mbti: formData.mbti.trim().toUpperCase(),
      };

      const result = await updateMyProfileApi(payload);
      const data = unwrapResponse(result);

      const updatedProfile =
        normalizeUser(data) || {
          ...profile,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          mbti: formData.mbti.trim().toUpperCase(),
        };

      setProfile(updatedProfile);
      applyProfileToForm(updatedProfile);
      setIsEditing(false);

      alert("내 정보가 수정되었습니다.");
    } catch (error) {
      console.error("내 정보 수정 실패:", error);
      alert("내 정보 수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    applyProfileToForm(profile);
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

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
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
    const shownStatus = displayStatus(status);

    if (isDark) {
      const darkColors = {
        "업무 중":
          "bg-green-500/20 text-green-300 border border-green-400/30 hover:bg-green-500/20",
        "자리 비움":
          "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30 hover:bg-yellow-500/20",
        "집중 모드":
          "bg-purple-500/20 text-purple-300 border border-purple-400/30 hover:bg-purple-500/20",
        "휴가 중":
          "bg-blue-500/20 text-blue-300 border border-blue-400/30 hover:bg-blue-500/20",
        오프라인:
          "bg-zinc-600 text-zinc-200 border border-zinc-500 hover:bg-zinc-600",
      };

      return darkColors[shownStatus] || darkColors["오프라인"];
    }

    const colors = {
      "업무 중": "bg-green-100 text-green-700 hover:bg-green-100",
      "자리 비움": "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
      "집중 모드": "bg-purple-100 text-purple-700 hover:bg-purple-100",
      "휴가 중": "bg-blue-100 text-blue-700 hover:bg-blue-100",
      오프라인: "bg-gray-100 text-gray-700 hover:bg-gray-100",
    };

    return colors[shownStatus] || colors["오프라인"];
  };

  const getMBTIColor = (mbti) => {
    if (!mbti) {
      return isDark
        ? "bg-zinc-600 text-zinc-200 border border-zinc-500"
        : "bg-gray-100 text-gray-700";
    }

    const type = mbti.slice(0, 2);

    if (isDark) {
      const darkColors = {
        IS: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
        IN: "bg-purple-500/20 text-purple-300 border border-purple-400/30",
        ES: "bg-green-500/20 text-green-300 border border-green-400/30",
        EN: "bg-orange-500/20 text-orange-300 border border-orange-400/30",
      };

      return (
        darkColors[type] ||
        "bg-zinc-600 text-zinc-200 border border-zinc-500"
      );
    }

    const colors = {
      IS: "bg-blue-100 text-blue-700",
      IN: "bg-purple-100 text-purple-700",
      ES: "bg-green-100 text-green-700",
      EN: "bg-orange-100 text-orange-700",
    };

    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const user = profile;

  if (isLoading && !user) {
    return (
      <div className={cn("flex items-center justify-center h-full", pageClass)}>
        <div className={cn("flex items-center gap-2", textMutedClass)}>
          <RefreshCw className="size-5 animate-spin" />
          <span>사용자 정보를 불러오는 중입니다.</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={cn("flex items-center justify-center h-full", pageClass)}>
        <p className={textMutedClass}>사용자 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const shownStatus = displayStatus(user.status);

  return (
    <div className={cn("p-6 max-w-5xl mx-auto min-h-full", pageClass)}>
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

          <p className={textSubClass}>개인 정보를 확인하고 수정할 수 있습니다</p>
        </div>

        {!isEditing ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className={outlineButtonClass}
              onClick={loadMyProfile}
              disabled={isLoading}
            >
              <RefreshCw
                className={cn("size-4 mr-2", isLoading && "animate-spin")}
              />
              새로고침
            </Button>

            <Button
              onClick={() => setIsEditing(true)}
              className={primaryButtonClass}
            >
              <Edit2 className="size-4 mr-2" />
              정보 수정
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className={primaryButtonClass}
              disabled={isSaving}
            >
              <Save className="size-4 mr-2" />
              {isSaving ? "저장 중..." : "저장"}
            </Button>

            <Button
              onClick={handleCancel}
              variant="outline"
              className={outlineButtonClass}
              disabled={isSaving}
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
                  {user.name?.charAt(0) || "?"}
                </div>

                <Badge
                  className={cn(
                    "absolute bottom-2 right-2",
                    getStatusColor(user.status)
                  )}
                >
                  {shownStatus}
                </Badge>
              </div>

              <h3 className={cn("text-xl font-semibold mb-1", textMainClass)}>
                {user.name || "-"}
              </h3>

              <p className={cn("text-sm mb-3", textMutedClass)}>
                {user.position || "-"}
              </p>

              <Badge className={getMBTIColor(user.mbti)}>
                {user.mbti || "MBTI 없음"}
              </Badge>
            </div>

            <div
              className={cn(
                "mt-6 pt-6 border-t space-y-3",
                isDark ? "border-[#5c5c73]" : "border-gray-200"
              )}
            >
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="size-4 text-gray-400" />
                <span className={textSubClass}>{user.department || "-"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Award className="size-4 text-gray-400" />
                <span className={textSubClass}>{user.role || "-"}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Calendar className="size-4 text-gray-400" />
                <span className={textSubClass}>
                  입사일: {user.hireDate || "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className={cn(cardClass)}>
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>

            <CardContent>
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
                      <span>{user.name || "-"}</span>
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
                      <span>{user.email || "-"}</span>
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
                      <span>{user.phone || "-"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">직급</Label>

                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      fieldClass
                    )}
                  >
                    <Briefcase className="size-4 text-gray-400" />
                    <span>{user.position || "-"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">부서</Label>

                  <div
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      fieldClass
                    )}
                  >
                    <MapPin className="size-4 text-gray-400" />
                    <span>{user.department || "-"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mbti">MBTI</Label>

                  {isEditing ? (
                    <Input
                      id="mbti"
                      value={formData.mbti}
                      maxLength={4}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mbti: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="예: ENFP"
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
                      <span>{user.mbti || "MBTI 없음"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">주소</Label>

                  {isEditing ? (
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
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
                      <span>{user.address || "-"}</span>
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

          <Card className={cn(cardClass)}>
            <CardHeader>
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
                    <span>{user.hireDate || "-"}</span>
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
                    <span>{user.role || "-"}</span>
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
                    <span>{shownStatus}</span>
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
                    <span>{user.employeeNo || "-"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(cardClass)}>
            <CardHeader>
              <CardTitle className="text-lg">통계</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-blue-500/15" : "bg-blue-50"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm mb-1",
                      isDark ? "text-blue-300" : "text-blue-600"
                    )}
                  >
                    총 휴가 일수
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-blue-200" : "text-blue-700"
                    )}
                  >
                    15일
                  </p>
                </div>

                <div
                  className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-green-500/15" : "bg-green-50"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm mb-1",
                      isDark ? "text-green-300" : "text-green-600"
                    )}
                  >
                    사용 휴가
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-green-200" : "text-green-700"
                    )}
                  >
                    7일
                  </p>
                </div>

                <div
                  className={cn(
                    "p-4 rounded-lg",
                    isDark ? "bg-purple-500/15" : "bg-purple-50"
                  )}
                >
                  <p
                    className={cn(
                      "text-sm mb-1",
                      isDark ? "text-purple-300" : "text-purple-600"
                    )}
                  >
                    잔여 휴가
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      isDark ? "text-purple-200" : "text-purple-700"
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
        <DialogContent className={cn("max-w-md", modalClass)}>
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">현재 비밀번호</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
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
                className={inputClass}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className={outlineButtonClass}
                onClick={() => {
                  resetPasswordForm();
                  setShowPasswordModal(false);
                }}
              >
                취소
              </Button>

              <Button
                type="button"
                className={primaryButtonClass}
                onClick={handlePasswordSubmit}
              >
                변경
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MyPage;
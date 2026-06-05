import { useOutletContext } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Textarea } from "@/components/UI/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { cn } from "@/components/UI/utils";

export default function VacationRequestPage() {
  const {
    isDark,
    formData,
    setFormData,
    handleDateChange,
    handleSubmit,
  } = useOutletContext();

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white placeholder:text-zinc-400"
    : "";

  const innerClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-gray-50 border-gray-300";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  return (
    <Card className={cardClass}>
      <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
        <CardTitle>휴가 신청서</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">휴가 유형 *</Label>

              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className={inputClass}>
                  <SelectValue placeholder="휴가 유형 선택" />
                </SelectTrigger>

                <SelectContent
                  className={
                    isDark
                      ? "bg-[#35353d] border-[#5c5c73] text-white"
                      : ""
                  }
                >
                  <SelectItem value="연차">연차</SelectItem>
                  <SelectItem value="반차">반차</SelectItem>
                  <SelectItem value="병가">병가</SelectItem>
                  <SelectItem value="경조사">경조사</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>신청 기간</Label>

              <div
                className={cn(
                  "h-10 flex items-center px-3 border rounded-md",
                  innerClass
                )}
              >
                <span
                  className={cn(
                    "text-lg font-semibold",
                    isDark ? "text-[#d8d8e3]" : "text-blue-600"
                  )}
                >
                  {formData.days > 0 ? `${formData.days}일` : "-"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">시작일 *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleDateChange("startDate", e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">종료일 *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleDateChange("endDate", e.target.value)}
                required
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">사유 *</Label>
            <Textarea
              id="reason"
              placeholder="휴가 사유를 입력하세요"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows={4}
              required
              className={inputClass}
            />
          </div>

          <div
            className={cn(
              "flex gap-3 pt-4",
              isDark ? "border-t border-[#5c5c73]" : ""
            )}
          >
            <Button type="submit" className={primaryButtonClass}>
              <Check className="size-4 mr-2" />
              신청하기
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormData({
                  type: "",
                  startDate: "",
                  endDate: "",
                  reason: "",
                  days: 0,
                })
              }
              className={outlineButtonClass}
            >
              <X className="size-4 mr-2" />
              초기화
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Sparkles,
  Wand2,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Label } from "@/components/UI/label";
import { Badge } from "@/components/UI/badge";
import { Calendar as CalendarComp } from "@/components/UI/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { cn } from "@/components/UI/utils";

export default function VacationRecommendPage() {
  const {
    isDark,
    calendarEvents = [],
    visibleApprovedVacations = [],
    recommendedVacations = [],
    recommendationTypeFilter,
    setRecommendationTypeFilter,
    recommendationDaysFilter,
    setRecommendationDaysFilter,
    recommendationPeriod,
    setRecommendationPeriod,
    recommendationSearchDays,
    previewRecommendation,
    previewDate,
    setPreviewDate,
    setPreviewRecommendation,
    holidayDates = [],
    formatDate,
    parseDate,
    handleApplyRecommendation,
  } = useOutletContext();

  const cardClass = isDark
    ? "bg-[#35353d] border-[#5c5c73] text-white"
    : "bg-white border-gray-200";

  const softCardClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-white border-blue-100";

  const innerClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "bg-gray-50 border-gray-200";

  const inputClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
    : "";

  const textMain = isDark ? "text-white" : "text-gray-900";
  const textSub = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";

  const primaryButtonClass = isDark
    ? "bg-[#5c5c73] hover:bg-[#6a6a82] text-white"
    : "bg-blue-600 hover:bg-blue-700";

  const outlineButtonClass = isDark
    ? "bg-[#2f2f36] border-[#5c5c73] text-white hover:bg-[#48484f]"
    : "";

  const selectedRingClass = isDark
    ? "ring-2 ring-[#8a8aa3]"
    : "ring-2 ring-blue-500";

  const toLocalDate = (dateStr) => {
    if (!dateStr) return new Date();

    const [year, month, day] = dateStr.split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  const personalDates = useMemo(() => {
    return calendarEvents
      .filter((event) => event.type === "개인")
      .map((event) => toLocalDate(event.date));
  }, [calendarEvents]);

  const teamDates = useMemo(() => {
    return calendarEvents
      .filter((event) => event.type === "팀")
      .map((event) => toLocalDate(event.date));
  }, [calendarEvents]);

  const companyDates = useMemo(() => {
    return calendarEvents
      .filter((event) => event.type === "전사")
      .map((event) => toLocalDate(event.date));
  }, [calendarEvents]);

  const vacationDates = useMemo(() => {
    return visibleApprovedVacations
      .map((vacation) => vacation.startDate)
      .filter(Boolean)
      .map((dateStr) => toLocalDate(dateStr));
  }, [visibleApprovedVacations]);

  const recommendedDates = useMemo(() => {
    if (!previewRecommendation) return [];

    const result = [];
    const cur = parseDate(previewRecommendation.startDate);
    const end = parseDate(previewRecommendation.endDate);

    while (cur <= end) {
      result.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }

    return result;
  }, [previewRecommendation, parseDate]);

  const previewDateData = (() => {
    if (!previewDate) return { events: [], vacations: [] };

    const dateStr = formatDate(previewDate);

    return {
      events: calendarEvents.filter((event) => event.date === dateStr),
      vacations: visibleApprovedVacations.filter(
        (vacation) => vacation.startDate <= dateStr && vacation.endDate >= dateStr
      ),
    };
  })();

  const handlePreviewRecommendation = (recommendation) => {
    setPreviewRecommendation(recommendation);
    setPreviewDate(parseDate(recommendation.startDate));
  };

  return (
    <div className="space-y-6">
      <Card
        className={
          isDark
            ? "bg-[#35353d] border-[#5c5c73] text-white"
            : "border-blue-100 bg-blue-50/40"
        }
      >
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textMain)}>
            <Sparkles
              className={cn(
                "size-5",
                isDark ? "text-[#d8d8e3]" : "text-blue-600"
              )}
            />
            휴가 추천 기준
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className={cn("mb-2 text-sm", textSub)}>
            오늘부터 {recommendationSearchDays}일 이내의 회사 일정, 평일
            공휴일, 주말, 같은 부서 휴가 현황을 기준으로 연차 사용에 적합한
            날짜를 추천합니다.
          </p>

          <p className={cn("mb-4 text-xs", textMuted)}>
            ※ 본 추천 기능은 연차 기준으로 동작하며, 반차는 추천 대상에
            포함되지 않습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              [
                "공휴일 징검다리",
                "주말 공휴일은 제외하고, 평일 공휴일 앞뒤 1~2일을 기준으로 추천합니다.",
              ],
              [
                "주말 연장 휴가",
                "공휴일 징검다리가 아닌 월요일 또는 금요일 휴가를 추천합니다.",
              ],
              [
                "팀 휴가 현황",
                "같은 부서 휴가자가 적은 날짜를 우선 추천합니다.",
              ],
              [
                "캘린더 미리보기",
                "추천 카드를 선택하면 해당 추천 날짜를 하늘색으로 표시합니다.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className={cn("rounded-lg border p-4", softCardClass)}
              >
                <div className={cn("text-sm font-semibold mb-1", textMain)}>
                  {title}
                </div>

                <div className={cn("text-xs", textSub)}>{description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={cardClass}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className={cn("text-xs", textMuted)}>추천 유형</Label>

              <Select
                value={recommendationTypeFilter}
                onValueChange={setRecommendationTypeFilter}
              >
                <SelectTrigger className={cn("mt-1", inputClass)}>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent
                  className={
                    isDark
                      ? "bg-[#35353d] border-[#5c5c73] text-white"
                      : ""
                  }
                >
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="공휴일 징검다리">
                    공휴일 징검다리
                  </SelectItem>
                  <SelectItem value="주말 연장">주말 연장</SelectItem>
                  <SelectItem value="승인 가능성">승인 가능성</SelectItem>
                  <SelectItem value="잔여 연차 활용">잔여 연차 활용</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={cn("text-xs", textMuted)}>사용 일수</Label>

              <Select
                value={recommendationDaysFilter}
                onValueChange={setRecommendationDaysFilter}
              >
                <SelectTrigger className={cn("mt-1", inputClass)}>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent
                  className={
                    isDark
                      ? "bg-[#35353d] border-[#5c5c73] text-white"
                      : ""
                  }
                >
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="1">1일</SelectItem>
                  <SelectItem value="2">2일 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className={cn("text-xs", textMuted)}>추천 기간</Label>

              <Select
                value={recommendationPeriod}
                onValueChange={setRecommendationPeriod}
              >
                <SelectTrigger className={cn("mt-1", inputClass)}>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent
                  className={
                    isDark
                      ? "bg-[#35353d] border-[#5c5c73] text-white"
                      : ""
                  }
                >
                  <SelectItem value="30">30일</SelectItem>
                  <SelectItem value="60">60일</SelectItem>
                  <SelectItem value="90">90일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className={cn("w-full", outlineButtonClass)}
                onClick={() => {
                  setRecommendationTypeFilter("전체");
                  setRecommendationDaysFilter("전체");
                  setRecommendationPeriod("90");
                }}
              >
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendedVacations.length === 0 ? (
            <Card className={cn("lg:col-span-2", cardClass)}>
              <CardContent className={cn("py-12 text-center", textMuted)}>
                <Sparkles
                  className={cn(
                    "size-12 mx-auto mb-3",
                    isDark ? "text-zinc-600" : "text-gray-400"
                  )}
                />
                추천 가능한 휴가 일정이 없습니다.
                <p className={cn("mt-2 text-xs", textMuted)}>
                  필터 조건을 변경하거나 추천 기간을 늘려보세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            recommendedVacations.map((recommendation, index) => (
              <Card
                key={recommendation.id}
                className={cn(
                  "transition-shadow cursor-pointer",
                  isDark
                    ? "bg-[#35353d] border-[#5c5c73] text-white hover:bg-[#3f3f48]"
                    : "bg-white hover:shadow-md",
                  previewRecommendation?.id === recommendation.id &&
                    selectedRingClass
                )}
                onClick={() => handlePreviewRecommendation(recommendation)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle
                      className={cn("text-base flex items-center gap-2", textMain)}
                    >
                      <Wand2
                        className={cn(
                          "size-4",
                          isDark ? "text-[#d8d8e3]" : "text-blue-600"
                        )}
                      />
                      추천 {index + 1}
                    </CardTitle>

                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {recommendation.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className={cn("text-lg font-bold", textMain)}>
                      {recommendation.title}
                    </div>

                    <div className={cn("text-sm mt-1", textSub)}>
                      {recommendation.description}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.reasons?.map((reason) => (
                      <Badge
                        key={reason}
                        className={
                          isDark
                            ? "bg-[#2f2f36] text-zinc-200 hover:bg-[#2f2f36] border border-[#5c5c73]"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                        }
                      >
                        {reason}
                      </Badge>
                    ))}
                  </div>

                  <div className={cn("rounded-lg border p-3 space-y-2", innerClass)}>
                    <div className="flex justify-between text-sm">
                      <span className={textMuted}>신청일</span>
                      <span className={cn("font-medium", textMain)}>
                        {recommendation.startDate}
                        {recommendation.startDate !== recommendation.endDate &&
                          ` ~ ${recommendation.endDate}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className={textMuted}>실제 연휴</span>
                      <span className={cn("font-medium", textMain)}>
                        {recommendation.restStartDate}
                        {recommendation.restStartDate !==
                          recommendation.restEndDate &&
                          ` ~ ${recommendation.restEndDate}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className={textMuted}>사용 일수</span>
                      <span className={cn("font-medium", textMain)}>
                        {recommendation.days}일
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className={textMuted}>총 휴식</span>
                      <span
                        className={cn(
                          "font-medium",
                          isDark ? "text-[#d8d8e3]" : "text-blue-700"
                        )}
                      >
                        {recommendation.totalRestDays}일
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className={textMuted}>팀 휴가자</span>
                      <span className={cn("font-medium", textMain)}>
                        {recommendation.teamVacationCount}명
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className={outlineButtonClass}
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePreviewRecommendation(recommendation);
                      }}
                    >
                      <Eye className="size-4 mr-1" />
                      미리보기
                    </Button>

                    <Button
                      type="button"
                      className={primaryButtonClass}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleApplyRecommendation(recommendation);
                      }}
                    >
                      신청하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Card className={cn("h-fit", cardClass)}>
          <CardHeader className={isDark ? "border-b border-[#5c5c73]" : ""}>
            <CardTitle className={cn("flex items-center gap-2 text-base", textMain)}>
              <CalendarIcon className="size-5" />
              추천일 미리보기
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <CalendarComp
                mode="single"
                selected={previewDate}
                onSelect={(date) => date && setPreviewDate(date)}
                className={cn(
                  "rounded-md border text-base",
                  isDark
                    ? "bg-[#2f2f36] border-[#5c5c73] text-white"
                    : ""
                )}
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-lg font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                    "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100",
                    isDark ? "hover:bg-[#48484f]" : ""
                  ),
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: cn(
                    "rounded-md w-10 font-normal text-sm",
                    isDark ? "text-zinc-300" : "text-gray-500"
                  ),
                  row: "flex w-full mt-2",
                  cell: "h-10 w-10 text-center text-sm p-0 relative",
                  day: cn(
                    "h-10 w-10 p-0 font-normal rounded-md",
                    isDark ? "hover:bg-[#48484f]" : ""
                  ),
                }}
                personalDates={personalDates}
                teamDates={teamDates}
                companyDates={companyDates}
                vacationDates={vacationDates}
                holidayDates={holidayDates}
                recommendedDates={recommendedDates}
              />
            </div>

            <div className={cn("rounded-lg border p-3", innerClass)}>
              <div className={cn("text-sm font-semibold mb-2", textMain)}>
                선택한 날짜
              </div>

              <div className={cn("text-sm", textSub)}>
                {previewDate ? formatDate(previewDate) : "날짜를 선택하세요"}
              </div>
            </div>

            <div className="space-y-2">
              <div className={cn("text-sm font-semibold", textMain)}>
                해당 날짜 일정
              </div>

              {previewDateData.events.length === 0 &&
              previewDateData.vacations.length === 0 ? (
                <div className={cn("text-sm py-4 text-center", textMuted)}>
                  일정이 없습니다.
                </div>
              ) : (
                <>
                  {previewDateData.events.map((event) => (
                    <div
                      key={event.id}
                      className={cn("rounded-lg border p-3 text-sm", innerClass)}
                    >
                      <div className={cn("font-medium", textMain)}>
                        {event.title}
                      </div>

                      <div className={cn("text-xs mt-1", textMuted)}>
                        {event.type}
                        {event.startTime && event.endTime
                          ? ` · ${event.startTime} - ${event.endTime}`
                          : ""}
                      </div>
                    </div>
                  ))}

                  {previewDateData.vacations.map((vacation) => (
                    <div
                      key={vacation.id}
                      className={cn(
                        "rounded-lg border p-3 text-sm",
                        isDark
                          ? "bg-[#2f2f36] border-orange-400/50"
                          : "bg-orange-50 border-orange-200"
                      )}
                    >
                      <div
                        className={cn(
                          "font-medium",
                          isDark ? "text-orange-300" : "text-orange-800"
                        )}
                      >
                        {vacation.employeeName} · {vacation.type}
                      </div>

                      <div
                        className={cn(
                          "text-xs mt-1",
                          isDark ? "text-orange-200" : "text-orange-700"
                        )}
                      >
                        {vacation.startDate} ~ {vacation.endDate}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
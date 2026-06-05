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
    isHrAdmin,
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

  if (isHrAdmin) {
    return (
      <div className="text-sm text-gray-500">
        인사팀은 휴가 추천 기능을 사용할 수 없습니다.
      </div>
    );
  }

  const previewDateData = (() => {
    if (!previewDate) return { events: [], vacations: [] };

    const dateStr = formatDate(previewDate);

    return {
      events: calendarEvents.filter((event) => event.date === dateStr),
      vacations: visibleApprovedVacations.filter(
        (v) => v.startDate <= dateStr && v.endDate >= dateStr
      ),
    };
  })();

  const handlePreviewRecommendation = (recommendation) => {
    setPreviewRecommendation(recommendation);
    setPreviewDate(parseDate(recommendation.startDate));
  };

  return (
    <div className="space-y-6">
      <Card className="border-blue-100 bg-blue-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-blue-600" />
            휴가 추천 기준
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="mb-2 text-sm text-gray-600">
            오늘부터 {recommendationSearchDays}일 이내의 회사 일정, 평일
            공휴일, 주말, 같은 부서 휴가 현황을 기준으로 연차 사용에 적합한
            날짜를 추천합니다.
          </p>

          <p className="mb-4 text-xs text-gray-400">
            ※ 본 추천 기능은 연차 기준으로 동작하며, 반차는 추천 대상에
            포함되지 않습니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              ["공휴일 징검다리", "주말 공휴일은 제외하고, 평일 공휴일 앞뒤 1~2일을 기준으로 추천합니다."],
              ["주말 연장 휴가", "공휴일 징검다리가 아닌 월요일 또는 금요일 휴가를 추천합니다."],
              ["팀 휴가 현황", "같은 부서 휴가자가 적은 날짜를 우선 추천합니다."],
              ["캘린더 미리보기", "추천 카드를 선택하면 해당 추천 날짜를 하늘색으로 표시합니다."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-lg bg-white border border-blue-100 p-4">
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {title}
                </div>
                <div className="text-xs text-gray-600">{desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-gray-500">추천 유형</Label>
              <Select
                value={recommendationTypeFilter}
                onValueChange={setRecommendationTypeFilter}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="공휴일 징검다리">공휴일 징검다리</SelectItem>
                  <SelectItem value="주말 연장">주말 연장</SelectItem>
                  <SelectItem value="승인 가능성">승인 가능성</SelectItem>
                  <SelectItem value="잔여 연차 활용">잔여 연차 활용</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500">사용 일수</Label>
              <Select
                value={recommendationDaysFilter}
                onValueChange={setRecommendationDaysFilter}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  <SelectItem value="1">1일</SelectItem>
                  <SelectItem value="2">2일 이상</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-gray-500">추천 기간</Label>
              <Select
                value={recommendationPeriod}
                onValueChange={setRecommendationPeriod}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30일</SelectItem>
                  <SelectItem value="60">60일</SelectItem>
                  <SelectItem value="90">90일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
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
            <Card className="lg:col-span-2">
              <CardContent className="py-12 text-center text-gray-500">
                <Sparkles className="size-12 mx-auto mb-3 text-gray-400" />
                추천 가능한 휴가 일정이 없습니다.
                <p className="mt-2 text-xs text-gray-400">
                  필터 조건을 변경하거나 추천 기간을 늘려보세요.
                </p>
              </CardContent>
            </Card>
          ) : (
            recommendedVacations.map((recommendation, index) => (
              <Card
                key={recommendation.id}
                className={cn(
                  "hover:shadow-md transition-shadow cursor-pointer",
                  previewRecommendation?.id === recommendation.id &&
                    "ring-2 ring-blue-500"
                )}
                onClick={() => handlePreviewRecommendation(recommendation)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Wand2 className="size-4 text-blue-600" />
                      추천 {index + 1}
                    </CardTitle>

                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                      {recommendation.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {recommendation.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {recommendation.description}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {recommendation.reasons?.map((reason) => (
                      <Badge
                        key={reason}
                        className="bg-slate-100 text-slate-700 hover:bg-slate-100"
                      >
                        {reason}
                      </Badge>
                    ))}
                  </div>

                  <div className="rounded-lg bg-gray-50 border p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">신청일</span>
                      <span className="font-medium text-gray-900">
                        {recommendation.startDate}
                        {recommendation.startDate !== recommendation.endDate &&
                          ` ~ ${recommendation.endDate}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">실제 연휴</span>
                      <span className="font-medium text-gray-900">
                        {recommendation.restStartDate}
                        {recommendation.restStartDate !==
                          recommendation.restEndDate &&
                          ` ~ ${recommendation.restEndDate}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">사용 일수</span>
                      <span className="font-medium text-gray-900">
                        {recommendation.days}일
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">총 휴식</span>
                      <span className="font-medium text-blue-700">
                        {recommendation.totalRestDays}일
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">팀 휴가자</span>
                      <span className="font-medium text-gray-900">
                        {recommendation.teamVacationCount}명
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewRecommendation(recommendation);
                      }}
                    >
                      <Eye className="size-4 mr-1" />
                      미리보기
                    </Button>

                    <Button
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={(e) => {
                        e.stopPropagation();
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

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarIcon className="size-5" />
              추천일 미리보기
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <CalendarComp
                mode="single"
                selected={undefined}
                onSelect={(date) => date && setPreviewDate(date)}
                className="rounded-md border text-base"
                personalDates={personalDates}
                teamDates={teamDates}
                companyDates={companyDates}
                vacationDates={vacationDates}
                holidayDates={holidayDates}
                recommendedDates={recommendedDates}
              />
            </div>

            {previewRecommendation ? (
              <div className="rounded-lg border bg-blue-50 p-3">
                <div className="text-sm font-semibold text-blue-900">
                  {previewRecommendation.title}
                </div>
                <div className="mt-1 text-xs text-blue-700">
                  {previewRecommendation.startDate}
                  {previewRecommendation.startDate !==
                    previewRecommendation.endDate &&
                    ` ~ ${previewRecommendation.endDate}`}
                </div>
                <div className="mt-2 text-xs text-blue-700">
                  예상 총 휴식 {previewRecommendation.totalRestDays}일 · 사용{" "}
                  {previewRecommendation.days}일
                </div>
              </div>
            ) : (
              <div className="rounded-lg border bg-gray-50 p-3 text-sm text-gray-500">
                추천 카드를 선택하면 미리보기가 표시됩니다.
              </div>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-900">
                선택 날짜 일정
              </h3>

              {previewDateData.events.map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-white border rounded-lg text-sm"
                >
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{event.type}</div>
                </div>
              ))}

              {previewDateData.vacations.map((vacation) => (
                <div
                  key={vacation.id}
                  className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm"
                >
                  {vacation.employeeName} · {vacation.type}
                </div>
              ))}

              {previewDateData.events.length === 0 &&
                previewDateData.vacations.length === 0 && (
                  <div className="text-sm text-gray-500 py-6 text-center">
                    선택한 날짜에 일정이 없습니다.
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
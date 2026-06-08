import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import hero from "../../assets/hero.png";
import { CalendarDays, FileText, Clock } from "lucide-react";
import { Calendar as CalendarComp } from "@/components/UI/calendar";

export default function MainPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const formatDate = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
      return value.includes("T") ? value.split("T")[0] : value.slice(0, 10);
    }

    return "";
  };

  const formatTime = (value) => {
    if (!value || typeof value !== "string") return "";
    if (!value.includes("T")) return "";
    return value.split("T")[1]?.slice(0, 5) || "";
  };

  const formatLocalDate = (date) => {
    if (!date) return "";

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  };

  const toLocalDate = (dateStr) => {
    if (!dateStr) return new Date();

    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const typeLabelMap = {
    PERSONAL: "개인",
    TEAM: "팀",
    COMPANY: "전사",
    HOLIDAY: "공휴일",
    VACATION: "휴가",
  };

  const normalizeEvent = (schedule) => {
    const start = schedule.startDatetime || schedule.startDateTime;
    const end = schedule.endDatetime || schedule.endDateTime;

    return {
      id: schedule.scheduleId || schedule.id,
      title: schedule.title || "일정",
      description: schedule.content || schedule.description || "",
      date: formatDate(start),
      endDate: formatDate(end),
      startTime: formatTime(start),
      endTime: formatTime(end),
      type: schedule.isHoliday
        ? "공휴일"
        : typeLabelMap[schedule.scheduleType] || schedule.type || "전사",
      raw: schedule,
    };
  };

  useEffect(() => {
    const loadPublicSchedules = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${API_BASE_URL}/api/public/schedules`);

        setEvents(
          Array.isArray(response.data)
            ? response.data.map(normalizeEvent)
            : []
        );
      } catch (error) {
        console.error("메인 공개 일정 조회 실패:", error.response?.data || error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadPublicSchedules();
  }, [API_BASE_URL]);

  const todayText = useMemo(() => {
    return formatLocalDate(new Date());
  }, []);

  const publicEvents = useMemo(() => {
    return events
      .filter((event) => event.type === "전사" || event.type === "공휴일")
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const companyDates = useMemo(() => {
    return publicEvents
      .filter((event) => event.type === "전사")
      .map((event) => toLocalDate(event.date));
  }, [publicEvents]);

  const holidayDates = useMemo(() => {
    return publicEvents
      .filter((event) => event.type === "공휴일")
      .map((event) => toLocalDate(event.date));
  }, [publicEvents]);

  const selectedDateText = useMemo(() => {
    return formatLocalDate(selectedDate);
  }, [selectedDate]);

  const selectedDateEvents = useMemo(() => {
    return publicEvents.filter((event) => event.date === selectedDateText);
  }, [publicEvents, selectedDateText]);

  const todayEvents = useMemo(() => {
    return publicEvents.filter((event) => event.date === todayText);
  }, [publicEvents, todayText]);

  const upcomingEvents = useMemo(() => {
    return publicEvents
      .filter((event) => event.date >= todayText)
      .slice(0, 3);
  }, [publicEvents, todayText]);

  const getEventBadgeClass = (type) => {
    if (type === "공휴일") {
      return "bg-red-100 text-red-700";
    }

    return "bg-green-100 text-green-700";
  };

  const getEventCardClass = (type) => {
    if (type === "공휴일") {
      return "border-red-100 bg-red-50";
    }

    return "border-green-100 bg-green-50";
  };

  return (
    <div className="min-h-full bg-gray-50">
      <section className="relative w-full">
        <div className="relative h-[430px] w-full overflow-hidden">
          <img
            src={hero}
            alt="메인 이미지"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-[1500px] px-8">
              <div className="max-w-[720px] text-white">
                <p className="mb-4 text-lg font-semibold text-blue-100">
                  LeanDash HR Platform
                </p>

                <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
                  복잡한 인사 업무,
                  <br />
                  LeanDash로 한 번에
                </h1>

                <p className="mt-6 text-xl leading-relaxed text-gray-100">
                  흩어진 데이터를 하나로 모으고, 반복되는 업무는 더 간단하게.
                  <br />
                  직원 관리부터 휴가, 공지, 일정까지 한 곳에서 관리하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-8 pb-12 pt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
          <section className="flex min-h-[420px] flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="size-6 text-gray-900" />
                <h2 className="text-2xl font-bold text-gray-900">캘린더</h2>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-green-500" />
                  전사
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-red-500" />
                  공휴일
                </span>
              </div>
            </div>

            <div className="mt-6 grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
              <div className="flex justify-center">
                <CalendarComp
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) setSelectedDate(date);
                  }}
                  className="rounded-md border text-base"
                  companyDates={companyDates}
                  holidayDates={holidayDates}
                />
              </div>

              <div className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50 p-5">
                <div className="mb-4">
                  <div className="text-sm text-gray-500">선택한 날짜</div>
                  <div className="mt-1 text-xl font-bold text-gray-900">
                    {selectedDateText}
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-1 items-center justify-center text-gray-500">
                    일정을 불러오는 중입니다.
                  </div>
                ) : selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`rounded-2xl border px-4 py-3 ${getEventCardClass(
                          event.type
                        )}`}
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="font-semibold text-gray-900">
                            {event.title}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getEventBadgeClass(
                              event.type
                            )}`}
                          >
                            {event.type}
                          </span>
                        </div>

                        <div className="text-sm text-gray-500">
                          {event.startTime && event.endTime
                            ? `${event.startTime} - ${event.endTime}`
                            : event.date}
                        </div>

                        {event.description && (
                          <div className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {event.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-center text-gray-500">
                    선택한 날짜에 공개 일정이 없습니다.
                  </div>
                )}

                {upcomingEvents.length > 0 && (
                  <div className="mt-5 border-t border-gray-200 pt-4">
                    <div className="mb-2 text-sm font-semibold text-gray-800">
                      다가오는 주요 일정
                    </div>

                    <div className="space-y-2">
                      {upcomingEvents.map((event) => (
                        <button
                          key={`upcoming-${event.id}`}
                          type="button"
                          onClick={() => setSelectedDate(toLocalDate(event.date))}
                          className="flex w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-left text-sm hover:bg-gray-100"
                        >
                          <span className="truncate font-medium text-gray-800">
                            {event.title}
                          </span>
                          <span className="shrink-0 text-gray-500">
                            {event.date}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="flex min-h-[420px] flex-col gap-6">
            <div className="flex flex-1 flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="size-6 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900">사내 공지</h2>
                </div>

                <button className="text-base font-medium text-gray-700 hover:text-blue-600">
                  더보기
                </button>
              </div>

              <div className="flex flex-1 items-center justify-center text-lg text-gray-500">
                로그인 후 공지사항을 확인할 수 있습니다.
              </div>
            </div>

            <div className="flex flex-1 flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="size-6 text-gray-900" />
                  <h2 className="text-2xl font-bold text-gray-900">금일 일정</h2>
                </div>
              </div>

              <div className="mt-6 flex flex-1 flex-col gap-3">
                {todayEvents.length > 0 ? (
                  todayEvents.map((event) => (
                    <div
                      key={`today-${event.id}`}
                      className={`rounded-2xl border px-5 py-4 ${getEventCardClass(
                        event.type
                      )}`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="font-semibold text-gray-900">
                          {event.title}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getEventBadgeClass(
                            event.type
                          )}`}
                        >
                          {event.type}
                        </span>
                      </div>

                      <div className="text-sm text-gray-500">
                        {event.startTime && event.endTime
                          ? `${event.startTime} - ${event.endTime}`
                          : event.date}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-1 items-center justify-center text-lg text-gray-500">
                    오늘 등록된 공개 일정이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
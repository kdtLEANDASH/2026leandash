import hero from "../../assets/hero.png";
import { CalendarDays, FileText, Clock } from "lucide-react";

export default function MainPage() {
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
          <section className="flex min-h-[320px] flex-col rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CalendarDays className="size-6 text-gray-900" />
                <h2 className="text-2xl font-bold text-gray-900">캘린더</h2>
              </div>

              <button className="text-base font-medium text-gray-700 hover:text-blue-600">
                전체보기
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="text-xl font-semibold text-gray-900">
                사내 주요 일정
              </p>
              <p className="mt-3 text-base text-gray-500">
                비로그인 시 사내 일정만 간략 표시됩니다.
              </p>
            </div>
          </section>

          <section className="flex min-h-[320px] flex-col gap-6">
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

                <button className="text-base font-medium text-gray-700 hover:text-blue-600">
                  더보기
                </button>
              </div>

              <div className="flex flex-1 items-center justify-center text-lg text-gray-500">
                로그인 후 오늘 일정을 확인할 수 있습니다.
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
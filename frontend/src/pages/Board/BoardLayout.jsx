import { Outlet, Link, useLocation } from "react-router-dom";
import { Bell, Heart, HelpCircle } from "lucide-react";
import { cn } from "@/components/UI/utils";
import { useAppContext } from "@/store/AppProvider";

export function BoardLayout() {
  const location = useLocation();
  const { currentUser } = useAppContext();

  const canManageInquiry =
    currentUser?.role === "최고관리자" || currentUser?.role === "팀장";

  const isInquiryPage = location.pathname.startsWith("/inquiry");

  // 일반직원이 문의 페이지에 들어온 경우에는 사이드바 없이 문의 페이지만 보여줌
  if (isInquiryPage && !canManageInquiry) {
    return <Outlet />;
  }

  return (
    <div className="flex h-full bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 space-y-2">
          <Link
            to="/notice"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname.startsWith("/notice")
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Bell className="size-5" />
            <span>공지사항</span>
          </Link>

          <Link
            to="/inquiry"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname.startsWith("/inquiry")
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <HelpCircle className="size-5" />
            <span>{canManageInquiry ? "문의 관리" : "문의"}</span>
          </Link>

          <Link
            to="/heart-letter"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
              location.pathname.startsWith("/heart-letter")
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            <Heart className="size-5" />
            <span>마음의 편지</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
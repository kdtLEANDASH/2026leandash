import { Outlet, Link, useLocation } from "react-router-dom";
import { Bell, Heart, HelpCircle } from "lucide-react";
import { cn } from "@/components/UI/utils";
import { useAppContext } from "@/store/AppProvider";

export function BoardLayout() {
  const location = useLocation();
  const { currentUser, customSettings } = useAppContext();

  const isDark = customSettings?.darkMode;

  const canManageInquiry =
    currentUser?.role === "최고관리자" ||
    currentUser?.role === "팀장" ||
    currentUser?.department === "인사팀";

  const pageClass = isDark
    ? "flex h-full bg-[#27272a] text-white"
    : "flex h-full bg-gray-50 text-gray-900";

  const asideClass = isDark
    ? "w-64 bg-[#35353d] border-r border-[#5c5c73] flex flex-col"
    : "w-64 bg-white border-r border-gray-200 flex flex-col";

  const linkClass = (active) =>
    cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
      active
        ? isDark
          ? "bg-[#5c5c73] text-white font-medium"
          : "bg-blue-50 text-blue-600 font-medium"
        : isDark
        ? "text-zinc-300 hover:bg-[#48484f] hover:text-white"
        : "text-gray-700 hover:bg-gray-100"
    );

  return (
    <div className={pageClass}>
      <aside className={asideClass}>
        <div className="p-6 space-y-2">
          <Link
            to="/notice"
            className={linkClass(location.pathname.startsWith("/notice"))}
          >
            <Bell className="size-5" />
            <span>공지사항</span>
          </Link>

          <Link
            to="/inquiry"
            className={linkClass(location.pathname.startsWith("/inquiry"))}
          >
            <HelpCircle className="size-5" />
            <span>{canManageInquiry ? "문의 관리" : "문의"}</span>
          </Link>

          <Link
            to="/heart-letter"
            className={linkClass(location.pathname.startsWith("/heart-letter"))}
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

export default BoardLayout;
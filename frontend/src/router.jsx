import { createBrowserRouter, Navigate } from "react-router-dom";

import { MainLayout } from "@/components/Layout/MainLayout";
import MainPage from "@/pages/MainPage/MainPage";

import { DashboardPage } from "@/pages/Dashboard/DashboardPage";
import { EmployeesPage } from "@/pages/Employees/EmployeesPage";

import VacationLayout from "@/pages/Vacation/VacationLayout";
import VacationInfoPage from "@/pages/Vacation/VacationInfoPage";
import VacationRecommendPage from "@/pages/Vacation/VacationRecommendPage";
import VacationRequestPage from "@/pages/Vacation/VacationRequestPage";
import VacationListPage from "@/pages/Vacation/VacationListPage";
import VacationStatusPage from "@/pages/Vacation/VacationStatusPage";

import { CalendarPage } from "@/pages/Calendar/CalendarPage";
import { ChatPage } from "@/pages/Board/ChatPage";
import { EvaluationPage } from "@/pages/Evaluation/EvaluationPage";
import { ApprovalPage } from "@/pages/Approval/ApprovalPage";
import { RegistrationApprovalPage } from "@/pages/Registration/RegistrationApprovalPage";
import { SearchPage } from "@/pages/Search/SearchPage";
import { ApprovalRequestPage } from "@/pages/Approval/ApprovalRequestPage";
import { MyPage } from "@/pages/MyPage/MyPage";

import BoardLayout from "@/pages/Board/BoardLayout";
import { NoticePage } from "@/pages/Board/NoticePage";
import { InquiryPage } from "@/pages/Board/InquiryPage";
import { HeartLetterPage } from "@/pages/SecretLetter/SecretLetterPage";

import { CommunityPage } from "@/pages/Community/CommunityPage";
import { CommunityWritePage } from "@/pages/Community/CommunityWritePage";
import { CommunityDetailPage } from "@/pages/Community/CommunityDetailPage";

import { DocumentsPage } from "@/pages/Documents/DocumentsPage";

import { LoginPage } from "@/pages/Auth/LoginPage";
import { RegisterPage } from "@/pages/Auth/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: MainPage },

      { path: "dashboard", Component: DashboardPage },
      { path: "employees", Component: EmployeesPage },

      {
        path: "",
        Component: BoardLayout,
        children: [
          { path: "notice", Component: NoticePage },
          { path: "notice/:noticeId", Component: NoticePage },
          { path: "inquiry", Component: InquiryPage },
          { path: "heart-letter", Component: HeartLetterPage },
        ],
      },

      {
        path: "vacation",
        Component: VacationLayout,
        children: [
          { index: true, element: <Navigate to="info" replace /> },
          { path: "info", Component: VacationInfoPage },
          { path: "recommend", Component: VacationRecommendPage },
          { path: "request", Component: VacationRequestPage },
          { path: "list", Component: VacationListPage },
          { path: "status", Component: VacationStatusPage },
        ],
      },

      { path: "calendar", Component: CalendarPage },
      { path: "chat", Component: ChatPage },

      { path: "approval-request", Component: ApprovalRequestPage },
      { path: "evaluation", Component: EvaluationPage },
      { path: "approval", Component: ApprovalPage },

      { path: "community", Component: CommunityPage },
      { path: "community/write", Component: CommunityWritePage },
      { path: "community/:postId", Component: CommunityDetailPage },

      { path: "registration-approval", Component: RegistrationApprovalPage },
      { path: "search", Component: SearchPage },
      { path: "mypage", Component: MyPage },
      { path: "documents", Component: DocumentsPage },
    ],
  },

  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
]);
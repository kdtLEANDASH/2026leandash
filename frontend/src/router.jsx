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
import { HeartLetterPage } from "@/pages/SecretLetter/SecretLetterPage";
import { ApprovalPage } from "@/pages/Approval/ApprovalPage";
import { NoticePage } from "@/pages/Board/NoticePage";
import { RegistrationApprovalPage } from "@/pages/Registration/RegistrationApprovalPage";
import { SearchPage } from "@/pages/Search/SearchPage";
import { InquiryPage } from "@/pages/Board/InquiryPage";
import { ApprovalRequestPage } from "@/pages/Approval/ApprovalRequestPage";
import { MyPage } from "@/pages/MyPage/MyPage";
import { CommunityPage } from "@/pages/Community/CommunityPage";
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
      { path: "notice", Component: NoticePage },
      { path: "notice/:noticeId", Component: NoticePage },
      { path: "employees", Component: EmployeesPage },

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
      { path: "inquiry", Component: InquiryPage },
      { path: "approval-request", Component: ApprovalRequestPage },
      { path: "evaluation", Component: EvaluationPage },
      { path: "approval", Component: ApprovalPage },
      { path: "heart-letter", Component: HeartLetterPage },
      { path: "community", Component: CommunityPage },
      { path: "community/:postId", Component: CommunityDetailPage },
      { path: "registration-approval", Component: RegistrationApprovalPage },
      { path: "search", Component: SearchPage },
      { path: "mypage", Component: MyPage },
	  {
	    path: "/documents",
	    element: <DocumentsPage />,
	  },
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
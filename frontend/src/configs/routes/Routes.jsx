import { Navigate } from "react-router-dom";
import TokenExpiredMessage from "@/common/warningsInterfaces/TokenExpiredMessage";
import AccessDenied from "@/common/warningsInterfaces/AccessDenied";
import UserSuspended from "@/common/warningsInterfaces/UserSuspended";
import NotFound from "@/common/warningsInterfaces/NotFound";
import Login from "@/views/login/Login";
import ForgotPassword from "@/views/login/ForgotPassword";
import OTPVerification from "@/views/login/OTPVerification";
import ResetPassword from "@/views/login/ResetPassword";
import MainView from "@/views/home/MainView";
import HomeBase from "@/views/home/HomeBase";
import UpdateProfile from "@/views/profile/UpdateProfile";
import ChangePassword from "@/views/profile/ChangePassword";
import BusinessUpdate from "@/views/company/BusinessUpdate";
import ProcessCrud from "@/views/company/ProcessCrud";
import ProcessUpdate from "@/views/company/ProcessUpdate";
import ProcessCreate from "@/views/company/ProcessCreate";
import UserCrud from "@/views/user/UserCrud";
import UserUpdate from "@/views/user/UserUpdate";
import UserCreate from "@/views/user/UserCreate";
import RoleCrud from "@/views/role/RoleCrud";
import RoleUpdate from "@/views/role/RoleUpdate";
import RoleCreate from "@/views/role/RoleCreate";
import RiskCrud from "@/views/risk/RiskCrud";
import RiskStepperCreate from "@/views/risk/riskCreate/RiskStepperCreate";
import RiskDetailsUpdate from "@/views/risk/riskUpdate/RiskDetailsUpdate";
import ControlCrud from "@/views/control/ControlCrud";
import ControlStepperCreate from "@/views/control/controlCreate/ControlStepperCreate";
import ControlDetailsUpdate from "@/views/control/controlUpdate/ControlDetailsUpdate";
import EventCrud from "@/views/event/EventCrud";
import EventCreate from "@/views/event/EventCreate";
import EventUpdate from "@/views/event/EventUpdate";
import EventDocumentCrud from "@/views/event/EventDocumentCrud";
import ActionPlanCrud from "@/views/actionPlan/ActionPlanCrud";
import ActionPlanCreate from "@/views/actionPlan/ActionPlanCreate";
import ActionPlanUpdate from "@/views/actionPlan/ActionPlanUpdate";
import ActionPlanTask from "@/views/actionPlan/ActionPlanTask";
import AuditProgramCrud from "@/views/auditProgram/AuditProgramCrud";
import AuditProgramCreate from "@/views/auditProgram/AuditProgramCreate";
import AuditProgramUpdate from "@/views/auditProgram/AuditProgramUpdate";
import AuditProgramDetails from "@/views/auditProgram/AuditProgramDetails";
import PlanningMain from "@/views/auditProgram/planning/PlanningMain";
import AuditTestCreate from "@/views/auditProgram/planning/tabs/auditTest/AuditTestCreate";
import AuditTestUpdate from "@/views/auditProgram/planning/tabs/auditTest/AuditTestUpdate";
import AuditTestDocumentCrud from "@/views/auditProgram/planning/tabs/auditTest/AuditTestDocumentCrud";
import ExecutionMainCrud from "@/views/auditProgram/execution/ExecutionMainCrud";
import InformationSourceDocumentCrud from "@/views/auditProgram/execution/informationSource/InformationSourceDocumentCrud";
import EvidenceDocumentCrud from "@/views/auditProgram/execution/evidence/EvidenceDocumentCrud";
import FindingCrud from "@/views/auditProgram/execution/finding/FindingCrud";
import FindingCreate from "@/views/auditProgram/execution/finding/FindingCreate";
import FindingUpdate from "@/views/auditProgram/execution/finding/FindingUpdate";
import ReportMain from "@/views/auditProgram/report/ReportMain";
import ReportOptions from "@/views/report/ReportOptions";
import BudgetHoursFilters from "@/views/report/budgetHours/BudgetHoursFilters";
import RiskMatrixGeneralFilters from "@/views/report/riskMatrixGeneral/RiskMatrixGeneralFilters";
import RiskMatrixAuditProgramFilters from "@/views/report/riskMatrixAuditProgram/RiskMatrixAuditProgramFilters";
import AuditPlanFilters from "@/views/report/auditPlan/AuditPlanFilters";
import AuditResultFilters from "@/views/report/auditResult/AuditResultFilters";

export const Routes = [
  // Ruta raíz redirige al home
  {
    path: "/",
    element: <Navigate to="/home/main-view" />,
  },

  // Rutas públicas
  {
    path: "/login",
    access: ["guest"],
    children: [
      {
        path: "",
        element: <Navigate to="session" />,
      },
      {
        path: "session",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "verify-otp",
        element: <OTPVerification />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },

  // Rutas protegidas

  // Mensajes directos del Axios
  {
    path: "/token-expired",
    access: ["auth"],
    element: <TokenExpiredMessage />,
  },
  {
    path: "/access-denied",
    access: ["auth"],
    element: <AccessDenied />,
  },
  {
    path: "/suspended",
    access: ["auth"],
    element: <UserSuspended />,
  },

  //Vistas principales
  {
    path: "/home",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="main-view" />,
      },
      {
        path: "main-view",
        element: <MainView />,
        access: [],
      },
      {
        path: "profile",
        children: [
          {
            path: "",
            element: <Navigate to="manage-profile" />,
          },
          {
            path: "manage-profile",
            element: <UpdateProfile />,
            access: [],
          },
          {
            path: "change-password",
            element: <ChangePassword />,
            access: [],
          },
        ],
      },
    ],
  },
  {
    path: "/company",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="data" />,
      },
      {
        path: "data",
        element: <BusinessUpdate />,
        access: ["get.company", "update.company"],
      },
      {
        path: "manage-processes",
        access: [],
        children: [
          {
            path: "",
            element: <Navigate to="crud" />,
          },
          {
            path: "crud",
            access: ["get.process"],
            element: <ProcessCrud />,
          },
          {
            path: "create-process",
            access: ["create.process", "get.user"],
            element: <ProcessCreate />,
          },
          {
            path: "edit-process/:slug",
            access: ["update.process", "get.user"],
            element: <ProcessUpdate />,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="manage-users" />,
      },
      {
        path: "manage-users",
        children: [
          {
            path: "",
            element: <Navigate to="crud" />,
          },
          {
            path: "crud",
            access: ["get.user"],
            element: <UserCrud />,
          },
          {
            path: "create-user",
            access: ["create.user"],
            element: <UserCreate />,
          },
          {
            path: "edit-user/:id",
            access: ["update.user"],
            element: <UserUpdate />,
          },
        ],
      },
      {
        path: "manage-roles",
        children: [
          {
            path: "",
            element: <Navigate to="crud" />,
          },
          {
            path: "crud",
            access: ["get.role"],
            element: <RoleCrud />,
          },
          {
            path: "create-role",
            access: ["create.role"],
            element: <RoleCreate />,
          },
          {
            path: "edit-role/:id",
            access: ["update.role"],
            element: <RoleUpdate />,
          },
        ],
      },
    ],
  },
  {
    path: "/risks",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="manage-risks" />,
      },
      {
        path: "manage-risks",
        access: [],
        children: [
          {
            path: "",
            element: <Navigate to="crud" />,
          },
          {
            path: "crud",
            access: ["get.risk"],
            element: <RiskCrud />,
          },
          {
            path: "create-risk",
            access: ["create.risk", "get.process", "get.control"],
            element: <RiskStepperCreate />,
          },
          {
            path: "edit-risk/:slug",
            access: ["update.risk", "get.process", "get.control"],
            element: <RiskDetailsUpdate />,
          },
        ],
      },
    ],
  },

  {
    path: "/controls",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="manage-controls" />,
      },
      {
        path: "manage-controls",
        access: [],
        children: [
          {
            path: "",
            element: <Navigate to="crud" />,
          },
          {
            path: "crud",
            access: ["get.control"],
            element: <ControlCrud />,
          },
          {
            path: "create-control",
            access: ["create.control", "get.process", "get.risk"],
            element: <ControlStepperCreate />,
          },
          {
            path: "edit-control/:slug",
            access: ["update.control", "get.process", "get.risk"],
            element: <ControlDetailsUpdate />,
          },
        ],
      },
    ],
  },
  {
    path: "/events",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="manage-events" />,
      },
      {
        path: "manage-events",
        access: [],
        children: [
          {
            path: "",
            element: <Navigate to="crud" />,
          },
          {
            path: "crud",
            access: ["get.event"],
            element: <EventCrud />,
          },
          {
            path: "create-event",
            access: ["create.event", "get.risk"],
            element: <EventCreate />,
          },
          {
            path: "edit-event/:slug",
            access: ["update.event", "get.risk"],
            element: <EventUpdate />,
          },
          {
            path: "manage-documents/:slug",
            access: ["update.event"],
            element: <EventDocumentCrud />,
          },
        ],
      },
    ],
  },
  {
    path: "/action-plans",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="manage-action-plans" />,
      },
      {
        path: "manage-action-plans",
        access: [],
        children: [
          {
            path: "",
            element: <Navigate to="crud" />,
          },
          {
            path: "crud",
            access: ["get.action_plan"],
            element: <ActionPlanCrud />,
          },
          {
            path: "create-action-plans",
            access: ["create.action_plan", "get.user", "get.event"],
            element: <ActionPlanCreate />,
          },
          {
            path: "edit-action-plans/:slug",
            access: ["update.action_plan", "get.user", "get.event"],
            element: <ActionPlanUpdate />,
          },
          {
            path: "edit-tasks/:slug",
            access: ["update.action_plan"],
            element: <ActionPlanTask />,
          },
        ],
      },
    ],
  },
  {
    path: "/audit-programs",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="manage-audit-programs" />,
      },
      {
        path: "manage-audit-programs",
        access: [],
        children: [
          {
            path: "",
            element: <Navigate to="crud" />,
          },
          {
            path: "crud",
            access: ["get.audit_program"],
            element: <AuditProgramCrud />,
          },
          {
            path: "create",
            access: ["create.audit_program"],
            element: <AuditProgramCreate />,
          },
          {
            path: "edit-program/:slug",
            access: ["update.audit_program"],
            element: <AuditProgramUpdate />,
          },
          {
            path: "details-program/:slug",
            access: ["get.audit_program"],
            element: <AuditProgramDetails />,
          },
          {
            path: "planning/:slug",
            access: ["update.planning.audit_program"],
            element: <PlanningMain />,
          },
          {
            path: "planning/:slug/create-audit-test",
            access: ["update.planning.audit_program"],
            element: <AuditTestCreate />,
          },
          {
            path: "planning/:slugAuditProgram/edit-audit-test/:slugAuditTest",
            access: ["update.planning.audit_program"],
            element: <AuditTestUpdate />,
          },
          {
            path: "planning/:slugAuditProgram/manage-documents/:slugAuditTest",
            access: ["update.planning.audit_program"],
            element: <AuditTestDocumentCrud />,
          },
          {
            path: "execution/:slugAuditProgram",
            access: ["update.execution.audit_program"],
            element: <ExecutionMainCrud />,
          },
          {
            path: "execution/:slugAuditProgram/manage-information-source/:slugAuditTest",
            access: ["update.execution.audit_program"],
            element: <InformationSourceDocumentCrud />,
          },
          {
            path: "execution/:slugAuditProgram/manage-evidence/:slugAuditTest",
            access: ["update.execution.audit_program"],
            element: <EvidenceDocumentCrud />,
          },
          {
            path: "execution/:slugAuditProgram/manage-findings/:slugAuditTest",
            access: ["update.execution.audit_program"],
            children: [
              {
                path: "",
                element: <Navigate to="crud" />,
              },
              {
                path: "crud",
                access: ["update.execution.audit_program"],
                element: <FindingCrud />,
              },
              {
                path: "create-finding",
                access: ["update.execution.audit_program"],
                element: <FindingCreate />,
              },
              {
                path: "edit-finding/:slugFinding",
                access: ["update.execution.audit_program"],
                element: <FindingUpdate />,
              },
            ],
          },
          {
            path: "report/:slug",
            access: ["update.planning.audit_program"],
            element: <ReportMain />,
          },
        ],
      },
    ],
  },
  {
    path: "/report-audit-programs",
    element: <HomeBase />,
    access: ["auth"],
    children: [
      {
        path: "",
        element: <Navigate to="report-options" />,
      },
      {
        path: "report-options",
        element: <ReportOptions />,
        access: ["get.audit_program"],
      },
      {
        path: "audit-results-report",
        element: <AuditResultFilters />,
        access: ["get.audit_program"],
      },
      {
        path: "risk-matrix-general-report",
        element: <RiskMatrixGeneralFilters />,
        access: ["get.audit_program"],
      },
      {
        path: "risk-matrix-audit-program-report",
        element: <RiskMatrixAuditProgramFilters />,
        access: ["get.audit_program"],
      },
      {
        path: "audit-plan-report",
        element: <AuditPlanFilters />,
        access: ["get.audit_program"],
      },
      {
        path: "budget-hours-report",
        element: <BudgetHoursFilters />,
        access: ["get.audit_program"],
      },
    ],
  },

  // Ruta 404 para páginas no encontradas
  {
    path: "*",
    element: <NotFound />,
  },
];

export default Routes;

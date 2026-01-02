import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  ListItemButton,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SummarizeIcon from "@mui/icons-material/Summarize";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { removeLocalStorageItems } from "@/utils/HelpersLib";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import User from "@/models/User";

export default function AppSidebar({ open }) {
  const drawerWidth = 300;
  const user = new User(useSelector((state) => state.auth.data));
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleSubmenuClick = (text) => {
    setOpenSubmenu((prev) => (prev === text ? null : text));
  };

  const hasPermission = (requiredPermissions = []) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.every((perm) =>
      user._permissions.includes(perm)
    );
  };

  const menuItems = [
    {
      text: "Vista General",
      icon: <DashboardIcon />,
      path: "/home/main-view",
      permissions: [],
    },
    {
      text: "Gestión de la Empresa",
      icon: <BusinessIcon />,
      permissions: [],
      submenu: [
        {
          text: "Datos Empresariales",
          icon: <BusinessIcon />,
          path: "/company/data",
          permissions: ["get.company", "update.company"],
        },
        {
          text: "Gestión de Procesos Internos",
          icon: <LibraryBooksIcon />,
          path: "/company/manage-processes/crud",
          permissions: [
            "get.process",
            "create.process",
            "update.process",
            "get.user",
          ],
        },
      ],
    },
    {
      text: "Gestión de Usuario",
      icon: <PeopleIcon />,
      permissions: [],
      submenu: [
        {
          text: "Administrar Usuarios",
          icon: <PersonAddIcon />,
          path: "/admin/manage-users/crud",
          permissions: ["get.user", "create.user", "update.user", "get.role"],
        },
        {
          text: "Administrar Roles y permisos",
          icon: <VerifiedUserIcon />,
          path: "/admin/manage-roles/crud",
          permissions: ["get.role", "create.role", "update.role"],
        },
      ],
    },
    {
      text: "Gestión de Riesgos",
      icon: <SecurityIcon />,
      path: "/risks/manage-risks/crud",
      permissions: [
        "get.risk",
        "create.risk",
        "update.risk",
        "get.process",
        "get.control",
      ],
    },
    {
      text: "Gestión de Controles",
      icon: <CheckCircleIcon />,
      path: "/controls/manage-controls/crud",
      permissions: [
        "get.control",
        "create.control",
        "update.control",
        "get.process",
        "get.risk",
      ],
    },
    {
      text: "Gestión de Eventos",
      icon: <EventNoteIcon />,
      path: "/events/manage-events/crud",
      permissions: ["get.event", "create.event", "update.event", "get.risk"],
    },
    {
      text: "Planes de Acción",
      icon: <AssignmentTurnedInIcon />,
      path: "/action-plans/manage-action-plans/crud",
      permissions: [
        "get.action_plan",
        "create.action_plan",
        "update.action_plan",
        "get.user",
        "get.event",
      ],
    },
    {
      text: "Programas de Auditoría",
      icon: <LibraryBooksIcon />,
      path: "/audit-programs/manage-audit-programs/crud",
      permissions: ["get.audit_program"],
    },
    {
      text: "Reportes de Auditoría",
      icon: <SummarizeIcon />,
      path: "/report-audit-programs/report-options",
      permissions: ["get.audit_program"],
    },
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          top: "100px",
          height: "calc(100vh - 32px - 68px)",
          overflowY: "auto",
          backgroundColor: "#333",
          color: "white",
        },
      }}
    >
      <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
      <List>
        {menuItems.map((item) => {
          if (!hasPermission(item.permissions)) return null;

          const hasSubmenu = Boolean(item.submenu);
          const isOpen = openSubmenu === item.text;

          if (hasSubmenu) {
            const visibleSubmenu = item.submenu.filter((subitem) =>
              hasPermission(subitem.permissions)
            );

            if (visibleSubmenu.length === 0) return null;

            return (
              <Box key={item.text}>
                <ListItemButton
                  onClick={() => handleSubmenuClick(item.text)}
                  sx={{
                    color: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                  }}
                >
                  <ListItemIcon sx={{ color: "white" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {isOpen ? (
                    <ExpandLess sx={{ color: "white" }} />
                  ) : (
                    <ExpandMore sx={{ color: "white" }} />
                  )}
                </ListItemButton>
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {visibleSubmenu.map((subitem) => (
                      <ListItemButton
                        key={subitem.text}
                        component={Link}
                        to={subitem.path}
                        onClick={() => {
                          removeLocalStorageItems();
                        }}
                        sx={{
                          pl: 4,
                          color: "white",
                          "&:hover": {
                            backgroundColor: "rgba(255,255,255,0.08)",
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "white" }}>
                          {subitem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subitem.text} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => {
                removeLocalStorageItems();
              }}
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
              }}
            >
              <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}

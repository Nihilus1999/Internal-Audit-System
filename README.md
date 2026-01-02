# Sistema de Gestión de Auditorías Internas (SGAI)

> **Trabajo Instrumental de Grado** > **Institución:** Universidad Católica Andrés Bello (UCAB)  
> **Cliente:** Consultores J.D.G. S.A.

## 📄 Descripción del Proyecto

Este sistema web fue desarrollado para modernizar y digitalizar el departamento de Auditoría Interna de **Consultores J.D.G. S.A.**, reemplazando el uso disperso de hojas de cálculo por una solución centralizada y segura.

El objetivo principal es integrar la **Gestión de Riesgos** con la **Planificación de Auditorías**, permitiendo a la organización enfocar sus recursos en los procesos operativos más críticos y generar informes automatizados de alta calidad.

## 📚 Fundamentación Teórica y Normativa

La lógica del negocio se rige estrictamente por estándares internacionales:

### 1. Gestión de Riesgos (ISO 31000)
 En el ámbito de la auditoría interna, el Riesgo se define como el efecto de la incertidumbre sobre la consecución de los objetivos organizacionales. El sistema adopta un enfoque basado en riesgos para dirigir los recursos de auditoría hacia las áreas de mayor vulnerabilidad operativa y estratégica.

* **Cálculo de Riesgo:** Algoritmo cuantitativo que determina la magnitud del riesgo inherente y residual mediante el producto de su probabilidad de ocurrencia por el impacto estimado en la operación.
* **Controles:** Medida que modifica el riesgo. Pueden ser procesos, políticas, dispositivos o prácticas que actúan para minimizar la probabilidad o el impacto del evento (ej. "Firewall").
* **Eventos:** Es el incidente o situación que podría ocurrir y afectar negativamente el logro de los objetivos (ej. "Caída del servidor"). En tu sistema, esto alimenta la Matriz de Riesgos.
* **Planes de Acción:** Conjunto de tareas asignadas a un responsable con una fecha límite, generadas tras una auditoría para corregir una "No Conformidad" o mejorar un proceso débil.
* **Mapa de Calor:** Generación visual de matrices de riesgo (Inherente y Residual) para la toma de decisiones.


### 2. Auditoría de Sistemas de Gestión (ISO 19011)
Cubre el ciclo de vida completo de la auditoría:
* **Planificación:** Creación de programas anuales y asignación de recursos (horas/hombre).
* **Ejecución:** Listas de verificación digitales, registro de hallazgos y recolección de evidencia.
* **Reportes:** Generación automática de informes de auditoría y seguimiento de planes de acción.

## 🚀 Tecnologías Utilizadas

El proyecto implementa una arquitectura **MVC** con servicios REST:

* **Frontend:** ReactJS + Material UI (MUI).
* **Backend:** Node.js + Express.
* **Base de Datos:** PostgreSQL (vía Supabase).
* **ORM:** Sequelize.
* **Infraestructura:** Azure Static Web Apps (Front) y Azure App Service (Back).

## 🛠️ Módulos Principales

1.  **Seguridad:** Autenticación (JWT), Roles (RBAC) y recuperación de contraseñas.
2.  **Riesgos:** Gestion de eventos, planes de acción, riesgos y controles.
3.  **Auditoría:** Gestión de la planficación, ejecución y fase de reporte.
4.  **Dashboard:** Visualización de KPIs y estadísticas de gestión.

## 📦 Instalación y Configuración Local

Cada parte del proyecto cuenta con su propia documentación detallada.

### 📌 Backend
Dentro de la carpeta `backend/` encontrarás un archivo `README.md` con información sobre:
- Pasos de instalación
- Configuración de variables de entorno (`.env`)
- Generación del `JWT_SECRET_KEY`
- Ejecución del servidor
- Endpoints disponibles

En el terminal puedes escribir **cd backend** para entrar directamente a esa ruta

---

### 🎨 Frontend
Dentro de la carpeta `frontend/` encontrarás un archivo `README.md` con información sobre:
- Pasos de instalación
- Configuración del entorno
- Scripts disponibles
- Forma de ejecutar la aplicación en desarrollo

En el terminal puedes escribir **cd frontend** para entrar directamente a esa ruta

## 👥 Autores

### Desarrolladores:

Asdrúbal Alejandro Asencio Acosta (backend)

José Daniel El Asmar Da Silva (frontend)

### Tutores:

Académico: María Carolina Vásquez García

Empresarial: Gabriel Augusto Cabrera Graterol
# 🧾 Backend — Sistema de Auditoría Interna — Consultores JDG

API REST desarrollada para soportar la plataforma web de **auditorías internas de Consultores J.D.G.**  
Se encarga de la **gestión de usuarios, autenticación, programas de auditoría, riesgos, hallazgos, matrices e informes**, garantizando seguridad, integridad de la información y conexión con la base de datos corporativa.

---

## 🧠 Descripción general

Este backend expone un conjunto de endpoints REST que permiten:

- Autenticación y autorización basada en **JWT**
- Gestión de **usuarios, roles y permisos**
- Administración de **programas, planes y resultados de auditoría**
- Registro y actualización de **riesgos, hallazgos y planes de acción**
- Generación y consulta de **reportes**
- Envío de **notificaciones por correo**
- Manejo de **archivos adjuntos** y documentos para auditorías

Construido con **Node.js + Express** y **PostgreSQL + Sequelize** como ORM.

---

## 📁 Requisitos previos

Asegúrate de tener instalado:

- Node.js (versión LTS)
- npm o yarn
- PostgreSQL
- Variables de entorno configuradas

---

## ⚙️ Variables de entorno

Crea un archivo `.env` a partir de `.env.example`:

---

## 🛠️ Instalación para desarrollo

1. Instalar las dependecias necesarias

```
npm install
```

2. Debe crear una base de datos con el nombre de su preferencia

3. Una vez creada la base de datos, debe colocar los datos correspondiente en la variable de entorno de ejemplo

4. Debe cambiar el nombre de .env.example por .env.dev

5. Ejecuta el siguiente scripts personalizado para correr el backend en desarrollo

```
npm run backend
```

## 🧠 Información Adicional


Para realiza un alter table en las tablas cuyos campos fueron modificados, ejecute el siguiente comando

```
npx sequelize-cli db:migrate
```

Para insertar todos los Seeders (datos de prueba), ejecute el siguiente comando

```
npx sequelize-cli db:seed:all
```


En caso de que se necesite borrar los seeders, ejecute el siguiente comando

```
npx sequelize-cli db:seed:undo:all
```

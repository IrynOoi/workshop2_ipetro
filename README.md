## POSTER 

https://www.canva.com/design/DAG7vouTmLc/0SN8Joj_Q76Xt2tlYPiWqQ/view?utm_content=DAG7vouTmLc&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h7c454fce26

# iPetro / RBIMS  
**Risk-Based Inspection Management System**

## 1. System Overview

iPetro (RBIMS) is a **web-based Risk-Based Inspection (RBI) Management System** designed to support industrial inspection workflows.  
The system enables organizations to manage equipment inventories, inspection plans, inspection results, and user profiles in a centralized platform.

RBIMS also integrates **AI-assisted data extraction** to automate the interpretation of technical drawings, reducing manual data entry and improving inspection efficiency.

---

## 2. Technical Architecture

The system follows a **monolithic web application architecture**, where the frontend and backend are served from a single Node.js application.

---

## 3. Technology Stack

### 3.1 Backend

- **Runtime:** Node.js  
- **Web Framework:** Express.js  
- **Entry Point:** `server.js`

The backend handles:
- HTTP request routing
- Business logic
- Authentication and authorization
- Database transactions
- AI service integration

**Middleware Used:**
- `cors` – Enables Cross-Origin Resource Sharing
- `body-parser` – Parses JSON and URL-encoded request bodies
- `multer` – Handles file uploads (e.g., profile images, inspection documents)
- `express-session` – Manages user sessions and authentication state

---

### 3.2 Database

- **Database Type:** PostgreSQL (Relational Database)
- **Schema Definition:** `rr4.sql`
- **Migration Files:** `add_user_profile_fields.sql`

The database stores structured data for:
- Users and roles
- Equipment master data
- Inspection records
- Inspection parts and methods

The backend communicates with the database using a connection pool and parameterized queries to ensure data integrity and security.

---

### 3.3 Frontend

- **Technologies:** HTML, CSS, JavaScript
- **Rendering Model:** Server-side served (monolithic)

**Directory Structure:**
- `public/` – Publicly accessible pages (e.g., Login)
- `private/` – Authenticated pages (e.g., dashboard, inspection modules)

The frontend interacts with backend REST APIs for data retrieval and persistence.

---

## 4. Authentication & Authorization

The system implements session-based authentication:

- User login and logout handled via `AuthController.js`
- Sessions managed using `express-session`
- Role-based access control (e.g., Admin vs Inspector)
- Admin users have additional permissions for user and system management

---

## 5. Core Functional Modules

### 5.1 Authentication Management
- User login and logout
- Session validation
- Role-based access checks

### 5.2 User Management
- Admin-managed user accounts
- User profile management
- Role assignment

### 5.3 Equipment Management
- CRUD operations for industrial equipment
- Equipment metadata storage (design code, pressure, temperature, etc.)

### 5.4 Inspection Management
- Inspection planning and execution
- Inspection history tracking
- Risk rating calculation based on operating parameters
- Inspection report generation

### 5.5 File and Image Handling
- Uploading and storing profile images
- Uploading technical drawings and inspection evidence
- Backend support for document/image processing

---

## 6. AI Integration

### 6.1 AI Model Used

- **AI Provider:** Google Generative AI
- **Model:** `gemini-2.5-flash`
- **Type:** Multimodal (Text + Image)

### 6.2 AI Capabilities

The AI module is used to:
- Analyze technical drawings and engineering documents
- Extract structured design and inspection data from images
- Infer missing engineering attributes (e.g., phase, material type)
- Generate structured JSON output for direct database insertion

This significantly improves inspection efficiency by reducing manual data extraction from drawings and datasheets.

---

## 7. Summary

RBIMS (iPetro) combines traditional inspection management workflows with modern web technologies and AI-powered automation.  
The system is designed to be scalable, secure, and extensible, supporting both operational inspection needs and advanced risk-based analysis.




## OUTPUT :

# DATA EXTRACTION MODULE:

<img width="1879" height="938" alt="image" src="https://github.com/user-attachments/assets/e8e50aa2-b3cf-485f-8b91-74710bab3f4c" />

# EXPORT EXCEL:

<img width="1184" height="357" alt="image" src="https://github.com/user-attachments/assets/ffd89e81-3243-4aa1-b4f1-1883767f2fee" />

# EQUIPMENT MANAGER ：

<img width="1885" height="960" alt="image" src="https://github.com/user-attachments/assets/c6cfe857-dbec-43c3-bb68-586320c7a862" />

# INSPECTION PLAN PREVIEW PAGE:
<img width="1212" height="900" alt="image" src="https://github.com/user-attachments/assets/796f2647-b7c8-47b4-bf3e-85a2bc19c9df" />

# EXPORT POWERPOINT

<img width="1507" height="1037" alt="image" src="https://github.com/user-attachments/assets/88d69c62-81c4-4ffe-a17d-a1b9c2ff4004" />


# EXPORT PDF
<img width="610" height="781" alt="image" src="https://github.com/user-attachments/assets/48dd62bb-cfd4-4b20-9101-b30144a185fd" />

# USER MANAGEMENT PAGE

<img width="1889" height="926" alt="image" src="https://github.com/user-attachments/assets/e3474a30-28c5-4d43-a4cf-74661d763314" />

# ONLY ADMIN HAS PRIVILEGE TO EDIT AND ADD USER

ADD USER

<img width="479" height="508" alt="image" src="https://github.com/user-attachments/assets/34964f77-5111-49d5-a3e5-b85eda715fd9" />




EDIT INSPECTION PLAN

<img width="1617" height="877" alt="image" src="https://github.com/user-attachments/assets/54cfb243-930c-4a04-9b24-a48d48df16be" />


EDITABLE GRID

<img width="1041" height="345" alt="image" src="https://github.com/user-attachments/assets/a0cf58b7-d6b2-4f75-ab6a-c07cffe4e3d5" />


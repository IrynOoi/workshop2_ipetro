## POSTER 

https://www.canva.com/design/DAG7vouTmLc/0SN8Joj_Q76Xt2tlYPiWqQ/view?utm_content=DAG7vouTmLc&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h7c454fce26

## INTRODUCTION ABOUT THIS SYSTEM (TECHNICAL PART)

Overview
This is a web-based application designed to manage industrial inspections, equipment, and user profiles. It appears to be a Risk-Based Inspection (RBI) system that allows users to upload data, manage equipment inventories, and schedule inspections.

Technical Stack
Backend Runtime: Node.js

The core logic runs on a Node.js server (entry point appears to be server.js).

Web Framework: Express.js

Used to handle HTTP requests, routing, and serving static files.

It utilizes middleware like cors (Cross-Origin Resource Sharing), body-parser (for handling JSON/URL-encoded data), and multer (for handling file uploads like profile images).

Database: PostgreSQL

The system connects to a relational database.

There is a schema file (rr4.sql) and a migration file (add_user_profile_fields.sql) included, indicating structured data for Users, Equipment, and Inspections.

It uses the mysql2 library for database connectivity.

Frontend: HTML / CSS / JavaScript

The frontend is "server-side served" (Monolithic structure).

The user interface consists of static HTML files located in public/ (accessible to all, e.g., Login) and private/ (likely protected behind authentication).

Authentication:

The system handles user sessions and login functionality (seen in AuthController.js and express-session).

Key Functional Modules
Based on the controller files, the system is divided into these main logical areas:

Auth Management: Login, logout, and session handling.

User Management: Admin capabilities to manage user accounts and profiles.

Equipment Management: CRUD (Create, Read, Update, Delete) operations for industrial equipment.

Inspection Management: Handling inspection plans and potentially storing results.

File/Image Handling: Uploading and storing profile pictures or inspection evidence (hinted at by the pdf-ocr-backend folder name, suggesting it might process PDF documents or perform Optical Character Recognition).
AI Model: gemini-2.5-flash


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


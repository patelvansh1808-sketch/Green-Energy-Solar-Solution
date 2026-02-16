# Installation & Project Tracking - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE (React)                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────┐    ┌──────────────────────────┐   │
│  │   User Installation Page     │    │   Admin Installation     │   │
│  │  InstallationTracking.jsx    │    │   Dashboard.jsx          │   │
│  ├──────────────────────────────┤    ├──────────────────────────┤   │
│  │ • Project List Panel         │    │ • Stats Overview         │   │
│  │ • Project Details Pane       │    │ • Create Project Form    │   │
│  │ • Progress Update For        │    │ • Status Filter          │   │
│  │ • Progress History View      │    │ • Projects Table         │   │
│  │ • Status Badges              │    │ • Engineer Assignment    │   │
│  └──────────────────────────────┘    └──────────────────────────┘   │
│              ↓                                   ↓                  │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │        Axios HTTP Client (With JWT Interceptors)             │   │
│  │  • Authorization: Bearer <token>                             │   │
│  │  • Content-Type: application/json                            │   │
│  │  • Error handling & logging                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
                    ┌──────────────────────┐
                    │   Network / HTTP     │
                    │  (Bearer Token)      │
                    └──────────────────────┘
                               ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    SERVER SIDE (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Request → Middleware Chain                      │   │
│  │  1. authenticateJWT (verify token, normalize user)           │   │
│  │  2. requireRole (check user.role against allowed)            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │       Installation Routes (/api/installations)               │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  POST /                  → createProject()                   │   │
│  │  GET /                   → listProjects()                    │   │
│  │  GET /:id                → getProject()                      │   │
│  │  PATCH /:id/assign-engineer → assignEngineer()               │   │
│  │  PATCH /:id/progress        → updateProgress()               │   │
│  │  PATCH /:id/commission      → markCommissioned()             │   │
│  │  PATCH /:id/live            → markLive()                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │      Installation Controller                                 │   │
│  │  (Business Logic & Database Operations)                      │   │
│  │                                                              │   │
│  │  • Validate input parameters                                 │   │
│  │  • Check engineer exists & has role                          │   │
│  │  • Update status according to business rules                 │   │
│  │  • Log progress history                                      │   │
│  │  • Query/update database                                     │   │
│  │  • Populate referenced documents                             │   │
│  │  • Return formatted response                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │     Mongoose Models (Schema & Validation)                    │   │
│  ├──────────────────────────────────────────────────────────────┤   │
│  │  • Installation (main project document)                      │   │
│  │  • User (for engineer references)                            │   │
│  │  • Customer (for customer references)                        │   │
│  │  • Lead (for lead references)                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                              ↓                                      │
└─────────────────────────────────────────────────────────────────────┘
                               ↓
                    ┌──────────────────────┐
                    │  MongoDB Atlas       │
                    │  (Production DB)     │
                    └──────────────────────┘
```

---

## Request Flow Example: Create Project

```
┌─────────────────────────────────────────────────────────────────────┐
│  1. USER ACTION (Frontend)                                          │
│  Admin clicks "New Project" → Fill form → Click "Create"            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  2. HTTP REQUEST (Axios)                                            │
│  POST /api/installations                                            │
│  Headers: {                                                         │
│    "Authorization": "Bearer eyJhbGciOiJIUzI1...",                   │
│    "Content-Type": "application/json"                               │
│  }                                                                  │
│  Body: {                                                            │
│    "customerId": "650a1b2c3d4e5f6g7h8i",                            │
│    "leadId": "650a1b2c3d4e5f6g7h8j",                                │
│    "surveyDate": "2024-12-15T10:00:00Z",                            │
│    "surveyNotes": "Site suitable for 5kW system"                    │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  3. MIDDLEWARE CHAIN (Express)                                      │
│  → authenticateJWT()                                                │
│    ├─ Extract token from header                                     │
│    ├─ Verify token signature with JWT_SECRET                        │
│    ├─ Extract user id & role                                        │
│    └─ Set req.user = { id: "...", role: "admin" }                   │
│                                                                     │
│  → requireRole(["admin", "sales"])                                  │
│    ├─ Check req.user.role in ["admin", "sales"]                     │
│    ├─ Role is "admin" → ✅ PASS                                     
│    └─ Allow request to proceed to controller                        │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  4. CONTROLLER FUNCTION: createProject()                            │
│  (Backend/server/controllers/installationController.js)             │
│                                                                     │
│  try {                                                              │
│    • Extract body: customerId, leadId, surveyDate, surveyNotes      │
│    • Call Installation.create({                                     │
│        customer: customerId,                                        │
│        lead: leadId,                                                │
│        siteSurvey: {                                                │
│          scheduledDate: surveyDate,                                 │
│          status: "scheduled",                                       │
│          notes: surveyNotes                                         │
│        },                                                           │
│        status: "survey_scheduled",                                  │
│        progress: 0,                                                 │
│        progressLogs: []                                             │
│      })                                                             │
│    • MongoDB saves new document                                     │
│    • Return created document                                        │
│  } catch(err) {                                                     │
│    • Return 500 error response                                      │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  5. DATABASE OPERATION (MongoDB)                                    │
│  Collection: installations                                          │
│  Operation: insertOne({                                             │
│    _id: ObjectId("650a1b2c3d4e5f6g7h8k"),                           │
│    customer: ObjectId("650a1b2c3d4e5f6g7h8i"),                      │
│    lead: ObjectId("650a1b2c3d4e5f6g7h8j"),                          │
│    siteSurvey: {                                                    │
│      scheduledDate: ISODate("2024-12-15T10:00:00Z"),                │
│      status: "scheduled",                                           │
│      notes: "Site suitable for 5kW system"                          │
│    },                                                               │
│    status: "survey_scheduled",                                      │
│    assignedEngineer: null,                                          │
│    progress: 0,                                                     │
│    progressLogs: [],                                                │
│    commissioning: {},                                               │
│    goLive: {},                                                      │
│    createdAt: ISODate("2024-12-10T14:23:45.123Z"),                  │
│    updatedAt: ISODate("2024-12-10T14:23:45.123Z")                   │
│  })                                                                 │
│  Result: Inserted successfully, returns document                    │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  6. HTTP RESPONSE (Express)                                         │
│  Status: 201 Created                                                │
│  Headers: {                                                         │
│    "Content-Type": "application/json"                               │
│  }                                                                  │
│  Body: {                                                            │
│    "_id": "650a1b2c3d4e5f6g7h8k",                                   │
│    "customer": "650a1b2c3d4e5f6g7h8i",                              │
│    "lead": "650a1b2c3d4e5f6g7h8j",                                  │
│    "siteSurvey": {                                                  │
│      "scheduledDate": "2024-12-15T10:00:00Z",                       │
│      "status": "scheduled",                                         │
│      "notes": "Site suitable for 5kW system"                        │
│    },                                                               │
│    "status": "survey_scheduled",                                    │
│    "assignedEngineer": null,                                        │
│    "progress": 0,                                                   │
│    "progressLogs": [],                                              │
│    "createdAt": "2024-12-10T14:23:45.123Z",                         │
│    "updatedAt": "2024-12-10T14:23:45.123Z"                          │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│  7. FRONTEND STATE UPDATE (React)                                   │
│  • Axios response interceptor processes response                    │
│  • Component receives data                                          │
│  • State updated: setProjects([...projects, newProject])            │
│  • UI re-renders with new project in list                           │
│  • Form cleared                                                     │
│  • Success message displayed                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Status Lifecycle Diagram

```
┌──────────────────┐
│ SURVEY PENDING   │  Initial state when project created with no date
│                  │
└────────┬─────────┘
         │ (Survey date provided)
         ↓
┌──────────────────┐
│ SURVEY SCHEDULED │  Site survey confirmed for specific date
│                  │
└────────┬─────────┘
         │ (Engineer assigned)
         ↓
┌──────────────────┐
│ ENGINEER ASSIGNED│  Engineer selected and notified
│                  │
└────────┬─────────┘
         │ (Engineer updates progress > 0%)
         ↓
┌──────────────────┐
│ INSTALL IN       │  Active installation work underway
│ PROGRESS         │  Progress tracked 0-100%
│                  │  Can update multiple times
└────────┬─────────┘
         │ (Progress >= 90% && commissioned)
         ↓
┌──────────────────┐
│ COMMISSIONING    │  Testing & validation phase
│ DONE             │  All checks complete
│                  │
└────────┬─────────┘
         │ (Admin confirms ready)
         ↓
┌──────────────────┐
│ LIVE             │  🚀 System in production
│                  │  Final state - operation active
└──────────────────┘


Status Transition Rules:
• survey_pending   → survey_scheduled    (only if surveyDate is set)
• survey_scheduled → engineer_assigned   (only if valid engineer assigned)
• engineer_assigned → install_in_progress (automatic when progress > 0%)
• install_in_progress → commissioning_done (manual, requires progress >= 90%)
• commissioning_done → live (manual, admin only)
```

---

## Data Model Relationships

```
Installation Document Structure:
├── _id (ObjectId) - Primary key
├── customer (ref: Customer._id) - Who is getting the system
├── lead (ref: Lead._id) - Originating lead reference
├── siteSurvey
│   ├── scheduledDate (Date) - When survey happens
│   ├── status (String) - survey_pending, scheduled
│   └── notes (String) - Survey observations
├── assignedEngineer (ref: User._id) - Engineer doing installation
├── progress (Number 0-100) - Installation completion %
├── progressLogs (Array of Objects)
│   ├── percent (Number) - Progress % at this log
│   ├── note (String) - What was done
│   └── by (ref: User._id) - Who updated
├── commissioning
│   ├── date (Date) - When testing done
│   ├── status (String) - completed, failed, pending
│   └── notes (String) - Test results
├── goLive
│   ├── date (Date) - When went live
│   ├── confirmedBy (ref: User._id) - Who confirmed
│   └── status (String) - confirmed, pending
├── status (String) - Current lifecycle stage
├── createdAt (Date) - Project created
└── updatedAt (Date) - Last modified


Relationships:
Installation ──→ Customer (populate customer details)
Installation ──→ User (assignedEngineer role=engineer)
Installation ──→ Lead (optional, originating lead)
Installation ──→ User[] (progressLogs.by audit trail)
```

---

## Role-Based Access Control Flow

```
User Makes Request
    ↓
┌─────────────────────────────────┐
│  JWT Token Extracted & Verified │
│  • Signature validated          │
│  • Expiration checked           │
│  • User ID & Role extracted     │
└─────────────────────────────────┘
    ↓
┌──────────────────────────────────┐
│  Role Check Against Route        │
│                                  │
│  Required: ["admin", "sales"]    │
│  User.role: "admin"              │
│                                  │
│  "admin" in ["admin", "sales"]?  │
│  → YES ✅                        │
└──────────────────────────────────┘
    ↓
┌──────────────────────────────────┐
│  Proceed to Controller Function  │
│  • Access database               │
│  • Perform business logic        │
│  • Return success response       │
└──────────────────────────────────┘


If Role Check Fails:
┌──────────────────────────────────┐
│  User.role: "support"            │
│  Required: ["admin", "sales"]    │
│                                  │
│  "support" in ["admin", "sales"] │
│  → NO ❌                         │
└──────────────────────────────────┘
    ↓
┌──────────────────────────────────┐
│  Return 403 Forbidden            │
│  "Insufficient permissions"      │
│                                  │
│  Request blocked                 │
└──────────────────────────────────┘
```

---

## Component Hierarchy

```
Frontend/
├── Pages/
│   ├── User/
│   │   └── InstallationTracking.jsx
│   │       ├── useState: projects, selectedProject, engineers...
│   │       ├── useEffect: fetchProjects(), fetchEngineers()
│   │       ├── JSX: <div class="grid grid-cols-3">
│   │       │   ├── Left: Project list with map()
│   │       │   ├── Right: Project details & forms
│   │       │   └── Status badges with color coding
│   │       └── Event handlers: handleAssignEngineer(), handleUpdateProgress()
│   │
│   └── Admin/
│       └── InstallationDashboard.jsx
│           ├── useState: projects, selectedProject, engineers, filterStatus...
│           ├── useEffect: fetchProjects(), fetchEngineers()
│           ├── JSX: <div class="max-w-7xl">
│           │   ├── Header: Title + New Project button
│           │   ├── Stats: 4 cards showing metrics
│           │   ├── Form: Create new project
│           │   ├── Filter: Status dropdown
│           │   ├── Table: Projects with actions
│           │   └── Modal: Detailed project view
│           └── Event handlers: handleCreateProject(), handleAssignEngineer()
│
├── Services/
│   └── api.js
│       └── Axios instance with JWT interceptors
│
└── Components/
    └── (UI components for forms, buttons, etc.)
```

---

## Error Handling Flow

```
API Request
    ↓
┌─────────────────────────────────────┐
│  Validation & Authorization         │
├─────────────────────────────────────┤
│ Missing/Invalid JWT?                │
│ → Return 401 "Not authorized"       │
│                                     │
│ Insufficient Role?                  │
│ → Return 403 "Insufficient perms"   │
│                                     │
│ Missing Required Fields?            │
│ → Return 400 "Bad request"          │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Controller Logic                   │
├─────────────────────────────────────┤
│ try {                               │
│   • Validate engineer exists        │
│   • Check engineer.role === "eng"   │
│   • Update database                 │
│   • Return 200 with data            │
│ } catch(err) {                      │
│   • Log error                       │
│   • Return 500 error response       │
│ }                                   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Response to Client                 │
├─────────────────────────────────────┤
│ Status: 200, 201, 400, 401, 403, 500│
│ Body: { message, data/error }       │
│                                     │
│ Frontend:                           │
│ • Success: Update state, show UI    │
│ • Error: Display error message      │
└─────────────────────────────────────┘
```

---

## Data Flow Summary

```
User Action (Frontend)
    ↓
Form Input Validation
    ↓
Axios HTTP Request (+ JWT)
    ↓
JWT Authentication Middleware
    ↓
Role Authorization Middleware
    ↓
Route Handler
    ↓
Controller Function
    ↓
Database Query/Update (Mongoose)
    ↓
HTTP Response (Status + Data)
    ↓
Frontend State Update (React)
    ↓
Component Re-render
    ↓
User Sees Updated UI
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Production Environment                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Frontend Server (Vercel/Netlify/AWS S3+CloudFront)    │  │
│  │  • Serves React build files (HTML, JS, CSS)            │  │
│  │  • Configured CORS to backend domain                   │  │
│  │  • Gzip compression enabled                            │  │
│  │  • CDN for fast global delivery                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                    ↓ HTTPS requests                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Backend Server (Heroku/AWS EC2/Railway)               │  │
│  │  • Node.js/Express API server                          │  │
│  │  • Port 5000 (or configured via env)                   │  │
│  │  • JWT token validation                                │  │
│  │  • Role-based access control                           │  │
│  │  • Error logging and monitoring                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                    ↓ Queries                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  MongoDB Atlas (Production Database)                   │  │
│  │  • Cloud-hosted MongoDB cluster                        │  │
│  │  • Automatic backups and replication                   │  │
│  │  • Connection pooling                                  │  │
│  │  • SSL/TLS encryption                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

This architecture diagram provides a comprehensive visual understanding of how the Installation & Project Tracking system is structured, how data flows through the system, and how components interact with each other.

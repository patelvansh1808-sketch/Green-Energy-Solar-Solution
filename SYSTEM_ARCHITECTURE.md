# Installation & Project Tracking - System Architecture Diagrams

## 🏗️ System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     SURYAURJA APPLICATION                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐               │
│  │    FRONTEND     │◄───────►│    BACKEND      │               │
│  │  (React 18.2)   │         │ (Express.js)    │               │
│  │                 │         │                 │               │
│  │ ProjectTracking │────────►│ projectRoutes   │               │
│  │ Component       │         │    (13 routes)  │               │
│  │                 │         │                 │               │
│  └─────────────────┘         └────────┬────────┘               │
│                                       │                        │
│                              ┌────────▼────────┐               │
│                              │  projectController              │
│                              │  (13 methods)    │               │
│                              └────────┬────────┘               │
│                                       │                        │
│                              ┌────────▼────────┐               │
│                              │   Project Model  │               │
│                              │   (MongoDB)      │               │
│                              └──────────────────┘               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
USER ACTIONS          API CALLS            BACKEND              DATABASE
─────────────────────────────────────────────────────────────────────

┌─────────────┐
│ Create      │ ──POST /api/projects─────► ┌──────────────┐
│ Project     │                            │ projectCtrl  │
└─────────────┘                            │.createProject│
                                           └───────┬──────┘
                                                   │
                                           ┌───────▼──────┐
                                           │   validate   │
                                           │   save to DB │
                                           └───────┬──────┘
                                                   │
                                    ◄──── return ──┤
                                                   │
                                            ┌──────▼─────┐
                                            │ MongoDB    │
                                            │ Projects   │
                                            │ Collection │
                                            └────────────┘

┌──────────────┐
│ View Survey  │ ──GET /api/projects/:id──► ┌──────────────┐
│ Modal        │                            │ projectCtrl  │
└──────────────┘                            │.getProjectById
                                            └───────┬──────┘
                                                   │
                                           ┌───────▼──────┐
                                           │ fetch from   │
                                           │ MongoDB      │
                                           │ populate     │
                                           │ refs         │
                                           └───────┬──────┘
                                                   │
                                    ◄─── return ───┤
                                                   │
                                            ┌──────▼──────┐
                                            │ Display in  │
                                            │ Modal Form  │
                                            └─────────────┘

┌──────────────┐
│ Submit       │ ──PATCH /api/projects/..─► ┌──────────────┐
│ Survey       │     /survey                 │ projectCtrl  │
└──────────────┘                            │.updateSurvey │
                                            └───────┬──────┘
                                                   │
                                           ┌───────▼──────────┐
                                           │ validate role    │
                                           │ update survey    │
                                           │ change status    │
                                           └───────┬──────────┘
                                                   │
                                    ◄─── return ───┤
                                                   │
                                            ┌──────▼──────┐
                                            │ MongoDB     │
                                            │ Update Doc  │
                                            └─────────────┘
```

---

## 🔄 Project Lifecycle State Machine

```
                         ┌──────────────┐
                         │   START      │
                         └──────┬───────┘
                                │
                                ▼
                    ┌────────────────────┐
                    │   SURVEY           │
                    │ 🔍 Site Assessment │
                    └────────┬───────────┘
                             │
                    ┌────────▼──────────────┐
                    │ Survey Complete?     │
                    │ Yes ↓ / No → (stay)  │
                    └────────┬──────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │ ENGINEER ASSIGNED            │
              │ 👨‍💼 Waiting for Assignment   │
              └───────────┬──────────────────┘
                          │
                 ┌────────▼──────────┐
                 │ Engineer Chosen?  │
                 │ Yes ↓ / No → stay │
                 └────────┬──────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │ INSTALLATION                   │
         │ 🔧 Active Installation Phase   │
         ├────────────────────────────────┤
         │ States:                        │
         │ - Not Started                  │
         │ - In Progress (0-100%)         │
         │ - On Hold                      │
         │ - Completed                    │
         └────────────┬───────────────────┘
                      │
             ┌────────▼────────┐
             │ Installation    │
             │ Complete?       │
             │ Yes ↓ / No stay │
             └────────┬────────┘
                      │
                      ▼
       ┌──────────────────────────────┐
       │ TESTING                      │
       │ ✅ Testing & Commissioning   │
       ├──────────────────────────────┤
       │ States:                      │
       │ - Not Started                │
       │ - In Progress                │
       │ - Passed ✓                   │
       │ - Failed ✗                   │
       └────────┬─────────────────────┘
                │
        ┌───────▼──────────┐
        │ Tests Passed?    │
        │ Yes ↓ / No ← (redo)
        └───────┬──────────┘
                │
                ▼
       ┌────────────────────┐
       │ GO-LIVE            │
       │ 🚀 Customer Active │
       ├────────────────────┤
       │ States:            │
       │ - Scheduled        │
       │ - Live             │
       └────────┬───────────┘
                │
        ┌───────▼──────────┐
        │ Go-Live Ready?   │
        │ Yes ↓            │
        └───────┬──────────┘
                │
                ▼
        ┌──────────────────┐
        │ COMPLETED        │
        │ ✔️ Project Done  │
        └──────────────────┘


Alternative Paths:
┌─────────────────────────────────┐
│ From Any Stage: On Hold ⏸️      │
│ From Any Stage: Cancelled ❌    │
└─────────────────────────────────┘
```

---

## 🔐 Role-Based Access Control Matrix

```
┌─────────────────────────────────────────────────────────────────────┐
│               ROLE-BASED ACCESS CONTROL MATRIX                     │
├────────────────┬──────┬───────┬──────────┬────────┬──────────────┤
│ Operation      │Admin │Sales  │Engineer  │Support │User (Customer)
├────────────────┼──────┼───────┼──────────┼────────┼──────────────┤
│ Create Project │  ✅  │  ✅   │    ❌    │  ❌    │     ❌      │
│ View All       │  ✅  │  ✅   │  ✅ Own  │  ✅    │     ❌      │
│ Update Survey  │  ✅  │  ❌   │  ✅      │  ❌    │     ❌      │
│ Assign Eng.    │  ✅  │  ✅   │    ❌    │  ❌    │     ❌      │
│ Update Install │  ✅  │  ❌   │  ✅      │  ❌    │     ❌      │
│ Update Testing │  ✅  │  ❌   │  ✅      │  ❌    │     ❌      │
│ Go-Live        │  ✅  │  ❌   │  ✅      │  ❌    │     ❌      │
│ Complete       │  ✅  │  ✅   │    ❌    │  ❌    │     ❌      │
│ Change Status  │  ✅  │  ❌   │    ❌    │  ❌    │     ❌      │
│ Add Notes      │  ✅  │  ✅   │  ✅      │  ✅    │     ❌      │
│ Delete         │  ✅  │  ❌   │    ❌    │  ❌    │     ❌      │
└────────────────┴──────┴───────┴──────────┴────────┴──────────────┘
```

---

## 📱 Component Hierarchy

```
App.js
│
├── Routes
│   ├── /admin/projects
│   │   └── ProtectedRoute (role="admin")
│   │       └── ProjectTracking (Main Component)
│   │           ├── Statistics Section
│   │           │   ├── Total Card
│   │           │   ├── Completed Card
│   │           │   ├── In-Progress Card
│   │           │   └── Pending Card
│   │           │
│   │           ├── Filters Section
│   │           │   ├── Search Input
│   │           │   ├── Status Dropdown
│   │           │   └── Priority Dropdown
│   │           │
│   │           ├── Projects Table
│   │           │   ├── Header Row
│   │           │   ├── Project Rows (map)
│   │           │   └── Empty State
│   │           │
│   │           └── Modals
│   │               ├── CreateProjectModal
│   │               ├── SurveyModal
│   │               ├── EngineerAssignModal
│   │               └── DetailViewModal
│   │
│   └── Other Routes...
│
└── Navbar
    └── Menu Items
        └── 🔧 Installation Tracking
```

---

## 🔌 API Endpoint Flow

```
╔════════════════════════════════════════════════════════════════════╗
║                    API ENDPOINT ARCHITECTURE                       ║
╚════════════════════════════════════════════════════════════════════╝

GET /api/projects
│
├─→ Auth Middleware (check JWT)
│   ├─→ Valid ✓ → Continue
│   └─→ Invalid ✗ → 401 Unauthorized
│
├─→ Get Query Parameters (status, priority, search, etc.)
│
├─→ Build MongoDB Query
│   └─→ Apply Filters
│
├─→ Execute Query
│   └─→ Populate References (users, etc.)
│
├─→ Return Results
│   └─→ [Project Array]
│
└─→ Error Handling
    └─→ Return 500 + Error Message

───────────────────────────────────────────────────────────────────────

PATCH /api/projects/:id/survey
│
├─→ Auth Middleware (check JWT)
│   ├─→ Valid ✓ → Continue
│   └─→ Invalid ✗ → 401
│
├─→ Role Middleware (check role = admin|engineer)
│   ├─→ Valid ✓ → Continue
│   └─→ Invalid ✗ → 403 Forbidden
│
├─→ Validate Request Body
│   ├─→ Check Required Fields
│   └─→ Type Validation
│
├─→ Find Project by ID
│   ├─→ Found ✓ → Continue
│   └─→ Not Found ✗ → 404
│
├─→ Update Survey Data
│   ├─→ Set survey fields
│   ├─→ Change status to "engineer_assigned"
│   └─→ Record surveyor info
│
├─→ Save to MongoDB
│   ├─→ Success ✓ → Return updated project
│   └─→ Error ✗ → Return 500 + error
│
└─→ Error Handling
    └─→ Return error with message

───────────────────────────────────────────────────────────────────────

POST /api/projects/:id/notes
│
├─→ Auth Middleware (check JWT) ✓
│
├─→ No Role Check (all authenticated users can add notes)
│
├─→ Validate Request
│   ├─→ Check content field exists
│   └─→ Validate content is string
│
├─→ Find Project
│   ├─→ Found ✓ → Continue
│   └─→ Not Found ✗ → 404
│
├─→ Append Note
│   ├─→ Set author from req.user
│   ├─→ Set content
│   └─→ Add timestamp
│
├─→ Save Update
│   ├─→ Success ✓ → Return project with new note
│   └─→ Error ✗ → 500
│
└─→ Error Handling
    └─→ Return error message
```

---

## 📊 Database Relationships

```
┌────────────────────────────────────────────────────────────┐
│                    MONGODB COLLECTIONS                     │
└────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌─────────────────┐
│   USER           │         │   PROJECT       │
├──────────────────┤         ├─────────────────┤
│ _id              │◄───┐    │ _id             │
│ firstName        │    │    │ projectName     │
│ lastName         │    ├────┤ engineerAssign. │
│ email            │    │    │   .engineerId   │
│ role             │    │    │ survey.surveyer │
│ isActive         │    │    │   ById          │
│                  │    │    │ projectManager  │
└──────────────────┘    │    │ customerId      │
                        │    │ ... (more)      │
                        └────└─────────────────┘
                        References

┌──────────────────┐         ┌─────────────────┐
│   CUSTOMER       │         │   PROJECT       │
├──────────────────┤         ├─────────────────┤
│ _id              │◄────────┤ customerId      │
│ name             │         │ customerName    │
│ email            │         │ customerEmail   │
│ phone            │         │ customerPhone   │
│ location         │         │ location        │
│                  │         │ ... (more)      │
└──────────────────┘         └─────────────────┘


PROJECT Collection Structure:
───────────────────────────────

{
  _id: ObjectId,
  
  projectName: String,
  customerId: ObjectId → User,
  survey: {
    surveyedBy: ObjectId → User,
    ... details
  },
  engineerAssignment: {
    engineerId: ObjectId → User,
    ... details
  },
  projectManager: ObjectId → User,
  
  installation: { ... },
  testing: { ... },
  goLive: { ... },
  budget: { ... },
  timeline: { ... },
  documents: [ ... ],
  milestones: [ ... ],
  notes: [ ... ],
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Request/Response Cycle

```
USER ACTION (Frontend)
  │
  ▼
projectService Method Called
  │
  ├─→ Build Query Parameters
  ├─→ Make HTTP Request
  └─→ Handle Authorization Header
  │
  ▼
API Request to Backend
  │
  ├─→ POST/GET/PATCH/DELETE /api/projects/...
  ├─→ Headers: { Authorization: "Bearer token" }
  └─→ Body: { ...data }
  │
  ▼
Express Router Middleware Chain
  │
  ├─→ authMiddleware
  │   └─→ Verify JWT Token
  │
  ├─→ roleMiddleware (if required)
  │   └─→ Check User Role
  │
  └─→ Controller Method
      │
      ├─→ Validate Input
      ├─→ Query MongoDB
      ├─→ Process Data
      └─→ Return Response
  │
  ▼
Response to Frontend
  │
  ├─→ Status Code
  ├─→ Headers
  └─→ Body: { ...data or error }
  │
  ▼
projectService Handles Response
  │
  ├─→ Check Status Code
  ├─→ Handle Errors if any
  └─→ Return Data to Component
  │
  ▼
React Component Updates State
  │
  ├─→ setProjects(data)
  ├─→ setSuccess("message")
  └─→ setError(null)
  │
  ▼
UI Re-renders with New Data
  │
  └─→ User Sees Updated Information
```

---

## 📈 Performance Architecture

```
┌────────────────────────────────────────────────────────┐
│             PERFORMANCE OPTIMIZATION                  │
└────────────────────────────────────────────────────────┘

Frontend:
  useCallback
  ├─→ fetchProjects (memoized)
  ├─→ handleCreateProject (memoized)
  └─→ Prevents unnecessary re-renders

State Management:
  ├─→ Projects array
  ├─→ Filters state
  ├─→ Modal states
  └─→ Only update changed parts

Backend:
  MongoDB Indexes
  ├─→ customerId (fast filtering)
  ├─→ status (fast filtering)
  ├─→ engineerAssignment.engineerId
  └─→ createdAt (sorting)

  Query Optimization
  ├─→ .select() excludes password
  ├─→ .populate() with specific fields
  ├─→ .sort() uses indexed fields
  └─→ No N+1 queries

API Response:
  ├─→ Filter early (in query)
  ├─→ Paginate if needed
  ├─→ Return only needed fields
  └─→ Compress response
```

---

## 🛡️ Security Architecture

```
┌────────────────────────────────────────────────────────┐
│              SECURITY LAYERS                          │
└────────────────────────────────────────────────────────┘

Layer 1: Authentication
  ├─→ JWT Token Verification
  ├─→ Token Expiration Check
  └─→ User Identification

Layer 2: Authorization
  ├─→ Role Checking (admin, sales, engineer, support)
  ├─→ Permission Matrix
  └─→ Resource Ownership Validation

Layer 3: Input Validation
  ├─→ Type Checking
  ├─→ Required Fields
  ├─→ Enum Validation
  └─→ Sanitization

Layer 4: Data Protection
  ├─→ Exclude Sensitive Fields
  ├─→ Password Hashing (if stored)
  └─→ Token Storage (localStorage)

Layer 5: Error Handling
  ├─→ No Sensitive Data in Errors
  ├─→ Generic Error Messages
  └─→ Detailed Logging (server-side)
```

---

## 📋 Data Validation Flow

```
Create Project Request
  │
  ├─→ Frontend Validation
  │   ├─→ Check required fields present
  │   ├─→ Validate email format
  │   ├─→ Check numeric fields
  │   └─→ If invalid → Show error, stop
  │
  ├─→ Send to Backend
  │   │
  │   └─→ Backend Validation
  │       ├─→ Check body exists
  │       ├─→ Validate data types
  │       ├─→ Check required fields
  │       ├─→ Validate enum values
  │       ├─→ Range checks (capacity > 0)
  │       └─→ If invalid → Return 400 + error
  │
  ├─→ Schema Validation
  │   ├─→ Mongoose schema validation
  │   ├─→ Type casting
  │   └─→ If invalid → Return 500 error
  │
  ├─→ Save to Database
  │   ├─→ Database constraints
  │   ├─→ Index uniqueness
  │   └─→ If invalid → Return error
  │
  └─→ Return Success Response
      └─→ Project created ✓
```

---

**Version:** 1.0  
**Date:** January 27, 2026  
**System:** SuryaUrja - Green Energy Solar Solution

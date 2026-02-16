# Installation & Project Tracking System

## Overview

The Installation & Project Tracking module is a comprehensive system for managing solar energy projects from initial site survey through go-live confirmation. It tracks every stage of the installation lifecycle with professional-grade detail and reporting capabilities.

---

## System Architecture

### Project Status Workflow

```
┌─────────────┐
│ 1. SURVEY   │
└──────┬──────┘
       │
       ↓
┌─────────────────────────┐
│ 2. ENGINEER ASSIGNED    │
└──────┬──────────────────┘
       │
       ↓
┌──────────────────┐
│ 3. INSTALLATION  │ (In Progress, On Hold)
└──────┬───────────┘
       │
       ↓
┌────────────────────────────────┐
│ 4. TESTING & COMMISSIONING     │ (In Progress, Passed, Failed)
└──────┬──────────────────────────┘
       │
       ↓
┌─────────────┐
│ 5. GO-LIVE  │ (Scheduled, Live)
└──────┬──────┘
       │
       ↓
┌──────────────┐
│ COMPLETED ✓  │
└──────────────┘
```

### Role-Based Access Control

| Role       | Permissions                                                           |
|-----------|-----------------------------------------------------------------------|
| **Admin**  | Full access - create, view, edit, assign, complete all stages        |
| **Sales**  | Create projects, assign engineers, complete go-live                   |
| **Engineer** | View assigned projects, update survey, installation, testing, go-live |
| **Support** | View-only access to all projects                                      |
| **User**   | No access                                                             |

---

## Data Model

### Project Schema (Complete Structure)

```javascript
{
  // Basic Project Info
  projectName: String (required),
  description: String,
  customerId: ObjectId (ref: Customer),
  customerName: String,
  customerEmail: String,
  customerPhone: String,

  // Location Details
  location: {
    address: String,
    city: String,
    state: String,
    postalCode: String,
    coordinates: { latitude: Number, longitude: Number }
  },

  // System Specifications
  systemCapacity: Number (kW, required),
  panelCount: Number,
  inverterModel: String,
  batteryCapacity: Number (kWh),

  // Project Status
  status: String (enum: survey, engineer_assigned, installation, testing, go_live, completed, on_hold, cancelled),

  // Stage 1: Site Survey
  survey: {
    status: String (pending, completed, failed),
    surveyDate: Date,
    surveyedBy: ObjectId (ref: User),
    surveyorName: String,
    roofCondition: String,
    sunExposure: String,
    obstructions: String,
    estimatedROI: Number (%),
    estimatedMonthlyGeneration: Number (kWh),
    notes: String,
    attachments: [String] (URLs to images/docs)
  },

  // Stage 2: Engineer Assignment
  engineerAssignment: {
    engineerId: ObjectId (ref: User),
    engineerName: String,
    engineerEmail: String,
    assignedDate: Date,
    status: String (pending, assigned, accepted, rejected)
  },

  // Stage 3: Installation
  installation: {
    status: String (not_started, in_progress, on_hold, completed),
    startDate: Date,
    plannedCompletionDate: Date,
    actualCompletionDate: Date,
    progress: Number (0-100),
    activities: [{
      activity: String,
      startDate: Date,
      endDate: Date,
      status: String (pending, in_progress, completed),
      notes: String
    }],
    challenges: [String],
    safetyIncidents: [String],
    workersAssigned: [{
      workerId: ObjectId,
      workerName: String,
      role: String (electrician, installer, etc.)
    }]
  },

  // Stage 4: Testing & Commissioning
  testing: {
    status: String (not_started, in_progress, passed, failed),
    testStartDate: Date,
    testEndDate: Date,
    testResults: {
      systemOutput: Number (kW),
      gridConnection: Boolean,
      inverterStatus: String,
      batteryHealth: Number (%)
    },
    safetyTests: [{
      testName: String,
      result: String (pass/fail),
      date: Date
    }],
    issues: [{
      issue: String,
      severity: String (low, medium, high),
      status: String (open, resolved),
      resolution: String
    }],
    certifications: [String] (URLs)
  },

  // Stage 5: Go-Live
  goLive: {
    status: String (not_started, scheduled, live),
    scheduledDate: Date,
    actualGoLiveDate: Date,
    meterReading: Number,
    gridConnectionRef: String,
    netMeteringStatus: String,
    documentationComplete: Boolean,
    customerTrainingDate: Date,
    trainingTopics: [String]
  },

  // Financial Tracking
  budget: {
    totalCost: Number,
    advancePayment: Number,
    remainingPayment: Number,
    paymentStatus: String (pending, partial, completed)
  },

  // Timeline
  timeline: {
    createdDate: Date (default: now),
    targetCompletionDate: Date,
    actualCompletionDate: Date,
    daysToCompletion: Number
  },

  // Documents
  documents: [{
    docName: String,
    docType: String (quote, contract, permit, inspection_report, etc.),
    url: String,
    uploadDate: Date
  }],

  // Milestones
  milestones: [{
    milestoneName: String,
    targetDate: Date,
    completedDate: Date,
    status: String (pending, completed)
  }],

  // Management
  projectManager: ObjectId (ref: User),
  projectManagerName: String,

  // Notes & History
  notes: [{
    author: String,
    content: String,
    createdAt: Date (default: now)
  }],

  // Additional Fields
  priority: String (enum: low, normal, high, urgent, default: normal),
  tags: [String],
  isArchived: Boolean (default: false),
  timestamps: { createdAt: Date, updatedAt: Date }
}
```

---

## API Endpoints

### Base URL: `/api/projects`

All endpoints require authentication (`auth` middleware).

#### 1. Get All Projects
```
GET /
Query Parameters:
  - status: String (optional) - Filter by status
  - engineerId: String (optional) - Filter by assigned engineer
  - projectManagerId: String (optional) - Filter by project manager
  - customerId: String (optional) - Filter by customer
  - priority: String (optional) - Filter by priority
  - search: String (optional) - Search by project name or customer

Response: [Project]
Access: All authenticated users
```

#### 2. Get Project Statistics
```
GET /stats/overview

Response: {
  total: Number,
  byStatus: [{ _id: String, count: Number }],
  byPriority: [{ _id: String, count: Number }]
}
Access: All authenticated users
```

#### 3. Get Single Project
```
GET /:id

Response: Project
Access: All authenticated users
```

#### 4. Create Project
```
POST /
Body: {
  projectName: String* (required),
  description: String,
  customerId: String,
  customerName: String* (required),
  customerEmail: String* (required),
  customerPhone: String* (required),
  location: Object,
  systemCapacity: Number* (required),
  panelCount: Number,
  inverterModel: String,
  batteryCapacity: Number,
  budget: Object,
  targetCompletionDate: Date,
  projectManager: String,
  priority: String
}

Response: Project
Access: Admin, Sales only (role middleware)
```

#### 5. Update Site Survey
```
PATCH /:id/survey
Body: {
  surveyDate: Date,
  roofCondition: String,
  sunExposure: String,
  obstructions: String,
  estimatedROI: Number,
  estimatedMonthlyGeneration: Number,
  notes: String,
  attachments: [String]
}

Response: Project (with status updated to "engineer_assigned")
Access: Admin, Engineer only
```

#### 6. Assign Engineer
```
PATCH /:id/assign-engineer
Body: {
  engineerId: String (required)
}

Response: Project (with engineer assigned)
Access: Admin, Sales only
```

#### 7. Update Installation
```
PATCH /:id/installation
Body: {
  startDate: Date,
  plannedCompletionDate: Date,
  progress: Number (0-100),
  activities: Array,
  challenges: Array,
  safetyIncidents: Array,
  workersAssigned: Array
}

Response: Project (with status updated to "installation")
Access: Admin, Engineer only
```

#### 8. Update Testing & Commissioning
```
PATCH /:id/testing
Body: {
  testStartDate: Date,
  testResults: Object,
  issues: Array,
  certifications: Array,
  testPassed: Boolean
}

Response: Project (with status updated based on testPassed)
Access: Admin, Engineer only
```

#### 9. Go-Live Confirmation
```
PATCH /:id/go-live
Body: {
  scheduledDate: Date,
  meterReading: Number,
  gridConnectionRef: String,
  netMeteringStatus: String,
  documentationComplete: Boolean,
  customerTrainingDate: Date,
  trainingTopics: Array
}

Response: Project (with status updated to "go_live")
Access: Admin, Engineer only
```

#### 10. Complete Project
```
PATCH /:id/complete
Body: {
  notes: String (optional)
}

Response: Project (with status updated to "completed")
Access: Admin, Sales only
```

#### 11. Update Project Status
```
PATCH /:id/status
Body: {
  status: String (required) - One of: survey, engineer_assigned, installation, testing, go_live, completed, on_hold, cancelled
}

Response: Project
Access: Admin only
```

#### 12. Add Note to Project
```
POST /:id/notes
Body: {
  content: String (required)
}

Response: Project (with note appended)
Access: All authenticated users
```

#### 13. Delete Project
```
DELETE /:id

Response: { message: "Project deleted successfully" }
Access: Admin only
```

---

## Frontend Components

### ProjectTracking.jsx (Main Component)

**Location:** `/frontend/src/Pages/Admin/ProjectTracking.jsx`

**Features:**
- Dashboard with statistics cards
- Project list with filtering (status, priority, search)
- Quick action buttons per project
- Modals for:
  - Creating new projects
  - Completing site surveys
  - Assigning engineers
  - Viewing detailed project information

**State Management:**
```javascript
- projects: [Project]
- statistics: { total, byStatus, byPriority }
- loading: Boolean
- error: String
- success: String
- selectedProject: Project
- filters: { statusFilter, priorityFilter, searchTerm }
- engineers: [User]
```

**Key Functions:**
- `fetchProjects()` - Retrieves filtered project list
- `fetchStatistics()` - Gets project counts by status/priority
- `fetchEngineers()` - Gets list of available engineers
- `handleCreateProject()` - Creates new project
- `handleUpdateSurvey()` - Completes site survey
- `handleAssignEngineer()` - Assigns engineer to project
- `openDetailModal()` - Shows detailed project information

---

## Frontend Service (projectService.js)

**Location:** `/frontend/src/services/projectService.js`

**Methods:**
```javascript
- getAllProjects(filters)
- getProjectById(id)
- createProject(data)
- updateSiteSurvey(id, data)
- assignEngineer(id, data)
- updateInstallation(id, data)
- updateTesting(id, data)
- goLiveConfirmation(id, data)
- completeProject(id, data)
- updateProjectStatus(id, status)
- addNote(id, content)
- getProjectStats()
- deleteProject(id)
```

---

## Usage Guide

### For Admins

1. **Create Project**
   - Click "New Project" button
   - Fill in customer details and system specifications
   - Set priority and budget
   - System automatically moves to "Survey" status

2. **Track Progress**
   - View all projects in main list
   - Filter by status or priority
   - Click "View" to see full details

3. **Complete Survey**
   - Click "Survey" button on pending survey projects
   - Enter roof condition, sun exposure, estimated ROI
   - Complete survey status automatically progresses to "Engineer Assigned"

4. **Assign Engineer**
   - Click "Assign" button on projects waiting for engineer
   - Select from list of available engineers
   - Engineer receives assignment notification

5. **Monitor Installation**
   - View installation progress percentage
   - Track identified challenges and safety incidents
   - Update worker assignments

6. **Verify Testing**
   - Review test results and safety certifications
   - Mark issues as open/resolved
   - Confirm testing passed status

7. **Confirm Go-Live**
   - Verify documentation complete
   - Enter grid connection reference
   - Confirm customer training completed
   - Mark as live

### For Engineers

1. **View Assigned Projects**
   - See list of projects assigned to them
   - View project details and customer information
   - Access survey data and system specifications

2. **Complete Survey Work**
   - Visit customer site
   - Document roof condition, sun exposure, obstructions
   - Enter estimated ROI and monthly generation
   - Submit survey for review

3. **Manage Installation**
   - Log installation activities
   - Update progress percentage
   - Report challenges and safety incidents
   - Assign installation workers

4. **Conduct Testing**
   - Run system output tests
   - Verify grid connection
   - Document battery health
   - Record all safety test results
   - Upload certification documents

5. **Go-Live Verification**
   - Verify all documentation
   - Confirm meter reading
   - Monitor initial grid connection
   - Provide customer training

### For Sales/Project Managers

1. **Create Projects** - Initiate new projects with customer details
2. **Assign Engineers** - Allocate engineers based on capacity
3. **Monitor Completion** - Track projects through lifecycle
4. **Complete Projects** - Mark finished projects as completed

---

## Status Indicators & Colors

| Status | Color | Emoji | Meaning |
|--------|-------|-------|---------|
| Survey | Yellow | 🔍 | Initial site assessment phase |
| Engineer Assigned | Blue | 👨‍💼 | Waiting for engineer to start work |
| Installation | Purple | 🔧 | Active installation phase |
| Testing | Orange | ✅ | Testing and commissioning phase |
| Go-Live | Green | 🚀 | System live and operational |
| Completed | Gray | ✔️ | Project complete |
| On Hold | Red | ⏸️ | Temporarily paused |
| Cancelled | Dark Red | ❌ | Project cancelled |

---

## Priority Levels

| Priority | Color | Usage |
|----------|-------|-------|
| Low | Green | Non-urgent, flexible timelines |
| Normal | Blue | Standard priority projects |
| High | Orange | Important, needs attention |
| Urgent | Red | Critical, needs immediate action |

---

## Project Timeline Tracking

The system automatically tracks:
- Project creation date
- Target completion date
- Actual completion date
- Days to completion (calculated)

Milestone tracking allows for intermediate checkpoints between major stages.

---

## Error Handling & Validation

**Backend Validation:**
- Engineer role verification on assignment
- Status enum validation
- User existence checking
- Data type validation

**Frontend Error Handling:**
- API error messages displayed to user
- Form validation before submission
- Loading states during operations
- Success notifications on completion

---

## Security Features

1. **Authentication Required** - All endpoints require JWT token
2. **Role-Based Access** - Endpoints check user role
3. **User Identification** - Notes track author automatically
4. **Data Sanitization** - Search queries validated
5. **Audit Trail** - All changes timestamped

---

## Navigation

**Desktop Menu:**
`Profile ▾ → 🔧 Installation Tracking`

**Mobile Menu:**
`Account → 🔧 Installation Tracking`

**Direct URL:** `/admin/projects`

---

## Testing Checklist

- [ ] Create new project successfully
- [ ] Filter projects by status
- [ ] Filter projects by priority
- [ ] Search projects by name/customer
- [ ] Complete site survey
- [ ] Assign engineer to project
- [ ] View project details in modal
- [ ] Statistics cards show correct counts
- [ ] Status badges display correct colors
- [ ] Priority indicators show correctly
- [ ] Add notes to project
- [ ] View engineer list in assignment modal
- [ ] Responsive design on mobile

---

## Integration Points

### Connected Systems:
- **User Management** - Engineer assignment via roleService
- **Customer Management** - Customer link via customerId
- **Notification System** - Engineer assignment notifications (future)
- **Document Management** - File attachment storage
- **Dashboard** - Statistics display on admin dashboard

### Related Models:
- User (engineers, project managers)
- Customer (customer details)
- Booking (related solar system bookings)

---

## Performance Optimizations

1. **Indexed Queries** - MongoDB indexes on:
   - `customerId` - Fast customer filtering
   - `status` - Fast status filtering
   - `engineerAssignment.engineerId` - Fast engineer filtering
   - `createdAt` - Fast date-based sorting

2. **Pagination Ready** - Can add pagination to getAllProjects

3. **Select Queries** - Excludes sensitive fields where appropriate

---

## Future Enhancements

1. **Notifications** - Auto-notify engineers of assignments
2. **File Management** - Upload and manage project documents
3. **Image Gallery** - Progress photos during installation
4. **Time Tracking** - Log work hours per engineer
5. **Cost Tracking** - Material and labor cost management
6. **Customer Portal** - Allow customers to view project status
7. **Mobile App** - Native app for engineers in field
8. **Analytics Dashboard** - Project completion metrics
9. **Bulk Operations** - Manage multiple projects at once
10. **Export Reports** - Generate PDF/Excel project reports

---

## Support & Maintenance

**For Issues:**
1. Check browser console for API errors
2. Verify user role has required permissions
3. Ensure all required fields are filled
4. Check MongoDB connection in backend logs

**Common Issues:**
- **"Failed to fetch projects"** - Check authentication token
- **"Access denied"** - Verify user role
- **"Engineer not found"** - Ensure engineer exists and has correct role
- **"Project not found"** - Verify project ID is correct

---

## Code Files Reference

| File | Purpose | Lines |
|------|---------|-------|
| `Backend/server/models/Project.js` | Data model definition | 300+ |
| `Backend/server/controllers/projectController.js` | Business logic | 450+ |
| `Backend/server/routes/projectRoutes.js` | API endpoints | 50 |
| `Frontend/src/services/projectService.js` | API client | 75 |
| `Frontend/src/Pages/Admin/ProjectTracking.jsx` | Main UI component | 700+ |
| `Frontend/src/App.js` | Route configuration | 1 route added |
| `Frontend/src/Components/Navbar.jsx` | Navigation menu | 2 items added |
| `Backend/Server.js` | Server registration | 1 line added |

---

**Last Updated:** January 27, 2026
**Version:** 1.0
**Status:** Production Ready

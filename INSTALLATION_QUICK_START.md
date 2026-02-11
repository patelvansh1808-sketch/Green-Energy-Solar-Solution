# Quick Start: Installation & Project Tracking

## What's Been Added

### ✅ Backend (4 Files)
1. **Installation Model** (`Backend/server/models/Installation.js`)
   - Tracks projects from survey → live
   - Statuses: survey_pending → survey_scheduled → engineer_assigned → install_in_progress → commissioning_done → live
   - Stores progress logs and stage details

2. **Installation Controller** (`Backend/server/controllers/installationController.js`)
   - 7 API endpoints for CRUD and status management
   - `createProject()`, `listProjects()`, `getProject()`
   - `assignEngineer()`, `updateProgress()`, `markCommissioned()`, `markLive()`

3. **Installation Routes** (`Backend/server/routes/installationRoutes.js`)
   - Role-based access control on all endpoints
   - Mounted at `/api/installations`

4. **Updated Server.js**
   - Wired installation routes into main app

### ✅ Frontend (2 Files)
1. **User Installation Tracking** (`Frontend/src/Pages/User/InstallationTracking.jsx`)
   - End-users see their projects and progress
   - Can update progress, view history, monitor stages

2. **Admin Installation Dashboard** (`Frontend/src/Pages/Admin/InstallationDashboard.jsx`)
   - Full project management
   - Create projects, assign engineers
   - Track all projects with stats and filters
   - Status overview dashboard

---

## How to Use

### 1. **Start Backend**
```bash
cd Backend
npm install  # if needed
node Server.js
```
Server will start on http://localhost:5000
New route: `/api/installations`

### 2. **Start Frontend**
```bash
cd Frontend
npm start
```
App runs on http://localhost:3000

### 3. **Access Features**

**As End User:**
- Navigate to **User Menu → Installation Tracking**
- View your assigned projects
- Monitor progress and status

**As Admin/Sales:**
- Navigate to **Admin → Installation Dashboard**
- Create new projects
- Assign engineers
- View all projects with stats

---

## API Reference

### Create Project
```
POST /api/installations
Headers: Authorization: Bearer <token>
Body: {
  "customerId": "customer_id",
  "leadId": "lead_id",
  "surveyDate": "2024-12-15T10:00:00Z",
  "surveyNotes": "Notes about site survey"
}
```
**Access:** Admin, Sales

### List Projects
```
GET /api/installations
Headers: Authorization: Bearer <token>
```
**Access:** All authenticated users

### Assign Engineer
```
PATCH /api/installations/:projectId/assign-engineer
Headers: Authorization: Bearer <token>
Body: { "engineerId": "engineer_id" }
```
**Access:** Admin, Sales

### Update Progress
```
PATCH /api/installations/:projectId/progress
Headers: Authorization: Bearer <token>
Body: { "percent": 45, "note": "In progress..." }
```
**Access:** Admin, Engineer

### Mark Commissioning Done
```
PATCH /api/installations/:projectId/commission
Headers: Authorization: Bearer <token>
Body: { "notes": "All tests passed" }
```
**Access:** Admin, Engineer

### Confirm Go-Live
```
PATCH /api/installations/:projectId/live
Headers: Authorization: Bearer <token>
```
**Access:** Admin only

---

## Project Lifecycle

```
1. Survey Pending
   └─ Admin/Sales creates project
   
2. Survey Scheduled
   └─ Survey date and notes recorded
   
3. Engineer Assigned
   └─ Engineer selected from roster
   
4. Installation In Progress
   └─ Engineer updates progress 0-100%
   └─ Progress logs tracked
   
5. Commissioning Done
   └─ Testing and validation complete
   
6. Live
   └─ Admin confirms go-live
   └─ System in production
```

---

## Role Permissions Matrix

| Operation | Admin | Sales | Engineer | Support |
|-----------|-------|-------|----------|---------|
| Create Project | ✅ | ✅ | ❌ | ❌ |
| Assign Engineer | ✅ | ✅ | ❌ | ❌ |
| Update Progress | ✅ | ❌ | ✅ | ❌ |
| Mark Commissioned | ✅ | ❌ | ✅ | ❌ |
| Go-Live Confirm | ✅ | ❌ | ❌ | ❌ |
| View Projects | ✅ | ✅ | ✅ | ✅ |

---

## Testing Scenarios

### Scenario 1: Create & Assign Project
1. Login as Admin/Sales
2. Go to Admin Dashboard
3. Click "+ New Project"
4. Fill customer ID and survey details
5. Submit form
6. Project appears in list
7. Click project → Assign Engineer dropdown
8. Select engineer, status updates to "Engineer Assigned"
✅ **Status:** PASS

### Scenario 2: Engineer Updates Progress
1. Login as Engineer
2. Go to Installation Tracking
3. Select assigned project
4. Update progress to 50%
5. Add note: "Panels installed"
6. Submit
7. Progress bar updates, note logged
✅ **Status:** PASS

### Scenario 3: Commission & Go-Live
1. Engineer updates progress to 90%+
2. Click "Mark Commissioned"
3. Add testing notes
4. Submit
5. Status changes to "Commissioning Done"
6. Admin sees "Confirm Go Live" button
7. Admin clicks button
8. Status becomes "Live"
✅ **Status:** PASS

---

## Troubleshooting

**"401 Not authorized" error**
- Check JWT token in localStorage
- Ensure Authorization header has "Bearer " prefix
- Token may have expired, logout and login again

**"Insufficient permissions" error**
- Your role doesn't have access to this action
- Refer to permissions matrix above
- Contact admin to change role

**Projects not loading**
- Check network tab in browser DevTools
- Verify backend is running (`npm start` or `node Server.js`)
- Check /api/installations endpoint responds

**Engineer list empty**
- No users with "engineer" role exist
- Admin should create/assign engineer role to users

---

## File Structure Summary

```
Backend/
├── server/
│   ├── models/
│   │   └── Installation.js ✅ NEW
│   ├── controllers/
│   │   └── installationController.js ✅ NEW
│   └── routes/
│       └── installationRoutes.js ✅ NEW
└── Server.js ✅ MODIFIED (added route mount)

Frontend/
└── src/Pages/
    ├── User/
    │   └── InstallationTracking.jsx ✅ NEW
    └── Admin/
        └── InstallationDashboard.jsx ✅ NEW
```

---

## Next Steps

1. ✅ Backend installation endpoints ready
2. ✅ Frontend user tracking page ready
3. ✅ Admin dashboard ready
4. 📋 **TODO:** Add to navigation menus (Nav component)
5. 📋 **TODO:** Connect to booking/lead creation flow
6. 📋 **TODO:** Add email notifications for status changes
7. 📋 **TODO:** Implement document upload for surveys

---

## Support

For issues or questions:
1. Check error messages in browser Console (F12)
2. Review network tab for API response codes
3. Verify JWT token exists in localStorage
4. Ensure user has proper role permissions
5. Check backend logs for database errors

---

**Last Updated:** December 2024  
**Status:** ✅ Ready for Testing & Integration

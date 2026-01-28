# Installation & Project Tracking - Quick Reference Guide

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────┐
│        INSTALLATION & PROJECT TRACKING SYSTEM           │
│                                                         │
│  5 Major Stages | 13 API Endpoints | Full RBAC         │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Project Lifecycle

```
START
  │
  ├─→ [SURVEY] 🔍
  │   └─→ Site assessment
  │   └─→ ROI calculation
  │
  ├─→ [ENGINEER ASSIGNED] 👨‍💼
  │   └─→ Select engineer
  │   └─→ Assign resources
  │
  ├─→ [INSTALLATION] 🔧
  │   ├─→ In Progress
  │   ├─→ On Hold
  │   └─→ Track workers & progress
  │
  ├─→ [TESTING] ✅
  │   ├─→ In Progress
  │   ├─→ Passed ✓
  │   └─→ Failed ✗
  │
  ├─→ [GO-LIVE] 🚀
  │   ├─→ Scheduled
  │   └─→ Live
  │
  └─→ [COMPLETED] ✔️
       └─→ Project finished
```

---

## 🔐 Who Can Do What

### Admin 👨‍💼
```
✅ Create projects
✅ View all projects
✅ Complete surveys
✅ Assign engineers
✅ Update installation
✅ Update testing
✅ Confirm go-live
✅ Complete projects
✅ Update status
✅ Delete projects
```

### Sales 💼
```
✅ Create projects
✅ View all projects
✅ Assign engineers
✅ Complete projects
❌ Cannot: Do technical work
```

### Engineer 🔧
```
✅ View assigned projects
✅ Complete surveys
✅ Update installation
✅ Update testing
✅ Confirm go-live
✅ Add notes
❌ Cannot: Create/delete projects
```

### Support 📞
```
✅ View all projects
✅ Add notes
❌ Cannot: Modify project details
```

---

## 📱 How to Use

### Creating a Project

1. Go to: Profile → 🔧 Installation Tracking
2. Click: "+ New Project" button
3. Fill in:
   - Project name
   - Customer name, email, phone
   - System capacity (kW)
   - Location details
   - Budget
4. Click: "Create Project"
5. ✅ Status: Automatically set to "Survey"

### Completing Site Survey

1. Find project with status: 🔍 Site Survey
2. Click: "Survey" button
3. Enter:
   - Survey date
   - Roof condition
   - Sun exposure
   - Obstructions
   - Estimated ROI
   - Monthly generation estimate
   - Notes
4. Click: "Complete Survey"
5. ✅ Status: Automatically updated to 👨‍💼 Engineer Assigned

### Assigning an Engineer

1. Find project with status: 👨‍💼 Engineer Assigned
2. Click: "Assign" button
3. Select: Engineer from dropdown
4. Click: "Assign Engineer"
5. ✅ Status: Engineer name appears in table

### Tracking Installation

Engineers update:
- Start date
- Planned completion date
- Progress percentage (0-100%)
- Activities completed
- Challenges encountered
- Safety incidents
- Worker assignments

### Monitoring Testing

Engineers log:
- Test start date
- System output readings
- Grid connection status
- Safety test results
- Any issues found
- Certifications

### Confirming Go-Live

1. Verify all documentation complete
2. Enter:
   - Meter reading
   - Grid connection reference
   - Customer training completion
3. Mark as: "Live"
4. ✅ Status: Project is now 🚀 Go-Live

---

## 🎨 Status Colors

| 🔍 Survey | 👨‍💼 Assigned | 🔧 Install | ✅ Testing | 🚀 Go-Live | ✔️ Complete |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Yellow | Blue | Purple | Orange | Green | Gray |

---

## 🏆 Priority Levels

```
Low      → 🟢 Green    - Flexible timeline
Normal   → 🔵 Blue     - Standard timeline  
High     → 🟠 Orange   - Needs attention
Urgent   → 🔴 Red      - Immediate action
```

---

## 📊 Dashboard Statistics

```
┌─────────────────────────────────────────────────┐
│  Total: 24  │  Completed: 15  │  Installing: 6  │
│             │  Pending: 3                       │
└─────────────────────────────────────────────────┘
```

---

## 🔍 How to Filter

### By Status
```
All Status
├─ Site Survey (🔍)
├─ Engineer Assigned (👨‍💼)
├─ Installation (🔧)
├─ Testing (✅)
├─ Go-Live (🚀)
└─ Completed (✔️)
```

### By Priority
```
All Priorities
├─ Low
├─ Normal
├─ High
└─ Urgent
```

### By Search
```
Type customer name, email, project name, or city
Example: "John Smith" or "Mumbai" or "john@email.com"
```

---

## 💾 Data Stored Per Project

### Basic Info
- Project name & description
- Customer name, email, phone
- System capacity, panels, inverter

### Location
- Address, city, state, postal code
- GPS coordinates (optional)

### Financial
- Total cost
- Advance payment
- Remaining payment
- Payment status

### Survey Data
- Roof condition
- Sun exposure
- ROI estimate
- Monthly generation

### Installation
- Worker assignments
- Progress tracking
- Safety incidents
- Challenges

### Testing Results
- System output
- Safety certifications
- Issues found
- Test results

### Go-Live
- Meter reading
- Grid connection ref
- Training completion
- Customer info

---

## 📞 Quick Help

### Can't see "Installation Tracking"?
```
✓ Make sure you're logged in
✓ Verify you have Admin role
✓ Check browser is updated
✓ Clear browser cache
```

### Can't find engineer in dropdown?
```
✓ Engineer must exist in system
✓ Engineer must have "Engineer" role
✓ Engineer must be marked as "Active"
✓ Go to Role Management to add engineers
```

### Project won't update?
```
✓ Check you have permission for that action
✓ Verify all required fields are filled
✓ Check API response in browser console
✓ Ensure project ID is correct
```

---

## 🔗 Related Pages

- 👥 **Role Management** - Add/manage engineers
- 👤 **Manage Customers** - View customer database
- 📊 **Admin Dashboard** - System overview

---

## 📞 Support Contact

For issues or questions:
1. Check INSTALLATION_TRACKING_DOCUMENTATION.md for details
2. Review API endpoints documentation
3. Check browser console for error messages
4. Verify user permissions and roles

---

## 🎓 Best Practices

✅ **DO:**
- Create detailed survey notes
- Document all challenges
- Keep progress updated
- Assign engineers promptly
- Complete all safety tests
- Add notes for team communication

❌ **DON'T:**
- Delete active projects
- Leave surveys incomplete
- Assign same engineer to too many projects
- Skip testing phase
- Forget customer training

---

## 🚀 Tips & Tricks

1. **Bulk View** - Sort by status to see all pending items
2. **Priority Filter** - Focus on urgent projects first
3. **Search** - Find any project quickly by name
4. **Notes** - Use for team communication
5. **Timeline** - Track promised vs actual dates

---

## 📈 Project Workflow Example

```
Day 1: Create Project
  Status: 🔍 Survey
  
Day 2: Complete Survey
  Status: 👨‍💼 Engineer Assigned
  
Day 3: Assign Engineer
  Assigned to: John (Engineer)
  Status: 👨‍💼 Engineer Assigned
  
Day 4-10: Installation
  Status: 🔧 Installation
  Progress: 0% → 100%
  
Day 11: Testing
  Status: ✅ Testing
  Tests: Passed
  
Day 12: Go-Live
  Status: 🚀 Go-Live
  Live Date: Confirmed
  
Day 13: Complete
  Status: ✔️ Completed
  Notes: Customer satisfied
```

---

## 🔗 Files Reference

| Component | File | Purpose |
|-----------|------|---------|
| **Model** | `Backend/server/models/Project.js` | Database schema |
| **Logic** | `Backend/server/controllers/projectController.js` | Business logic |
| **Routes** | `Backend/server/routes/projectRoutes.js` | API endpoints |
| **Service** | `Frontend/src/services/projectService.js` | API client |
| **UI** | `Frontend/src/Pages/Admin/ProjectTracking.jsx` | Interface |
| **Docs** | `INSTALLATION_TRACKING_DOCUMENTATION.md` | Full documentation |

---

## ⚡ Performance Tips

1. **Filters** - Use status/priority filter before searching
2. **Search** - More specific search = faster results
3. **Pagination** - System handles large lists efficiently
4. **Caching** - Engineers list cached for fast assignment
5. **Indexing** - Queries optimized with MongoDB indexes

---

**Last Updated:** January 27, 2026
**Version:** 1.0
**Language:** English (Global)

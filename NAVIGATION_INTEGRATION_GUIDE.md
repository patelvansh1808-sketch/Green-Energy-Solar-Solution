# Installation & Project Tracking - Navigation Integration Guide

## Overview
This document guides how to integrate the Installation & Project Tracking module into the existing navigation system.

---

## Current Navigation Structure

### Frontend Navigation Components
```
Frontend/src/
├── Components/
│   ├── Navbar.jsx (Main navigation for authenticated users)
│   └── Footer.jsx
├── Pages/
│   ├── User/
│   │   ├── Dashboard.jsx
│   │   ├── Booking.jsx
│   │   ├── Messages.jsx
│   │   ├── Notifications.jsx
│   │   ├── Profile.jsx
│   │   ├── Alerts.jsx
│   │   ├── Recommendations.jsx
│   │   ├── SubsidyEligibility.jsx
│   │   ├── SubsidyStatus.jsx
│   │   ├── ApplyForSubsidy.jsx
│   │   ├── BookingStatus.jsx
│   │   └── InstallationTracking.jsx ← NEW
│   │
│   └── Admin/
│       ├── AdminDashboard.jsx
│       ├── ManageUsers.jsx
│       ├── ManageBookings.jsx
│       ├── ManageCustomers.jsx
│       ├── ManageSubsidyApplications.jsx
│       ├── SystemAnalytics.jsx
│       ├── SubsidyRules.jsx
│       └── InstallationDashboard.jsx ← NEW
│
└── App.js (Route configuration)
```

---

## Navigation Integration Steps

### Step 1: Update User Navigation (Navbar.jsx)

**Location**: `Frontend/src/Components/Navbar.jsx`

**What to Add**:
Add a new menu item in the user dropdown menu for "Installation Tracking"

**Example Addition**:
```javascript
// In your user menu items, add:
{
  label: "Installation Tracking",
  path: "/user/installation-tracking",
  icon: "📦", // or use icon library
  roles: ["admin", "sales", "engineer", "support"] // All roles can view
}
```

**Implementation Approach**:
- Find the section where user menu items are defined
- Add a new link/button for Installation Tracking
- Point to route path `/user/installation-tracking`
- Ensure it appears in all authenticated user menus

---

### Step 2: Update Admin Navigation (AdminDashboard.jsx or Navbar)

**Location**: `Frontend/src/Pages/Admin/AdminDashboard.jsx` or similar admin nav

**What to Add**:
Add a new menu item in the admin section for "Installation Dashboard"

**Example Addition**:
```javascript
// In admin menu items, add:
{
  label: "Installation Projects",
  path: "/admin/installation-dashboard",
  icon: "🏗️", // or use icon library
  roles: ["admin", "sales"], // Admin and Sales can create/manage
  description: "Manage installation projects and assignments"
}
```

**Implementation Approach**:
- Find the admin menu items section
- Add a new link/button for Installation Dashboard
- Point to route path `/admin/installation-dashboard`
- Ensure it appears only for admin/sales roles

---

### Step 3: Update App.js Routes

**Location**: `Frontend/src/App.js`

**Current Route Structure** (Example):
```javascript
// In your route configuration, find or add:
<Route path="/user" element={<ProtectedRoute allowedRoles={['admin', 'sales', 'engineer', 'support']}>
  {/* User routes */}
</ProtectedRoute>}
/>

<Route path="/admin" element={<ProtectedRoute role="admin">
  {/* Admin routes */}
</ProtectedRoute>}
/>
```

**Routes to Add**:

```javascript
// User Installation Tracking Route
<Route path="/user/installation-tracking" element={
  <ProtectedRoute allowedRoles={['admin', 'sales', 'engineer', 'support']}>
    <InstallationTracking />
  </ProtectedRoute>
} />

// Admin Installation Dashboard Route
<Route path="/admin/installation-dashboard" element={
  <ProtectedRoute allowedRoles={['admin', 'sales']}>
    <AdminInstallationDashboard />
  </ProtectedRoute>
} />
```

**Complete Example** (in App.js):
```javascript
import InstallationTracking from './Pages/User/InstallationTracking';
import AdminInstallationDashboard from './Pages/Admin/InstallationDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes... */}

        {/* User Routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute...><Dashboard /></ProtectedRoute>} />
        <Route path="/user/booking" element={<ProtectedRoute...><Booking /></ProtectedRoute>} />
        <Route path="/user/messages" element={<ProtectedRoute...><Messages /></ProtectedRoute>} />
        {/* ... other user routes ... */}
        
        {/* Installation Tracking - NEW */}
        <Route path="/user/installation-tracking" element={
          <ProtectedRoute allowedRoles={['admin', 'sales', 'engineer', 'support']}>
            <InstallationTracking />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute...><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/manage-users" element={<ProtectedRoute...><ManageUsers /></ProtectedRoute>} />
        {/* ... other admin routes ... */}
        
        {/* Installation Dashboard - NEW */}
        <Route path="/admin/installation-dashboard" element={
          <ProtectedRoute allowedRoles={['admin', 'sales']}>
            <AdminInstallationDashboard />
          </ProtectedRoute>
        } />

        {/* 404 route... */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
```

---

## Navbar Component Example

**If using Navbar dropdown menu**:

```jsx
// In Navbar.jsx, in the user menu section:

const userMenuItems = [
  { label: "Dashboard", path: "/user/dashboard" },
  { label: "My Bookings", path: "/user/booking" },
  { label: "My Projects", path: "/user/installation-tracking" }, // ← NEW
  { label: "Subsidy Status", path: "/user/subsidy-status" },
  { label: "Messages", path: "/user/messages" },
  { label: "Notifications", path: "/user/notifications" },
  { label: "Profile", path: "/user/profile" },
  { label: "Logout", action: handleLogout }
];

// In admin menu section:
const adminMenuItems = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Manage Users", path: "/admin/manage-users" },
  { label: "Installation Projects", path: "/admin/installation-dashboard" }, // ← NEW
  { label: "Manage Bookings", path: "/admin/manage-bookings" },
  { label: "Customers", path: "/admin/manage-customers" },
  { label: "System Analytics", path: "/admin/system-analytics" },
  { label: "Logout", action: handleLogout }
];
```

---

## Role-Based Navigation Visibility

### For End Users (Non-Admin)
```
Navigation Menu
├── Dashboard
├── My Bookings
├── Installation Tracking ← NEW (if engineer/involved in projects)
├── Subsidy Status
├── Messages
├── Notifications
└── Profile
```

### For Sales/Support
```
Navigation Menu (Admin Section)
├── Admin Dashboard
├── Manage Bookings
├── Installation Projects ← NEW
├── Manage Customers
├── System Analytics
└── Users & Roles
```

### For Admin
```
Navigation Menu (Admin Section)
├── Admin Dashboard
├── Manage Users & Roles
├── Installation Projects ← NEW (Full control)
├── Manage Bookings
├── Manage Customers
├── Subsidy Rules
└── System Analytics
```

---

## Import Statements to Add

Add these imports to your component files:

**In App.js:**
```javascript
// Add to existing imports
import InstallationTracking from './Pages/User/InstallationTracking';
import AdminInstallationDashboard from './Pages/Admin/InstallationDashboard';
```

**In Navbar.jsx (if using menu items array):**
```javascript
// No new imports needed if just adding to menu items array
// But reference the path names in navigation links
```

---

## Testing Navigation Integration

### Test User Navigation
1. [ ] Login as any user
2. [ ] Check Navbar for "Installation Tracking" link
3. [ ] Click link → Should navigate to `/user/installation-tracking`
4. [ ] Page should load with project list
5. [ ] Logout and try with different role

### Test Admin Navigation
1. [ ] Login as Admin or Sales
2. [ ] Go to admin section
3. [ ] Check for "Installation Projects" link
4. [ ] Click link → Should navigate to `/admin/installation-dashboard`
5. [ ] Page should load with stats and project management
6. [ ] Try with different admin roles

### Test Route Protection
1. [ ] Try accessing `/user/installation-tracking` without auth
2. [ ] Should redirect to login
3. [ ] Try accessing `/admin/installation-dashboard` as Engineer
4. [ ] Should show permission denied or redirect
5. [ ] Verify proper role checks working

---

## Optional: Add Icons to Navigation

If using an icon library (Font Awesome, React Icons, etc.):

```javascript
import { FaBoxes, FaClipboardList } from 'react-icons/fa';

// User menu
{ 
  label: "Installation Tracking", 
  path: "/user/installation-tracking",
  icon: <FaClipboardList />, // ← Icon
  roles: ["admin", "sales", "engineer", "support"]
}

// Admin menu
{
  label: "Installation Projects",
  path: "/admin/installation-dashboard", 
  icon: <FaBoxes />, // ← Icon
  roles: ["admin", "sales"]
}
```

---

## Optional: Add Breadcrumb Navigation

If your app uses breadcrumbs:

**On Installation Tracking page:**
```
Home > User Dashboard > Installation Tracking
```

**On Admin Installation Dashboard:**
```
Home > Admin > Installation Projects
```

---

## Verification Checklist

After integration:

- [ ] Installation Tracking appears in user menu
- [ ] Installation Projects appears in admin menu
- [ ] Links navigate to correct pages
- [ ] Pages load without errors
- [ ] Role-based visibility working
- [ ] Unlogged users see login page
- [ ] Wrong roles see permission error
- [ ] Can create project from admin page
- [ ] Can view project from user page
- [ ] Progress updates work
- [ ] Status filters work
- [ ] All features accessible

---

## Troubleshooting Integration Issues

### Issue: "Module not found" error
**Solution**: Ensure import paths are correct:
```javascript
// Correct:
import InstallationTracking from './Pages/User/InstallationTracking';

// Check file exists at:
Frontend/src/Pages/User/InstallationTracking.jsx
```

### Issue: Route not working
**Solution**: Verify route syntax:
```javascript
// Make sure ProtectedRoute wrapping is correct
<Route path="/user/installation-tracking" element={
  <ProtectedRoute allowedRoles={['admin', 'sales', 'engineer', 'support']}>
    <InstallationTracking />
  </ProtectedRoute>
} />
```

### Issue: Page loads but blank
**Solution**: Check API endpoint:
```javascript
// Verify /api/installations endpoint is running
// Check browser console for errors
// Verify JWT token in localStorage
```

### Issue: Permission denied when should have access
**Solution**: Verify role permissions:
```javascript
// Check user.role matches required roles
// Verify authContext has correct role
// Check ProtectedRoute allowedRoles array
```

---

## Navigation Menu Structure Reference

### Typical User Menu Structure (After Integration)
```
┌─────────────────────────────┐
│   User Menu (Top Right)     │
├─────────────────────────────┤
│ 👤 Dashboard                │
│ 📋 My Bookings              │
│ 📦 Installation Tracking ← NEW
│ 💰 Subsidy Status           │
│ 💬 Messages                 │
│ 🔔 Notifications            │
│ ⚙️ Profile                  │
│ 🚪 Logout                   │
└─────────────────────────────┘
```

### Typical Admin Menu Structure (After Integration)
```
┌─────────────────────────────────┐
│   Admin Menu (Left Sidebar)     │
├─────────────────────────────────┤
│ 📊 Admin Dashboard              │
│ 👥 Manage Users                 │
│ 🏗️ Installation Projects ← NEW  │
│ 📅 Manage Bookings              │
│ 🏘️ Manage Customers             │
│ 📈 System Analytics             │
│ ⚙️ System Settings              │
│ 🚪 Logout                       │
└─────────────────────────────────┘
```

---

## Summary

The Installation & Project Tracking module is production-ready. To make it accessible:

1. **Add routes** in `App.js` (3 lines of code)
2. **Update navigation** menu items (2 menu items)
3. **Import components** (2 import statements)
4. **Test functionality** (quick smoke test)

**Time to integrate**: ~15-30 minutes  
**Complexity**: Low  
**Risk**: Minimal (isolated feature)  

---

**Next Steps**:
1. Review the routes structure in your App.js
2. Decide on menu placement (dropdown, sidebar, etc.)
3. Implement the 3 changes above
4. Test the navigation and page loads
5. Deploy when ready

---

**Questions?** Refer to:
- INSTALLATION_TRACKING_IMPLEMENTATION.md - How it works
- INSTALLATION_QUICK_START.md - Usage guide
- Code files themselves - Inline comments

**Status**: Ready for navigation integration ✅

# 🏢 Role-Based Access Control (RBAC) System
## In-House Staff Management Only

---

## 📋 Role Hierarchy

### 1. 👑 **Admin** (Super User)
**Full System Access**
- Complete control over all system features
- User & role management
- System configuration
- Analytics & reports access
- Cannot demote self from admin role (safety measure)

**Permissions:**
- ✅ All user management (create, edit, delete, activate/deactivate)
- ✅ All customer management
- ✅ All booking management
- ✅ All subsidy management
- ✅ Role assignment & modification
- ✅ System analytics & reports
- ✅ Configuration & settings

---

### 2. 💼 **Sales** (Sales Team)
**Customer & Revenue Focus**

**Permissions:**
- ✅ View & manage customers
- ✅ Create & edit customer profiles
- ✅ View & create bookings
- ✅ Edit booking details
- ✅ Assign engineers to projects
- ✅ View sales analytics
- ✅ Generate sales reports
- ✅ Support ticket viewing
- ✅ Lead management (CRM)
- ❌ User management
- ❌ System configuration
- ❌ Installation technical details

**Typical Tasks:**
- Customer onboarding
- Quotation generation
- Booking creation
- Follow-ups & conversions
- Sales reporting

---

### 3. 🔧 **Engineer** (Technical Team)
**Installation & Service Focus**

**Permissions:**
- ✅ View assigned bookings
- ✅ Update installation status
- ✅ Technical documentation
- ✅ Service requests
- ✅ Installation scheduling
- ✅ View customer technical details
- ✅ Generate technical reports
- ❌ Customer creation/deletion
- ❌ Pricing modifications
- ❌ User management
- ❌ System configuration

**Typical Tasks:**
- Site surveys
- Installation execution
- Technical issue resolution
- System maintenance
- Quality checks

---

### 4. 🎧 **Support** (Customer Support)
**Customer Service Focus**

**Permissions:**
- ✅ View customer profiles
- ✅ Manage support tickets
- ✅ View booking details
- ✅ Update ticket status
- ✅ Customer communication
- ✅ View service history
- ❌ Customer creation/deletion
- ❌ Booking creation/modification
- ❌ User management
- ❌ Pricing access
- ❌ System configuration

**Typical Tasks:**
- Ticket resolution
- Customer queries
- Service scheduling
- Complaint handling
- Follow-up calls

---

### 5. 👤 **User** (End Customer)
**Limited Customer Portal Access**

**Permissions:**
- ✅ View own profile
- ✅ Create bookings
- ✅ View own bookings
- ✅ Apply for subsidies
- ✅ View subsidy status
- ✅ Access recommendations
- ✅ View notifications
- ❌ All admin features
- ❌ View other customers
- ❌ Staff operations

---

## 🔐 Permission Matrix

| Feature                    | Admin | Sales | Engineer | Support | User |
|---------------------------|-------|-------|----------|---------|------|
| **User Management**        |       |       |          |         |      |
| View all users            | ✅    | ❌    | ❌       | ❌      | ❌   |
| Create staff users        | ✅    | ❌    | ❌       | ❌      | ❌   |
| Edit user roles           | ✅    | ❌    | ❌       | ❌      | ❌   |
| Activate/Deactivate users | ✅    | ❌    | ❌       | ❌      | ❌   |
|                           |       |       |          |         |      |
| **Customer Management**    |       |       |          |         |      |
| View customers            | ✅    | ✅    | ⚠️       | ✅      | ❌   |
| Create customers          | ✅    | ✅    | ❌       | ❌      | ❌   |
| Edit customers            | ✅    | ✅    | ❌       | ❌      | ❌   |
| Delete customers          | ✅    | ❌    | ❌       | ❌      | ❌   |
|                           |       |       |          |         |      |
| **Booking Management**     |       |       |          |         |      |
| View all bookings         | ✅    | ✅    | ✅       | ⚠️      | ❌   |
| Create bookings           | ✅    | ✅    | ❌       | ❌      | ✅   |
| Edit bookings             | ✅    | ✅    | ✅       | ❌      | ❌   |
| Delete bookings           | ✅    | ❌    | ❌       | ❌      | ❌   |
| Assign engineers          | ✅    | ✅    | ❌       | ❌      | ❌   |
|                           |       |       |          |         |      |
| **Installation**           |       |       |          |         |      |
| View installations        | ✅    | ✅    | ✅       | ❌      | ❌   |
| Manage installations      | ✅    | ❌    | ✅       | ❌      | ❌   |
| Update installation status| ✅    | ❌    | ✅       | ❌      | ❌   |
|                           |       |       |          |         |      |
| **Support & Tickets**      |       |       |          |         |      |
| View all tickets          | ✅    | ✅    | ❌       | ✅      | ❌   |
| Manage tickets            | ✅    | ❌    | ❌       | ✅      | ❌   |
| Resolve tickets           | ✅    | ❌    | ❌       | ✅      | ❌   |
|                           |       |       |          |         |      |
| **Analytics & Reports**    |       |       |          |         |      |
| View analytics            | ✅    | ✅    | ❌       | ❌      | ❌   |
| Generate reports          | ✅    | ✅    | ✅       | ❌      | ❌   |
|                           |       |       |          |         |      |
| **System Settings**        |       |       |          |         |      |
| View settings             | ✅    | ❌    | ❌       | ❌      | ❌   |
| Edit settings             | ✅    | ❌    | ❌       | ❌      | ❌   |

**Legend:**
- ✅ Full Access
- ⚠️ Limited/Read-only Access
- ❌ No Access

---

## 🛡️ Security Features

### 1. **Self-Protection**
- Admins cannot demote themselves
- Users cannot deactivate their own accounts
- Prevents accidental lockouts

### 2. **Role Validation**
- All role changes validated server-side
- Invalid roles rejected
- Enum-based role enforcement

### 3. **Active Status Control**
- Inactive users cannot log in
- Prevents unauthorized access
- Soft delete implementation

### 4. **Permission Middleware**
- Route-level protection
- Permission-based access control
- Automatic admin bypass for all staff features

---

## 📁 Implementation Files

### Backend
```
Backend/
├── server/
│   ├── models/
│   │   └── User.js (Updated with role fields)
│   ├── controllers/
│   │   └── roleController.js (NEW - Role management logic)
│   ├── routes/
│   │   └── roleRoutes.js (NEW - Role API endpoints)
│   └── middleware/
│       └── roleMiddleware.js (Enhanced RBAC middleware)
```

### Frontend
```
Frontend/
├── src/
│   ├── Pages/
│   │   └── Admin/
│   │       └── RoleManagement.jsx (NEW - Role management UI)
│   └── services/
│       └── roleService.js (NEW - Role API client)
```

---

## 🚀 API Endpoints

### Role Management (`/api/roles`)

| Method | Endpoint                        | Description              | Access |
|--------|--------------------------------|--------------------------|--------|
| GET    | `/users`                       | Get all users (filtered) | Admin  |
| GET    | `/statistics`                  | Get role statistics      | Admin  |
| POST   | `/staff`                       | Create staff user        | Admin  |
| PATCH  | `/users/:id/role`              | Update user role         | Admin  |
| PATCH  | `/users/:id/toggle-status`     | Toggle active status     | Admin  |

---

## 💡 Usage Guide

### Creating a New Staff Member

1. **Navigate to Role Management**
   - Login as Admin
   - Go to Admin Dashboard → Role Management

2. **Click "Add Staff User"**
   - Fill in personal details (First Name, Last Name, Email)
   - Set secure password (min 8 characters)
   - Select role (Sales, Engineer, Support, or Admin)
   - Optional: Add department, phone, location

3. **User Receives Credentials**
   - Email address is their username
   - Password set by admin
   - User should change password on first login

### Modifying User Roles

1. **Find User in Table**
   - Use search or filters
   - Click "Edit" on user row

2. **Update Role/Department**
   - Change role from dropdown
   - Update department if needed
   - Toggle active status

3. **Changes Take Effect Immediately**
   - User permissions updated
   - User must re-login to see changes

### Deactivating Users

- Click "Deactivate" on user row
- User cannot log in while inactive
- Can be reactivated anytime
- Preserves all user data

---

## 🎯 Best Practices

### 1. **Principle of Least Privilege**
- Assign minimum necessary permissions
- Start with lower roles, promote as needed
- Regular role audits

### 2. **Role Assignment**
- **Sales**: Customer-facing, revenue focus
- **Engineer**: Technical execution
- **Support**: Post-sale service
- **Admin**: System management only

### 3. **Security**
- Strong password policies
- Regular access reviews
- Immediate deactivation on termination
- Monitor admin actions

### 4. **Documentation**
- Document role changes
- Maintain audit trail
- Clear role descriptions

---

## 📊 Statistics Dashboard

The role management page shows:
- **Total Users**: All registered users
- **Active Users**: Currently active accounts
- **Inactive Users**: Deactivated accounts
- **Admins**: Count of admin users
- **Staff**: Count of sales + engineer + support

---

## 🔄 Workflow Examples

### New Sales Team Member
```
1. Admin creates staff user
2. Role: Sales
3. Department: Sales
4. User logs in
5. Can access:
   - Customer management
   - Booking creation
   - Sales analytics
   - Lead management
```

### Engineer Assignment
```
1. Sales creates booking
2. Admin/Sales assigns engineer
3. Engineer receives notification
4. Engineer updates installation status
5. Customer sees progress
```

### Support Ticket Flow
```
1. Customer raises ticket
2. Support team sees notification
3. Support assigns to specialist
4. Support updates resolution
5. Customer receives notification
```

---

## 🆘 Troubleshooting

### "Access Denied" Errors
- Check user's current role
- Verify route permissions
- Ensure user is active

### Cannot Change Own Role
- By design for admins
- Another admin must change
- Prevents self-lockout

### User Cannot Login
- Check active status
- Verify credentials
- Check role assignment

---

## 🎓 Training Resources

### For Admins
- User management best practices
- Security protocols
- Audit procedures

### For Sales
- CRM system usage
- Customer onboarding
- Quotation generation

### For Engineers
- Installation checklist
- Status update procedures
- Technical documentation

### For Support
- Ticket management
- Customer communication
- Escalation procedures

---

**Note:** This is an **in-house only** system. Customer users (role: "user") cannot access staff features. All role management is restricted to admin users only.

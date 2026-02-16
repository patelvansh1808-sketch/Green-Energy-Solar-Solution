# 📋 Sales Staff Workflow & Task Assignment Guide

## 🎯 Complete Process After Creating a Sales Staff User

---

## Step 1: ✅ **Create Sales Staff User** (COMPLETED)

You've successfully created a sales staff member with:
- **Role**: Sales
- **Access Level**: Customer & lead management, booking creation, sales analytics

---

## Step 2: 🎯 **Assign Leads/Tasks to Sales Staff**

### Option A: Assign Leads (Primary Method)

#### **As Admin:**

1. **Navigate to Lead Management**
   - Go to **CRM Dashboard** → **Lead Management**
   - Or directly access: `/crm/leads`

2. **View Available Leads**
   - See all leads in the system
   - Filter by status: New, Contacted, Quoted, etc.
   - Identify unassigned leads

3. **Assign Lead to Sales Person**
   - Click on a lead row
   - Click **"Assign"** or **"Assign Sales Engineer"** button
   - Select the sales person from dropdown
   - Confirm assignment

4. **Lead is Now Assigned**
   - Sales person receives notification
   - Lead appears in their "My Leads" dashboard
   - Assignment date is recorded

---

### Option B: Direct Customer Assignment

#### **As Admin:**

1. **Navigate to Customer Management**
   - Go to **Admin Dashboard** → **Manage Customers**
   - Or access: `/admin/customers`

2. **Assign Existing Customer**
   - Select customer
   - Assign to sales person for follow-up
   - Sales person can create bookings for them

3. **Sales Person Creates Booking**
   - Sales staff logs in
   - Views assigned customers
   - Creates booking/quotation
   - Manages sales pipeline

---

## Step 3: 👤 **Sales Staff View & Work on Assigned Tasks**

### **Sales Person Login & Dashboard:**

1. **Login with Credentials**
   - Use email and password set by admin
   - Role: Sales

2. **Access "My Leads" Dashboard**
   - Navigate to: **📋 My Leads** (in navbar)
   - Or go to: `/team/my-leads`

3. **View Assigned Leads**
   - See all leads assigned to them
   - View lead details, contact info
   - Check lead score and priority

4. **Work on Leads**
   - Contact customer
   - Update lead status (Contacted → Quoted)
   - Create quotations
   - Add notes and activities
   - Move to next stage

5. **Convert Lead to Customer**
   - When lead is ready to purchase
   - Click "Convert to Customer"
   - Lead becomes customer
   - Create booking for installation

---

## 📊 Complete Sales Workflow

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN: Create Sales Staff User                         │
│  Role: Sales, Department: Sales                         │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  ADMIN: Create/Import Leads                             │
│  - Manual entry via Lead Management                     │
│  - Bulk import from marketing campaigns                 │
│  - Website form submissions                             │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  ADMIN: Assign Leads to Sales Person                    │
│  - Select lead in Lead Management                       │
│  - Click "Assign Sales Engineer"                        │
│  - Choose sales person from dropdown                    │
│  - Save assignment                                      │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  SALES PERSON: View "My Leads"                          │
│  - Login to system                                      │
│  - Go to "My Leads" dashboard                           │
│  - See all assigned leads                               │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  SALES PERSON: Contact & Qualify Lead                   │
│  - Call/email customer                                  │
│  - Understand requirements                              │
│  - Update lead status to "Contacted"                    │
│  - Add notes about conversation                         │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  SALES PERSON: Create Quotation                         │
│  - Enter system size, pricing                           │
│  - Calculate ROI and savings                            │
│  - Generate quote document                              │
│  - Update lead status to "Quoted"                       │
│  - Send quote to customer                               │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  CUSTOMER: Reviews Quote                                │
│  - Receives quote via email                             │
│  - Reviews pricing and details                          │
│  - Makes decision                                       │
└─────────────────────────────────────────────────────────┘
                      ↓
          ┌───────────────────────┐
          │   ACCEPTED            │    │   REJECTED          │
          └───────────────────────┘    └───────────────────────┘
                      ↓                            ↓
┌─────────────────────────────────┐  ┌─────────────────────────┐
│  SALES: Convert to Customer     │  │  SALES: Mark as Lost    │
│  - Click "Convert"               │  │  - Update status        │
│  - Lead → Customer conversion   │  │  - Add lost reason      │
│  - Create booking               │  │  - Archive lead         │
└─────────────────────────────────┘  └─────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  SALES: Create Booking                                   │
│  - Select customer                                       │
│  - Choose solar system type                             │
│  - Set installation date                                │
│  - Assign engineer for installation                     │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  ENGINEER: Receive Assignment                            │
│  - Gets notification of new booking                      │
│  - Views installation details                            │
│  - Plans site survey and installation                    │
└─────────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────┐
│  INSTALLATION & COMPLETION                               │
│  - Engineer completes installation                       │
│  - Customer receives system                              │
│  - Sale is completed                                     │
│  - Handoff to Support team for service                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Features for Sales Staff

### **What Sales Staff Can Do:**

✅ **Lead Management**
- View assigned leads only
- Update lead status and stage
- Add notes and activities
- Create and send quotations
- Convert leads to customers
- Track lead score and priority

✅ **Customer Management**
- View and edit customer profiles
- Create new customers
- Manage customer relationships
- View customer history

✅ **Booking Creation**
- Create bookings for customers
- Select system specifications
- Set installation dates
- Assign engineers

✅ **Analytics Access**
- View personal sales metrics
- Track conversion rates
- Monitor pipeline value
- See activity reports

### **What Sales Staff CANNOT Do:**

❌ **User Management** - Cannot create/edit users
❌ **Role Assignment** - Cannot change roles
❌ **System Configuration** - No access to settings
❌ **Installation Details** - Limited technical access
❌ **View Other Sales Person's Leads** - Only their own

---

## 📱 Sales Person Daily Workflow

### **Morning Routine:**

1. **Login to System**
   - Access dashboard

2. **Check "My Leads"**
   - Review new assigned leads
   - Check notifications

3. **Prioritize Tasks**
   - High priority leads first
   - Follow-ups on quoted leads
   - Pending quotes to send

### **During Day:**

4. **Contact Leads**
   - Make calls
   - Send emails
   - Schedule meetings

5. **Update System**
   - Log call notes
   - Update lead status
   - Add next steps

6. **Create Quotes**
   - For qualified leads
   - Generate quote documents
   - Send to customers

### **Evening Routine:**

7. **Review Progress**
   - Check daily conversions
   - Plan tomorrow's tasks
   - Update manager on status

---

## 🎯 Quick Start: Assign Your First Lead

### **5-Minute Quick Start:**

1. **Go to Lead Management** (`/crm/leads`)
   
2. **Create a New Lead** (or use existing)
   - Click "+ Add Lead"
   - Enter customer details
   - Save lead

3. **Assign to Sales Person**
   - Find lead in table
   - Click "Assign" button
   - Select sales person name
   - Confirm

4. **Sales Person Logs In**
   - Goes to "My Leads"
   - Sees assigned lead
   - Starts working!

---

## 📞 Contact & Next Actions

### **What the Sales Person Should Do Next:**

1. **Check Email**
   - Receive assignment notification
   - Review lead details

2. **Login to System**
   - Access "My Leads" dashboard
   - View full lead information

3. **Contact the Lead**
   - Call or email customer
   - Introduce company
   - Understand requirements

4. **Update System**
   - Change status to "Contacted"
   - Add conversation notes
   - Set follow-up reminder

5. **Create Quotation**
   - Enter system specifications
   - Calculate pricing
   - Generate quote

6. **Follow Up**
   - Send quote to customer
   - Track quote status
   - Handle objections

7. **Close Deal**
   - Convert to customer
   - Create booking
   - Celebrate! 🎉

---

## 🛠️ System Features Used

### **Admin Side:**
- **Role Management** (`/admin/roles`) - Create sales staff
- **Lead Management** (`/crm/leads`) - Assign leads
- **CRM Dashboard** (`/crm/dashboard`) - Overview

### **Sales Side:**
- **My Leads** (`/team/my-leads`) - View assigned leads
- **Customer Management** - Create/edit customers
- **Booking** - Create installations

---

## 📊 Tracking & Reporting

### **Admin Can Track:**
- Which sales person has which leads
- Conversion rates per sales person
- Pipeline value per person
- Average time to close
- Activity levels

### **Sales Person Can Track:**
- Personal lead count
- Own conversion rate
- Pipeline value
- Personal targets
- Commission calculations

---

## 💡 Tips for Success

### **For Admin:**
- ✅ Assign leads based on sales person specialization
- ✅ Balance workload across team
- ✅ Monitor lead response times
- ✅ Provide training on system features

### **For Sales Staff:**
- ✅ Check "My Leads" daily
- ✅ Update lead status immediately after contact
- ✅ Add detailed notes for follow-ups
- ✅ Set reminders for callbacks
- ✅ Ask admin if need help with assignment

---

## 🚀 Getting Started Checklist

- [✓] Sales staff user created
- [ ] Sales person has logged in
- [ ] Admin has created/imported leads
- [ ] Admin has assigned first lead to sales person
- [ ] Sales person has viewed "My Leads"
- [ ] Sales person has contacted first lead
- [ ] Sales person has updated lead status
- [ ] Sales person has created first quote
- [ ] Sales person has converted first lead
- [ ] Sales person has created first booking

---

## 📞 Support

If you need help with:
- **Lead assignment**: Check Lead Management page
- **Sales workflow**: Review this guide
- **Technical issues**: Contact system admin
- **Training**: Request admin walkthrough

---

**Next Action**: Go to **CRM Dashboard → Lead Management** and assign your first lead to the new sales person!

# Diagram Pack (Mermaid)
## Green Energy Solar Solution

This file contains ready-to-use Mermaid diagrams for:

1. System Architecture Diagram
2. DFD Level 0
3. DFD Level 1
4. ER Diagram
5. Use Case Diagram
6. Sequence Diagram
7. Activity Diagram
8. Component Diagram
9. Deployment Diagram

---

## 1. System Architecture Diagram

```mermaid
flowchart TB
  subgraph ClientLayer[Presentation Layer]
    UI[React Frontend]
    PUB[Public Pages]
    USERD[User Dashboard]
    ADMIND[Admin/CRM Dashboard]
  end

  subgraph AppLayer[Application Layer - Node.js + Express]
    API[REST API Gateway]
    AUTH[JWT Auth + Refresh + OAuth]
    RBAC[Role-Based Access Middleware]
    BIZ[Business Modules\nBooking | Maintenance | Subsidy | Tickets | Projects | Inventory | Finance | Activity]
  end

  subgraph DataLayer[Data Layer]
    MDB[(MongoDB)]
    UP[(Uploads Storage)]
  end

  subgraph External[External Services]
    RZ[Razorpay]
    GOOG[Google OAuth]
    MAIL[Email Service]
  end

  UI --> API
  PUB --> UI
  USERD --> UI
  ADMIND --> UI

  API --> AUTH
  AUTH --> RBAC
  RBAC --> BIZ
  BIZ --> MDB
  BIZ --> UP

  AUTH --> GOOG
  BIZ --> RZ
  BIZ --> MAIL
```

---

## 2. DFD Level 0 (Context Diagram)

```mermaid
flowchart LR
  USER[Customer/User]
  ADMIN[Admin/Staff]
  PAY[Payment Gateway]
  EMAIL[Email/Notification Service]

  SYS((Green Energy Solar Solution System))

  USER -->|Register/Login, Booking, Subsidy, Ticket Requests| SYS
  SYS -->|Status, Notifications, Reports, Activity Timeline| USER

  ADMIN -->|Manage Customers, Bookings, Subsidy, Projects, Tickets| SYS
  SYS -->|Dashboards, Analytics, Operational Reports| ADMIN

  SYS -->|Create/Verify Payment Orders| PAY
  PAY -->|Payment Status/Signature| SYS

  SYS -->|Email Triggers| EMAIL
  EMAIL -->|Delivery Status| SYS
```

---

## 3. DFD Level 1

```mermaid
flowchart TB
  U[User]
  A[Admin/Staff]

  P1((1.0 Authentication))
  P2((2.0 Booking Management))
  P3((3.0 Payment Processing))
  P4((4.0 Subsidy Management))
  P5((5.0 Maintenance Management))
  P6((6.0 Ticket Management))
  P7((7.0 Project & Ops Management))
  P8((8.0 Activity & Reporting))

  D1[(Users)]
  D2[(Customers)]
  D3[(Bookings)]
  D4[(Subsidy Applications)]
  D5[(Maintenance Plans/Services)]
  D6[(Tickets)]
  D7[(Projects)]
  D8[(Inventory/Finance)]

  PG[Payment Gateway]

  U --> P1
  U --> P2
  U --> P4
  U --> P5
  U --> P6
  U --> P8

  A --> P1
  A --> P2
  A --> P4
  A --> P5
  A --> P6
  A --> P7
  A --> P8

  P1 <--> D1
  P2 <--> D2
  P2 <--> D3
  P3 <--> D3
  P4 <--> D4
  P5 <--> D5
  P6 <--> D6
  P7 <--> D7
  P7 <--> D8
  P8 <--> D3
  P8 <--> D4
  P8 <--> D5
  P8 <--> D6

  P3 <--> PG
```

---

## 4. ER Diagram

```mermaid
erDiagram
  USER {
    ObjectId _id
    string name
    string email
    string role
    string phone
    boolean isActive
  }

  CUSTOMER {
    ObjectId _id
    ObjectId userId
    string fullName
    string email
    string phone
  }

  BOOKING {
    ObjectId _id
    string bookingId
    ObjectId user
    ObjectId customer
    string systemType
    number capacity
    string status
  }

  SUBSIDY_APPLICATION {
    ObjectId _id
    ObjectId customerId
    string status
    number appliedAmount
    number approvedAmount
  }

  MAINTENANCE_PLAN {
    ObjectId _id
    ObjectId userId
    string planType
    string status
  }

  MAINTENANCE_SERVICE {
    ObjectId _id
    ObjectId userId
    ObjectId planId
    string type
    string status
    date date
  }

  TICKET {
    ObjectId _id
    string ticketNumber
    ObjectId customerId
    string category
    string priority
    string status
    ObjectId assignedTo
  }

  PROJECT {
    ObjectId _id
    ObjectId bookingId
    ObjectId customerId
    string projectName
    string status
    ObjectId projectManager
  }

  INVENTORY_ITEM {
    ObjectId _id
    string name
    string sku
    number stock
  }

  INVENTORY_MOVEMENT {
    ObjectId _id
    ObjectId itemId
    string type
    number quantity
  }

  USER ||--o{ BOOKING : creates
  USER ||--o{ MAINTENANCE_PLAN : subscribes
  USER ||--o{ MAINTENANCE_SERVICE : receives

  CUSTOMER ||--o{ SUBSIDY_APPLICATION : submits
  CUSTOMER ||--o{ TICKET : raises
  CUSTOMER ||--o{ BOOKING : linked_to

  MAINTENANCE_PLAN ||--o{ MAINTENANCE_SERVICE : includes

  BOOKING ||--o| PROJECT : converts_to

  USER ||--o{ TICKET : assigned_staff
  USER ||--o{ PROJECT : manages

  INVENTORY_ITEM ||--o{ INVENTORY_MOVEMENT : has
```

---

## 5. Use Case Diagram

```mermaid
flowchart LR
  U[User]
  ADM[Admin]
  SALES[Sales]
  ENG[Engineer/Technician]
  SUP[Support]

  UC1((Register/Login))
  UC2((Create Booking))
  UC3((Track Booking))
  UC4((Apply Subsidy))
  UC5((View Maintenance))
  UC6((Raise Support Ticket))
  UC7((View My Activity))

  UC8((Manage Users/Roles))
  UC9((Manage Customers))
  UC10((Manage Subsidy Applications))
  UC11((Manage Projects))
  UC12((Manage Inventory/Finance))
  UC13((Assign/Resolve Tickets))

  U --> UC1
  U --> UC2
  U --> UC3
  U --> UC4
  U --> UC5
  U --> UC6
  U --> UC7

  ADM --> UC8
  ADM --> UC9
  ADM --> UC10
  ADM --> UC11
  ADM --> UC12
  ADM --> UC13

  SALES --> UC9
  SALES --> UC2
  SALES --> UC3

  ENG --> UC11
  ENG --> UC5

  SUP --> UC13
```

---

## 6. Sequence Diagram (My Activity Flow)

```mermaid
sequenceDiagram
  actor User
  participant FE as Frontend (MyActivity)
  participant API as Activity API
  participant B as Booking Model
  participant M as Maintenance Models
  participant T as Ticket Model
  participant S as Subsidy Model

  User->>FE: Open My Activity page
  FE->>API: GET /api/activity/my-history?module&from&to&page&limit

  API->>B: Fetch user bookings
  B-->>API: Booking events

  API->>M: Fetch maintenance plans/services
  M-->>API: Maintenance events

  API->>T: Fetch tickets (customerId/email)
  T-->>API: Ticket events

  API->>S: Fetch subsidy applications
  S-->>API: Subsidy events

  API->>API: Normalize, merge, sort, paginate
  API-->>FE: events + summary + pagination
  FE-->>User: Render grouped timeline
```

---

## 7. Activity Diagram (Booking + Payment)

```mermaid
flowchart TD
  A([Start]) --> B[User logs in]
  B --> C[Fill booking details]
  C --> D{Data valid?}

  D -- No --> E[Show validation errors]
  E --> C

  D -- Yes --> F[Create booking record]
  F --> G{Payment required now?}

  G -- No --> H[Set status: Pending/Under Review]
  H --> I[Send notification]
  I --> Z([End])

  G -- Yes --> J[Create Razorpay order]
  J --> K[User completes payment]
  K --> L{Signature valid?}

  L -- No --> M[Mark payment failed]
  M --> N[Allow retry]
  N --> J

  L -- Yes --> O[Mark payment captured]
  O --> P[Update booking status]
  P --> Q[Generate confirmation]
  Q --> I
```

---

## 8. Component Diagram

```mermaid
flowchart TB
  subgraph Frontend
    APP[App Router]
    COMP[UI Components]
    SRV[Service Layer (Axios APIs)]
    GUARD[ProtectedRoute + Role Guard]
  end

  subgraph Backend
    ROUTES[Route Modules]
    CTRL[Controllers]
    MW[Middleware (Auth/RBAC)]
    MODELS[Mongoose Models]
    UTILS[Utils/Services (Email/PDF/Excel)]
  end

  subgraph DataAndExternal
    DB[(MongoDB)]
    RZ[Razorpay]
    OAUTH[Google OAuth]
    FILES[(Uploads)]
  end

  APP --> COMP
  APP --> GUARD
  COMP --> SRV
  SRV --> ROUTES

  ROUTES --> MW
  MW --> CTRL
  CTRL --> MODELS
  CTRL --> UTILS

  MODELS --> DB
  CTRL --> RZ
  MW --> OAUTH
  CTRL --> FILES
```

---

## 9. Deployment Diagram

```mermaid
flowchart LR
  subgraph ClientDevices
    BROWSER[Web Browser\n(User/Admin/Staff)]
  end

  subgraph CloudHost[Application Hosting (Render or Similar)]
    FEHOST[Frontend Static Build]
    BEHOST[Node.js + Express API Service]
  end

  subgraph DataServices
    MONGO[(MongoDB Atlas)]
    STORAGE[(Uploads Storage)]
  end

  subgraph ThirdParty
    RAZORPAY[Razorpay API]
    GOOGLE[Google OAuth]
    SMTP[Email Service]
  end

  BROWSER --> FEHOST
  FEHOST --> BEHOST
  BEHOST --> MONGO
  BEHOST --> STORAGE
  BEHOST --> RAZORPAY
  BEHOST --> GOOGLE
  BEHOST --> SMTP
```

---

## Usage Note

- Copy each Mermaid block into your report (or Mermaid-enabled markdown editor) to generate clean diagrams.
- In MS Word, export rendered diagrams as PNG/SVG and add figure numbering/captions.
- Keep diagram numbering aligned with your Chapter 4 and Chapter 7 references.

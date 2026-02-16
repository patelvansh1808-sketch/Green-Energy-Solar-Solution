# Ticket Raising Module - Architecture & Flow Diagram

## User Interface Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Support & Help Page                         │
│                                                                 │
│  [ ❓ View FAQs ]  [ ➕ New Ticket ]                            │
└────────────┬────────────────────────────┬──────────────────────┘
             │                            │
             ▼                            ▼
      ┌─────────────┐             ┌──────────────────┐
      │ FAQ Modal   │             │ Chat Modal       │
      │             │             │                  │
      │ • 12 FAQs   │             │ • Category       │
      │ • 7 Groups  │             │ • Subject        │
      │ • Filters   │             │ • Priority       │
      │ • Expandable│             │ • Description    │
      │             │             │                  │
      │ [This Helps]│             │ [Start Chat ✓]   │
      │             │             │                  │
      └────────┬────┘             └────────┬─────────┘
               │                          │
      [Answered?]                 Ticket Created
               │                          │
        YES ──►Close                      ▼
               NO                  ┌──────────────────┐
               │                   │ Chat Board       │
               ▼                   │                  │
        ┌─────────────────┐       │ • Messages       │
        │ Chat Board      │       │ • History        │
        │                 │       │ • Real-time      │
        │ • Messages      │       │ • Input Area     │
        │ • History       │       │                  │
        │ • Real-time     │       │ [📤 Send]        │
        │ • Input Area    │       │                  │
        │                 │       └────────┬─────────┘
        │ [📤 Send]       │                │
        │                 │         Support Responds
        └─────────────────┘                │
                                           ▼
                                    Ticket Updates
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────┐
│                Support.jsx (Main Page)                   │
│                                                          │
│  State Management:                                       │
│  • tickets, loading, error, success                      │
│  • showFAQModal, showChatModal                           │
│  • chatTicketData, selectedFAQ                           │
│  • newTicket form data                                   │
│                                                          │
└──────┬───────────────────┬────────────────────┬──────────┘
       │                   │                    │
       ▼                   ▼                    ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐
    │ FAQBoard    │  │ ChatBoard    │  │ Ticket Detail    │
    │ Modal       │  │ Modal        │  │ Modal (existing) │
    ├─────────────┤  ├──────────────┤  ├──────────────────┤
    │ • 12 FAQs   │  │ • Messages   │  │ • Full History   │
    │ • Expand    │  │ • Chat UI    │  │ • Add Response   │
    │ • This Help │  │ • Send Msg   │  │ • Status Badge   │
    │ • to Chat   │  │ • Scroll     │  │ • Resolve        │
    └─────────────┘  └──────────────┘  └──────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│ User Action │
└──────┬──────┘
       │
       ▼
    ┌─────────────────────┐
    │ State Update        │
    │ (React Hooks)       │
    └──────┬──────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ Component Render    │
    └──────┬──────────────┘
           │
           ├─────────────┬──────────────┬──────────────┐
           │             │              │              │
           ▼             ▼              ▼              ▼
        ┌────────┐  ┌────────┐  ┌────────────┐  ┌──────────┐
        │ FAQ    │  │Chat    │  │Ticket      │  │ Success  │
        │Content │  │Panel   │  │List        │  │ Message  │
        └────────┘  └────────┘  └────────────┘  └──────────┘
           │             │              │              │
           └─────────────┴──────────────┴──────────────┘
                          │
                          ▼
                  ┌────────────────┐
                  │ ticketService  │
                  │ (API Layer)    │
                  └────────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
        POST          GET            PATCH
        Create        Fetch          Update
        Ticket        Tickets        Status
           │               │               │
           └───────────────┼───────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Backend API  │
                    │ /api/tickets │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Database     │
                    │ (Ticket Docs)│
                    └──────────────┘
```

## State Management Tree

```
Support.jsx
├── tickets (array)
│   └── Each: { id, subject, status, category, priority, responses[] }
├── loading (boolean)
├── error (string)
├── success (string)
├── showCreateModal (boolean)
├── showFAQModal (boolean)
├── showChatModal (boolean)
├── showDetailModal (boolean)
├── selectedTicket (object)
├── chatTicketData (object)
│   └── Ticket object with _id, ticketNumber, responses[]
├── selectedFAQ (object)
│   └── FAQ item selected
├── responseMessage (string)
├── chatMode (string: "normal" or "faq")
└── newTicket (object)
    ├── subject (string)
    ├── category (string)
    ├── priority (string)
    └── description (string)
```

## Message Flow (Chat)

```
User Types Message
        │
        ▼
   Validates Input
        │
        ▼
   Creates Message Object
   {
     responderName: customerProfile?.fullName,
     message: userInput,
     isCustomerResponse: true,
     timestamp: now
   }
        │
        ▼
   Calls ticketService.addResponse()
        │
        ▼
   API POST /tickets/:id/response
        │
        ✓ Success ────┐
        │             ├──► Update UI
        ✗ Error ──────┤    Show Message
        │             ├──► Clear Input
        └─────────────┴──► Disable Button

After Success:
        │
        ▼
   Clear Input Field
        │
        ▼
   Add to Local State
        │
        ▼
   Auto-scroll to Latest
        │
        ▼
   Display Message
```

## FAQ to Chat Flow

```
User Browsing FAQs
        │
        ▼
  Doesn't Find Answer
        │
        ▼
  [💬 Start Chat Support]
        │
        ▼
FAQBoard.jsx onSelectOther()
        │
        ▼
Support.jsx Handler:
├── setShowFAQModal(false)
├── setShowChatModal(true)
└── setChatMode("normal")
        │
        ▼
Chat Modal Opens
├── Category selector
├── Subject input
├── Priority selector
└── Description textarea
        │
        ▼
[🚀 Start Chat Support]
        │
        ▼
ticketService.createTicket({
  customerId,
  subject,
  category,
  priority,
  description
})
        │
        ✓ Success
        │
        ├──► setChatTicketData(response.ticket)
        ├──► Show ChatBoard component
        ├──► Clear form
        └──► Success message
                │
                ▼
           Ready for Chat
```

## File Structure

```
Frontend/src/
│
├── Components/
│   ├── FAQBoard.jsx (NEW ✨)
│   │   ├── 12 FAQ objects
│   │   ├── Category array
│   │   ├── Render logic
│   │   └── Event handlers
│   │
│   ├── ChatBoard.jsx (NEW ✨)
│   │   ├── Message display logic
│   │   ├── Message input handler
│   │   ├── Auto-scroll effect
│   │   └── Send message function
│   │
│   └── Other components...
│
├── Pages/
│   └── User/
│       └── Support.jsx (ENHANCED ✨)
│           ├── Main Support component
│           ├── FAQ modal management
│           ├── Chat modal management
│           ├── Ticket creation logic
│           ├── Message response logic
│           └── Existing ticket display
│
└── services/
    └── ticketService.js (EXISTING)
        ├── createTicket()
        ├── getAllTickets()
        ├── getTicketById()
        ├── addResponse()
        └── Other methods...

Backend/server/
│
├── Controllers/
│   ├── ticketController.js
│   │   ├── createTicket()
│   │   ├── getAllTickets()
│   │   ├── addResponse()
│   │   └── Other methods...
│   │
│   └── Other controllers...
│
└── Models/
    └── Ticket.js
        ├── ticketNumber
        ├── customerId
        ├── responses[] (for chat messages)
        └── Other fields...
```

## API Endpoints Used

```
1. Create Ticket
   POST /api/tickets
   Request: { customerId, subject, category, priority, description }
   Response: { ticket: { _id, ticketNumber, ... } }

2. Get All Tickets
   GET /api/tickets?customerId=...
   Response: [{ ticket objects }]

3. Get Single Ticket
   GET /api/tickets/:id
   Response: { ticket object with responses[] }

4. Add Response/Message
   POST /api/tickets/:id/response
   Request: { message, isCustomerResponse, attachments }
   Response: { updated ticket }

5. Update Status
   PATCH /api/tickets/:id/status
   Request: { status }
   Response: { updated ticket }
```

## Styling Hierarchy

```
Support.jsx
├── min-h-screen bg-gray-50
├── max-w-6xl mx-auto
│
├── Header Section
│   ├── bg-white rounded-lg shadow-md
│   ├── flex justify-between items-center
│   └── Buttons: bg-blue-600, bg-green-600
│
├── Alerts Section
│   ├── Error: bg-red-50, text-red-700
│   └── Success: bg-green-50, text-green-700
│
├── Tickets Table
│   ├── bg-white rounded-lg shadow-md
│   ├── thead: bg-gray-50
│   └── tbody: divide-y divide-gray-200
│
└── Modals
    ├── Fixed inset-0 bg-black bg-opacity-50
    ├── bg-white rounded-lg p-8
    └── max-w-2xl or max-w-3xl w-full

FAQBoard.jsx
├── bg-gradient-to-br from-green-50 to-blue-50
├── bg-white rounded-lg shadow-md
│
├── FAQs Section
│   ├── divide-y divide-gray-200
│   ├── Each FAQ: hover:bg-gray-50
│   ├── Category Badge: text-green-600
│   └── Expand Button: text-2xl text-gray-400
│
└── Chat Button
    └── bg-blue-600 hover:bg-blue-700

ChatBoard.jsx
├── flex flex-col h-full
│
├── Header
│   └── bg-gradient-to-r from-green-600 to-green-700
│
├── Messages Area
│   ├── bg-gray-50
│   └── Messages:
│       ├── User: bg-blue-600, text-white, rounded-br-none
│       └── Support: bg-white, border border-gray-300, rounded-bl-none
│
└── Input Area
    ├── border-t border-gray-200
    └── Input: border border-gray-300, focus:ring-2 focus:ring-green-500
```

## Color Palette

```
Primary Colors:
- Green-600:   #16a34a (CTA buttons, headers)
- Green-700:   #15803d (Hover states)
- Blue-600:    #2563eb (Secondary actions)
- Blue-700:    #1d4ed8 (Hover states)

Neutral Colors:
- White:       #ffffff (Backgrounds)
- Gray-50:     #f9fafb (Light backgrounds)
- Gray-300:    #d1d5db (Borders)
- Gray-600:    #4b5563 (Text labels)
- Gray-700:    #374151 (Body text)
- Gray-900:    #111827 (Headings)

Status Colors:
- Red-50/700:  For errors
- Green-50/700: For success
- Yellow-100/800: For warning/medium
- Orange-100/800: For high priority
- Blue-100/800: For customer messages

Gradients:
- Green fade:  from-green-50 to-blue-50
- Green-600→700: from-green-600 to-green-700
```

---

**Architecture Version**: 1.0
**Last Updated**: February 16, 2026
**Status**: ✅ Complete Implementation

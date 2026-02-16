# Ticket Raising Module - Testing & Verification Guide

## Pre-Testing Checklist

- [ ] Node.js and npm installed
- [ ] All dependencies installed (`npm install` in Frontend folder)
- [ ] Backend server running
- [ ] Database connected and working
- [ ] User logged in with customer profile
- [ ] Browser console ready for debugging (F12)

## Part 1: FAQ Board Testing

### Test 1.1: FAQ Modal Opens
1. Navigate to User Support page
2. Click **"❓ View FAQs"** button
3. ✅ **Expected**: FAQ modal appears with title "❓ Common Questions"
4. ✅ **Verify**: Modal is centered, has close button (×)

### Test 1.2: FAQ Display
1. Inside FAQ modal, scroll down
2. ✅ **Expected**: See 12 different FAQ items displayed
3. ✅ **Categories visible**:
   - Installation (2 items)
   - Maintenance (2 items)
   - Performance (2 items)
   - Warranty (2 items)
   - Safety (2 items)
   - Optimization (2 items)

### Test 1.3: Expand/Collapse FAQs
1. Click on any FAQ question
2. ✅ **Expected**: Answer expands below the question
3. ✅ **Icon changes**: "+" becomes "−"
4. Click again
5. ✅ **Expected**: Answer collapses, icon changes back to "+"

### Test 1.4: Category Tabs
1. Look for category filter buttons at top
2. ✅ **Expected**: See 7 category buttons (Installation, Maintenance, etc.)
3. Click on a category button
4. ✅ **Expected**: FAQs filter (test may need implementation)

### Test 1.5: This Helps Button
1. Expand any FAQ
2. Look for **"👍 This Helps"** button
3. Click it
4. ✅ **Expected**: Button responds/changes color or shows confirmation

### Test 1.6: Navigate to Chat
1. Click **"💬 Start Chat Support"** at bottom
2. ✅ **Expected**: 
   - FAQ modal closes
   - Chat Support modal opens with form
   - Form has Category, Subject, Priority, Description fields

### Test 1.7: Close FAQ Modal
1. Click close button (×) in top right
2. ✅ **Expected**: Modal closes smoothly, returns to main Support page

---

## Part 2: Chat Support Testing

### Test 2.1: Chat Modal Opens
1. Click **"➕ New Ticket"** button on main page
2. ✅ **Expected**: Chat Support modal appears
3. ✅ **Header shows**: "💬 Chat Support" with description
4. ✅ **Form displays**: Category, Subject, Priority, Description fields

### Test 2.2: Form Validation
1. Leave all fields empty
2. Click **"🚀 Start Chat Support"**
3. ✅ **Expected**: Error message "Please fill in all required fields"
4. Fill only Subject field
5. Click **"🚀 Start Chat Support"**
6. ✅ **Expected**: Still shows error (Description is required)

### Test 2.3: Category Selection
1. Click Category dropdown
2. ✅ **Expected**: See all 8 options:
   - General Question
   - Technical Issue
   - Installation Problem
   - Maintenance Question
   - Billing Issue
   - Warranty Question
   - Complaint
   - Feedback
3. Select "Installation Problem"
4. ✅ **Expected**: Selection displays in dropdown

### Test 2.4: Priority Selection
1. Click Priority dropdown
2. ✅ **Expected**: See 4 options (Low, Medium, High, Urgent)
3. Select "High"
4. ✅ **Expected**: Selection displays in dropdown

### Test 2.5: Form Submission
1. Fill all fields:
   - Category: Select "Maintenance Question"
   - Subject: "Panel cleaning help needed"
   - Priority: "Medium"
   - Description: "My solar panels are very dirty after dust storm"
2. Click **"🚀 Start Chat Support"**
3. ✅ **Expected**: Success message "Ticket created! You can now chat with support."
4. ✅ **Form clears** or Chat Board appears

### Test 2.6: Chat Board Display
1. After ticket creation, Chat Board should appear
2. ✅ **Expected**:
   - Header: "💬 Support Chat" with ticket number
   - Messages area (empty if new)
   - Input textarea with placeholder text
   - Send button (📤 Send)

### Test 2.7: Send Message
1. Click in message textarea
2. Type: "How often should I clean my panels?"
3. Click **"📤 Send"** button OR press Ctrl+Enter
4. ✅ **Expected**:
   - Message appears in blue bubble on right side
   - Labeled "You"
   - Has timestamp
   - Input clears

### Test 2.8: Message Shifting
1. Type and send multiple messages
2. ✅ **Expected**:
   - Each message appears on right side
   - Timestamps increase
   - Messages stack vertically
   - Auto-scroll to latest message

### Test 2.9: Support Response (Admin needed)
1. Have admin/support user log in
2. Admin responds to customer message
3. ✅ **Expected**:
   - Response appears on left side in white bubble
   - Labeled with support person's name
   - Has timestamp
   - Customer can see it in real-time

### Test 2.10: Cancel Chat
1. Before creating ticket, click **"Cancel"** button
2. ✅ **Expected**: Modal closes, returns to main Support page

### Test 2.11: Go Back from Chat
1. After ticket created and chatting, click **"← Back"**
2. ✅ **Expected**: Chat closes, returns to main page, refreshes tickets list

---

## Part 3: Existing Tickets Management

### Test 3.1: View Tickets List
1. On main Support page, look for "My Tickets" section
2. ✅ **Expected**: Table with columns:
   - Ticket #
   - Subject
   - Category
   - Priority
   - Status
   - Created
   - Actions

### Test 3.2: Ticket Details
1. Look for a ticket in the list
2. Click **"View"** button
3. ✅ **Expected**: Detail modal opens showing:
   - Ticket number and subject
   - Status badge
   - Priority badge
   - Description
   - Conversation thread (if responses exist)
   - Add Response textarea (if not closed)

### Test 3.3: Add Response to Existing Ticket
1. With ticket detail modal open
2. Scroll to "Add Response" section
3. Type a message
4. Click **"Send Response"** button
5. ✅ **Expected**:
   - Message appears in conversation
   - Labeled as "You"
   - Has timestamp
   - Textarea clears

### Test 3.4: Closed Ticket Behavior
1. Find a closed ticket in list
2. Click View
3. ✅ **Expected**: ADD Response section NOT visible
4. ✅ Message explains ticket is closed

### Test 3.5: Close Detail Modal
1. Click **"Close"** button at bottom
2. ✅ **Expected**: Modal closes, returns to tickets list

---

## Part 4: User Interface & Responsiveness

### Test 4.1: Header Layout
1. View Support page at different screen widths
2. At 1200px width: Buttons side by side
3. At 768px width (tablet): Buttons should wrap or stack
4. At 375px width (phone): Buttons full width or stacked

### Test 4.2: Modal Responsiveness
1. Open FAQ modal on mobile (375px)
2. ✅ **Expected**: Modal readable, scrollable
3. Open Chat modal on mobile
4. ✅ **Expected**: Form inputs touch-friendly
5. Open Chat Board on mobile
6. ✅ **Expected**: Messages readable, input accessible

### Test 4.3: Dark Mode (if supported)
1. Enable dark mode in browser
2. ✅ **Expected**: All components readable with adequate contrast

### Test 4.4: Color Scheme
1. Verify colors match:
   - Green buttons: #16a34a
   - Blue buttons: #2563eb
   - White backgrounds: #ffffff
   - Gray text: #374151

### Test 4.5: Font Sizes
1. Headings appear larger than body text
2. Labels appear smaller than content
3. Timestamps smaller than messages

---

## Part 5: Error Handling

### Test 5.1: Network Error (Chat)
1. Open Chat support and create ticket
2. Close network/disable internet
3. Try to send a message
4. ✅ **Expected**: Error message appears

### Test 5.2: Form Validation
1. Leave Subject empty, fill others
2. Try to submit
3. ✅ **Expected**: Error message

### Test 5.3: Session Timeout (if applicable)
1. Let session expire
2. Try to access Support page
3. ✅ **Expected**: Redirected to login or error shown

---

## Part 6: Performance Testing

### Test 6.1: Page Load Time
1. Open Support page
2. ✅ **Expected**: Loads in < 3 seconds
3. Data visible < 2 seconds

### Test 6.2: Modal Load Time
1. Click "View FAQs"
2. ✅ **Expected**: Opens in < 1 second

### Test 6.3: Message Sending Speed
1. Send chat message
2. ✅ **Expected**: Appears immediately (< 500ms)

### Test 6.4: Long Conversation
1. Send 50+ messages
2. ✅ **Expected**: No lag, scrolling smooth
3. Memory usage reasonable

---

## Part 7: Accessibility Testing

### Test 7.1: Keyboard Navigation
1. Press Tab key repeatedly
2. ✅ **Expected**: Can navigate all buttons/inputs with Tab
3. Can activate with Enter/Space

### Test 7.2: Color Contrast
1. Use accessibility checker
2. ✅ **Expected**: All text meets WCAG AA standard (4.5:1 ratio)

### Test 7.3: Screen Reader (if applicable)
1. Enable screen reader
2. Navigate the page
3. ✅ **Expected**: All elements announced properly

---

## Part 8: Data Verification

### Test 8.1: Ticket Data Saved
1. Create a ticket with Chat
2. Refresh page
3. ✅ **Expected**: Ticket appears in "My Tickets" list
4. Click View
5. ✅ **Expected**: All data preserved (subject, category, description)

### Test 8.2: Message Persistence
1. Send chat message
2. Navigate away
3. Return to Support page
4. Click View on same ticket
5. ✅ **Expected**: Message still there with correct timestamp

### Test 8.3: Category Saved Correctly
1. Create ticket with category "Installation Problem"
2. View ticket
3. ✅ **Expected**: Category displays as "Installation"

### Test 8.4: Priority Saved Correctly
1. Create ticket with priority "High"
2. View ticket
3. ✅ **Expected**: Priority badge shows "HIGH" in orange

---

## Browser Testing Matrix

### Chrome/Edge
- [ ] All tests pass
- [ ] No console errors
- [ ] Responsive on all sizes

### Firefox
- [ ] All tests pass
- [ ] No console errors
- [ ] Button styling correct

### Safari
- [ ] All tests pass
- [ ] Border radius working
- [ ] Shadows rendering

### Mobile Chrome
- [ ] Tap interactions work
- [ ] Modals fit screen
- [ ] Scrolling smooth

### Mobile Safari
- [ ] Touch events working
- [ ] Input focus working
- [ ] Auto-fill compatible

---

## Known Limitations & Notes

⚠️ **File Attachments**: Not yet implemented in chat
⚠️ **Notifications**: Real-time push notifications not yet added
⚠️ **Typing Indicators**: Support typing indicator not yet shown
⚠️ **Message Search**: FAQ search filtering in progress
⚠️ **Export**: Ticket export to PDF not yet available

---

## Test Results Log

| Test # | Description | Status | Notes | Date |
|--------|-------------|--------|-------|------|
| 1.1 | FAQ Modal Opens | ⏳ | Pending | - |
| 1.2 | FAQ Display | ⏳ | Pending | - |
| 2.1 | Chat Modal Opens | ⏳ | Pending | - |
| 2.5 | Form Submission | ⏳ | Pending | - |
| 3.1 | View Tickets List | ⏳ | Pending | - |
| 4.1 | Header Layout | ⏳ | Pending | - |
| 5.1 | Error Handling | ⏳ | Pending | - |
| 6.1 | Page Load Time | ⏳ | Pending | - |

---

## Sign-Off Checklist

- [ ] All tests completed
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] Responsive on all devices
- [ ] Accessibility verified
- [ ] Data persists correctly
- [ ] Error handling works
- [ ] Ready for production deployment

---

**Testing Guide Version**: 1.0
**Last Updated**: February 16, 2026
**Status**: Ready for Testing ✅

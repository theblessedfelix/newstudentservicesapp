# TESTING CHECKLIST - Pre-Live Validation

## Quick Reference
- 📋 Full scan completion: ~30 min
- 🟢 All tests must PASS before live
- 🔴 Any FAIL = Fix before deployment
- 📊 Metrics logged to console

---

## TEST 1: Basic Scanner Flow (5 min) ⏱

### Setup
```
1. Log in as Volunteer (VOL001/volunteer123)
2. Navigate to Scanner
3. Select Level 1 (or Level 2)
4. Select first available session
```

### Execution
```
✓ Scan 5 students (use valid IDs from student list)
Each scan should:
  - Accept input
  - Show "✓ checked in" toast
  - Add row to checked-in list
  - Show check-in time
  - Clear input field

Failure indicators:
  ✗ Student appears twice
  ✗ No toast appears
  ✗ Student not in list
  ✗ Wrong time shown
  ✗ Input not cleared
```

### Validation
```
☑ All 5 students visible in checked-in list
☑ Timestamps realistic ("02:30 PM", etc)
☑ No errors in browser console (F12)
☑ No duplicate entries
```

---

## TEST 2: Session Blocker (10 min) ⏱

### Setup
```
1. Log in as Admin (ADMIN001/admin123)
2. Go to Admin Dashboard
3. Scroll to "Today's Sessions" section
```

### Execution - Block a Session
```
1. Identify Level 1 Morning session
2. Click "Block" button
3. Expected: Red background, status changes to "Closed"
4. Verify button now says "Open"

Timeline check:
  ✓ Status changes instantly (<1 second visible)
  ✓ Button color updates red
  ✓ "Closed" text appears
```

### Execution - Try Scanner with Blocked Session
```
1. Open new browser tab (or phone)
2. Log in as Volunteer
3. Select Level 1
4. Try to select the BLOCKED morning session
5. Expected: Error "❌ Session is closed"

Failure indicators:
  ✗ No error appears
  ✗ Scanner opens anyway
  ✗ Takes >2 seconds to error
```

### Execution - Unblock Session  
```
1. Go back to admin tab
2. Click "Open" button on same session
3. Expected: Blue background, "Open" status, "Block" button reappears
4. Try scanner again
5. Expected: Scanner works now
```

### Validation
```
☑ Block/Open buttons work instantly
☑ Scanner respects blocks immediately
☑ Blocked session prevents check-ins
☑ Unblocking allows check-ins
☑ No console errors
```

---

## TEST 3: Exception Flow (10 min) ⏱

### Setup
```
1. Volunteer logged in, Scanner ready
2. Admin Dashboard open in another tab
```

### Execution - Request Exception
```
1. Volunteer: Go to Dashboard (not Scanner)
2. Click "Request Exception" button (orange, AlertCircle icon)
3. Modal should appear with:
  - Student ID input (focus here)
  - Date selector (defaults today)
  - Session dropdown
  - Reason dropdown
  - Details textarea (optional)
  - Submit button
```

### Fill Form
```
1. Student ID: Enter valid student ID
   Expected: Name appears below after 1-2 seconds
   
2. Date: Keep default (today)

3. Session: Select "Morning" (or first session)

4. Reason: Select "Sick"
   Expected: "Specify Other Reason" field does NOT appear
   
5. Reason: Change to "Other"
   Expected: New text field appears "Specify Other Reason *"
   
6. If "Other": Enter "Had emergency"

7. Details: Optional, can leave blank or add comment

8. Click "Submit"
   Expected: Toast "✓ Exception request received and sent to admin for review"
   Form clears
   Modal closes
```

### Admin Reviews Exception
```
1. Admin: Click "Open Exception Queue" button
2. Expected: New page loads, showing exceptions
3. Find the one just created (should be at top as newest)
4. Click on it
5. Modal should show:
  - Student ID
  - Level, Session, Date
  - Reason (show "Other" + your text)
  - Status badge "Pending"
  - "Requested by: Volunteer User" timestamp
  - Review form with notes text area
  - "Approve" and "Reject" buttons
```

### Approve Exception
```
1. Admin: Add optional review notes
   (e.g., "Confirmed illness with parent")
2. Click "Approve" button
3. Expected: Toast "✓ Exception approved"
4. Exception now marked "Approved" (green badge)
5. Student shows in "Approved" exceptions list
```

### Validation - Exception Blocks Scanner
```
1. Volunteer: Go to Scanner
2. Select Level, select same session as exception
3. Try to scan the same student
4. Expected: Should now be allowed (exception granted override)
   ✓ Toast: "✓ {name} checked in"
   vs
   ✗ Toast: "❌ Session is closed"
```

### Validation
```
☑ Modal opens with all fields
☑ Student name auto-populates
☑ "Other reason" field shows only when "Other" selected
☑ Form submits with toast confirmation
☑ Admin sees exception in queue
☑ Exception can be approved/rejected
☑ Approved exception allows scanner access
☑ Rejected exception blocks scanner
☑ No console errors
```

---

## TEST 4: High Volume Scan (10 min) ⏱

### Setup
```
1. Have at least 20 valid student IDs ready
2. Volunteer logged in, Scanner open
3. Session selected and ready
4. Stopwatch ready
```

### Execution
```
Clear checked-in list (F5 refresh or close/reopen session)

Start timer.

Rapidly scan 20 different students:
- Type ID + Enter (don't wait for response)
- Immediate next ID
- Target: 20 scans in ~60 seconds (one every 3 seconds)

Complete all 20 scans as fast as possible.

Stop timer. Record time: _____ seconds
```

### Validation - During Scanning
```
☑ No "freezing" or lag
☑ Input field remains responsive
☑ Each input accepted immediately
☑ Toasts appear for each scan
☑ Checked-in list updates in real-time
☑ No duplicate entries
☑ No "Cannot read property" errors
☑ Browser tab remains at ~5-15% CPU (not maxed)
```

### Validation - After Scanning
```
☑ Exactly 20 entries in checked-in list
☑ All have unique student IDs
☑ All have realistic times (within 1-2 min of each other)
☑ No duplicates
☑ Storage size <10MB (check DevTools Storage)
☑ No errors in console (F12)

Performance metric:
  ✓ Completed in <120 seconds = EXCELLENT
  ✓ Completed in 120-180 seconds = GOOD
  ✗ Completed in >180 seconds = INVESTIGATE
```

---

## TEST 5: Offline Mode (8 min) ⏱

### Setup
```
1. Volunteer in Scanner, session selected
2. Developer tools open (F12)
```

### Execution - Go Offline
```
1. DevTools → Network tab
2. Check "Offline" checkbox
3. Indicator on browser shows offline awareness
4. Scan 5 students

Expected:
  ✓ Scans still work
  ✓ Toasts appear
  ✓ Students added to list
  ✗ NOT expected: Network errors in console
```

### Execution - Come Back Online
```
1. Uncheck "Offline" in DevTools
2. Back online
3. Wait 5 seconds
4. Check console for sync activity

Expected:
  ✓ Network errors stop
  ✓ Sync may happen automatically
  ✓ All 5 scans persisted (if Supabase configured)
  ✓ No duplicates appear
```

### Validation
```
☑ Scanning works offline
☑ Data queued locally
☑ Returns online gracefully
☑ No errors on reconnect
☑ Records available when online again
```

---

## TEST 6: Real-Time Sync Between Tabs (5 min) ⏱

### Setup
```
1. Open app in 2 browser tabs (both logged in as Volunteer)
2. Scanner open in TAB 1
3. Dashboard open in TAB 2
```

### Execution
```
1. TAB 1: Scan a student
2. TAB 2: Watch for update (should see change instantly)

Expected:
  ✓ Change appears in <1 second
  ✗ Requires manual refresh
```

### Execution - Admin Closes Session
```
1. TAB 2: Switch to TAB 3 (Admin tab, Admin Dashboard)
2. TAB 3: Click "Block" on a session
3. TAB 1: Try to select that session
4. Expected: Error "Session is closed" appears <1 second after admin blocked it
```

### Validation
```
☑ Real-time updates work between tabs (<1 sec)
☑ Admin actions visible instantly in volunteer scanners
☑ No manual refresh required
☑ BroadcastChannel working (if no Supabase)
```

---

## TEST 7: Data Persistence (5 min) ⏱

### Setup
```
1. Volunteer in Scanner with 10 students scanned
2. All 10 visible in checked-in list
```

### Execution
```
1. Close the browser tab completely
2. Wait 2 seconds
3. Reopen browser to same URL
4. Navigate back to Scanner
5. Same session still selected?

Expected:
  ✓ Checked-in students still there
  ✓ Timer continues (if was in progress)
  ✓ Session selection remembered
```

### Validation
```
☑ Data persists after tab close
☑ Session state restored
☑ Checked-in list populated
☑ No duplicate reappear on reload
☑ Timestamps still accurate
```

---

## TEST 8: Admin Audit Trail (5 min) ⏱

### Setup
```
As Admin, check each section for data completeness
```

### Execution - Session Management
```
1. Admin Dashboard → Session Management
2. Should see your "Block/Open" actions from TEST 2
3. Click on any session lock
4. Modal shows details including:
  - Who closed it (volunteer name)
  - When it was closed
  - Any exceptions granted
  - Option to reopen

Validate:
  ✓ All blocks logged
  ✓ Correct timestamps
  ✓ Exception list accurate
```

### Execution - Reports
```
1. Admin Dashboard → Reports
2. Select Level 1
3. View attendance report
4. Should show students from TEST 4

Validate:
  ✓ All 20 scans recorded
  ✓ Timestamps reasonable
  ✓ Status shows as "present"
  ✓ Volunteer name correct
```

### Execution - Exception Queue
```
1. Admin Dashboard → Exception Queue
2. Filter by "All"
3. Should see exceptions from TEST 3

Validate:
  ✓ All exceptions listed
  ✓ Status badges correct
  ✓ Timestamps accurate
  ✓ Review notes present (if added)
```

### Validation
```
☑ All activities logged properly
☑ Audit trail complete
☑ No missing records
☑ Timestamps consistent across modules
```

---

## TEST 9: Error Scenarios (8 min) ⏱

### Scenario A: Unknown Student
```
1. Scanner ready
2. Enter a student ID that doesn't exist
3. Expected: "Student not in this level" OR approval flow

Validate:
  ✓ Error message clear
  ✓ Input allows retry
  ✓ No crash
```

### Scenario B: Duplicate Check-In
```
1. Scan same student twice in same session
2. Second attempt:
   Expected: "Student already checked in" error toast

Validate:
  ✓ Duplicate prevented
  ✓ No database record created
  ✓ Can still scan other students
```

### Scenario C: Rapid Fire Same Student
```
1. Scan student ID
2. Before toast appears, scan same ID again
3. Expected: One succeeds, one fails with duplicate error

Validate:
  ✓ Race condition handled
  ✓ Only one record created
  ✓ No UI crash
```

### Scenario D: Session Tab Closed
```
1. During high-volume scan
2. Close the tab
3. Reopen to same page
4. Resume scanning

Validate:
  ✓ Data still there
  ✓ Can continue scanning
  ✓ No corruption
```

### Validation
```
☑ All error scenarios handled gracefully
☑ No crashes on edge cases
☑ Error messages helpful
☑ Recovery possible
☑ Data integrity maintained
```

---

## FINAL SIGN-OFF

### Before Production Deployment

| Test | Pass/Fail | Notes |
|------|:---------:|:-----:|
| 1. Basic Scanner | ☐ | |
| 2. Session Blocker | ☐ | |
| 3. Exception Flow | ☐ | |
| 4. High Volume | ☐ | |
| 5. Offline Mode | ☐ | |
| 6. Real-Time Sync | ☐ | |
| 7. Data Persist | ☐ | |
| 8. Audit Trail | ☐ | |
| 9. Error Handling | ☐ | |

### Performance Baseline (Record for comparison)

```
Average check-in latency: _____ ms (target: <200ms)
Session lock check time: _____ ms (target: <50ms from cache)
Memory usage peak: _____ MB (target: <50MB)
CPU usage peak: _____ % (target: <30%)
Storage used: _____ MB (target: <10MB)
Browser: _____________ Version: _____
Device: _____________ OS: ___________
Network: _____________ Speed: _______
```

### Known Issues Found

```
1. _________________________________
   Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
   Status: [ ] Fixed [ ] Workaround [ ] Accepted

2. _________________________________
   Severity: [ ] Critical [ ] High [ ] Medium [ ] Low
   Status: [ ] Fixed [ ] Workaround [ ] Accepted
```

### Approval

```
Tester Name: _________________ Date: _________
Test Environment: [ ] Dev [ ] Staging [ ] Production
Result: [ ] APPROVED FOR LIVE [ ] DO NOT DEPLOY

Signature: _________________________________
```

---

## Notes for Each Test

- Take screenshots/video of any failures
- Record exact steps to reproduce
- Check browser console (F12) between each test
- Clear browser cache before first test (Ctrl+Shift+Del)
- Test on actual volunteer phone if possible (not just desktop)
- Run full suite at least 3 times with different data

**Good luck! You've got this! 🚀**

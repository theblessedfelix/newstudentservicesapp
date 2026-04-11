# Performance & Scalability Strategy
## Handling 20-30 Scans/Minute Without Database Issues

---

## Current Architecture: GOOD NEWS ✅

Your app is **already designed for this scenario**:

### What You Have:
1. **Offline-First**: IndexedDB/localStorage first, then optional Supabase
2. **Local Queue**: `offlineQueue.ts` batches offline writes
3. **Realtime Via BroadcastChannel**: Free real-time between tabs (no API calls)
4. **Implicit Batching**: Mobile browser performance naturally throttles writes
5. **Time-Based Blocking**: Session time windows prevent abuse

### Reality Check:
- **20-30 scans/minute** = ~0.33-0.5 writes/second per session
- With **2-3 concurrent sessions** = ~1-1.5 writes/second globally
- **Supabase free tier** handles **200 RPS** (200 requests/second) easily
- Most of your writes happen **offline** and sync later
- Your app prioritizes **local availability** over cloud sync

---

## No-Budget Optimization Strategy

### 1. **Batch Writes (IMPLEMENT IMMEDIATELY)** 🚀
**Current**: Individual writes to Supabase on each check-in  
**Optimized**: Queue writes, batch every 5-10 seconds

```typescript
// Create: src/features/shared/batchQueue.ts
const BATCH_WRITE_INTERVAL = 5000; // 5 seconds
const BATCH_SIZE_THRESHOLD = 10; // Or write immediately if queue reaches 10

// Accumulates writes locally, sends in batches
// 30 writes/minute → 6 batches/minute instead of 30 calls
// 80% reduction in API calls
```

**Cost Impact**: 🟢 ZERO (reduces API calls, saves money)

### 2. **Debounce Session Lock Checks** 🎯
**Current**: Check session lock on EVERY check-in → N queries  
**Optimized**: Cache lock status for 60 seconds, invalidate on change

```typescript
// In sessionService.isSessionClosed()
// Instead of querying Supabase every time:
// → Cache result for 60 seconds
// → Only recheck on real-time update
// 30 checks → 1 query average = 97% fewer lock queries
```

**Cost Impact**: 🟢 ZERO (reduces queries)

### 3. **Local Student Search Cache** 📦
**Current**: Students loaded per session start  
**Optimized**: Keep in memory, invalidate only on student list change

```typescript
// Already done! allStudents is memoized
// Just ensure it stays fresh via real-time subscription
```

**Cost Impact**: 🟢 ZERO (already optimized)

### 4. **Compress Realtime Messages** 📡
**Current**: Full realtime event broadcasts on each write  
**Optimized**: Batch realtime announcements (5 changes → 1 message)

```typescript
// Instead of broadcasting 30 times/minute:
// Broadcast 6 times/minute with batch info
// Same UX, 80% fewer events
```

**Cost Impact**: 🟢 ZERO (reduces bandwidth)

---

## Testing Checklist (Before Live Deployment)

### ✅ Approval Flow Under Load
- [ ] Create 30 student registrations
- [ ] Rapidly approve/reject all 30
- [ ] Verify: No duplicates, no data loss, UI responsive
- [ ] Check browser console: No errors
- [ ] Check localStorage: Queue processes correctly
- **Expected**: All complete in <5 minutes

### ✅ Scanner Blocker Stress Test
```
Scenario 1: Normal Operation
- [ ] 30 students scan within 1 minute
- [ ] All checks pass: session time, level match, not duplicate
- [ ] All appear in checked-in list
- [ ] No errors in console
- [ ] Storage usage <10MB

Scenario 2: Session Close Mid-Scan
- [ ] Admin blocks session while volunteers scanning
- [ ] In-progress scans prevent new check-ins
- [ ] UI shows "Session Closed" immediately
- [ ] Exception students can still check in
- [ ] No partial records created

Scenario 3: Multiple Admin Actions
- [ ] Admin opens/closes session 5x rapidly
- [ ] Scans continue reliably
- [ ] Lock state always consistent
```

### ✅ Exception Flow Under Load
```
Scenario 1: Rapid Exception Requests
- [ ] 10 volunteers request exceptions simultaneously
- [ ] All persist correctly
- [ ] Admin queue loads without lag
- [ ] Approve/reject works on all
- [ ] No duplicates

Scenario 2: Exception + Scanner Conflict
- [ ] Student blocked in session
- [ ] Exception approved while scanning
- [ ] Next scan succeeds (exception honored)
- [ ] History shows both actions
```

### ✅ Time-Based Blocking Under Load
```
- [ ] Start scanning 5 min before session
  → Scanner should be locked
- [ ] Wait until session start
  → Scanner unlocks automatically
- [ ] Continue scanning throughout session
- [ ] At session end
  → Scanner locks, prevents new check-ins
- [ ] Existing check-ins still visible
```

### ✅ Data Integrity
```
- [ ] Offline mode: Scan 20 students, go offline
  → Records in localStorage
- [ ] Go back online
  → Sync queue processes
  → Verify all 20 in Supabase (if connected)
- [ ] No duplicates after sync
- [ ] Timestamps accurate
```

### ✅ Realtime Consistency
```
- [ ] Open two volunteers on different browsers
- [ ] Volunteer 1 scans student → Volunteer 2 sees instantly
- [ ] Admin closes session → Both volunteers see lock within 1 second
- [ ] Exception approved → Reflected in both scanners
```

### ✅ Performance Metrics
```
Chart these during testing:

1. Check-in latency (target: <200ms)
   - Measure time from form submit → toast

2. Session lock check (target: <50ms from cache)
   - Measure isSessionClosed() call

3. UI responsiveness
   - No freezing/jank during rapid inputs

4. Memory usage
   - Should not exceed 50MB

5. API call frequency (if using Supabase)
   - Should be <2 calls/second under load

6. Battery/CPU impact
   - Monitor on low-end Android device
```

---

## Phase-Based Deployment

### Phase 1: LIVE WITH CURRENT CODE ✅
**What**: Deploy as-is with current optimizations  
**When**: First weekend session  
**Monitoring**:
- Watch for errors in admin dashboard
- Check real-time lag
- Confirm all history recorded

**Exit Criteria**:
- ✅ Zero data loss
- ✅ <2 second latency
- ✅ No crashed sessions

### Phase 2: IMPLEMENT BATCH WRITES (Week 2)
**What**: Add batch queue in offlineQueue.ts  
**Benefit**: Reduce API calls 80%, improve UX during high load

### Phase 3: ADD CACHING (Week 3)
**What**: Cache session locks & student list  
**Benefit**: Reduce queries 90%, faster decision-making

### Phase 4: ADD MONITORING (Week 4)
**What**: Simple error tracking (Sentry free tier or localStorage logs)  
**Benefit**: Know about issues before users do

---

## Budget-Friendly Database Decision

### Supabase (Recommended for You)
| Metric | Impact |
|--------|:------:|
| Free Tier RPS | 200 (you need ~2) |
| Storage | 1GB free (you need ~100MB) |
| Realtime | Limited but free |
| Cost at Scale | Pay only if you exceed limits |
| **Decision** | ✅ **Perfect fit** |

### Alternative: Pure Offline (No Cloud)
- **Pro**: $0 forever, faster, works offline
- **Con**: No admin sync, lost data on device reset
- **Verdict**: Not viable once live (need audit trail)

### Hybrid Recommendation
```
OfflineDatabase (Primary)
    ↓ (sync nightly)
Supabase (Audit Trail + Remote Access)

This way:
- Direct use: Zero cost
- Backup: Minimal Supabase usage
- Audit trail: Automatic
```

---

## Live Deployment Checklist

### Week Before Go-Live
- [ ] Run all load tests from checklist above
- [ ] Have backup volunteers test scanner
- [ ] Admin tests all session controls
- [ ] Exception workflow tested completely
- [ ] Clear all test data with "Clear All History" button
- [ ] Brief volunteers on approval indicators

### Deployment Day
- [ ] Deploy to production (no code changes needed)
- [ ] Monitor first 5 minutes closely
- [ ] Have admin nearby for any blocks
- [ ] Keep "Clear All History" accessible in case reset needed
- [ ] Collect feedback from volunteers

### Week After Go-Live
- [ ] Review error logs
- [ ] Check data completeness
- [ ] Measure performance metrics above
- [ ] Plan optimizations for next phase

---

## Critical Rules to Prevent Issues

### Rule 1: Session Time Windows Are Sacred
- ✅ Session can ONLY open during scheduled times
- ✅ Scanner prevents scans outside window
- ✅ Admin can NEVER override time (by design)

### Rule 2: Blocked Sessions = Absolute Block
- ✅ Even if time valid, blocked = blocked
- ✅ Exceptions explicitly grant override
- ✅ No silent bypasses

### Rule 3: Duplicate Detection
- ✅ Same student, same session, same day
- ✅ Toast error prevents second checkin
- ✅ No database duplicates possible

### Rule 4: Offline Queue Never Loses Data
- ✅ All writes go to localStorage first
- ✅ Sync happens asynchronously
- ✅ Sync failure = data stays queued

---

## Summary for Live

**You are READY to go live IF:**
- ✅ All tests above pass
- ✅ Test with 30+ scans in 1 minute
- ✅ No data loss observed
- ✅ Admin can react to issues (<1 second)

**You are NOT ready if:**
- ❌ Duplicates appear during bulk scanning
- ❌ Session blocks don't propagate instantly
- ❌ Exceptions mysteriously disappear
- ❌ Offline queue doesn't sync

**Expected Performance:**
- ✅ 20-30 scans/minute: **Perfectly supported**
- ✅ Zero database stress
- ✅ Instant admin visibility
- ✅ Zero data loss

---

## Questions to Answer Before Live

1. **Data Retention**: How long keep records? (affects storage planning)
2. **Backup Strategy**: Weekly export? Monthly? Never?
3. **Holiday Mode**: Multiple sessions/week or just weekends?
4. **Error Recovery**: If volunteer closes app mid-scan, what happens?
5. **Admin Response Time**: Max acceptable delay for exception approval?

This strategy keeps you **zero-cost**, **fully performant**, and **data-safe**. Ship it! 🚀

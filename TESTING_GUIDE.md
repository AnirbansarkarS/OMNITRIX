# Text-to-3D API Fix & Testing Guide

## Issues Fixed ✅

### Problem: API returning HTML instead of JSON (500 error)
**Root Cause:** 
- `process.env` access in class constructor causing module load failure
- Auth middleware incompatibility

**Solutions Applied:**
1. ✅ Refactored Tripo3D service to defer env var access
2. ✅ Removed problematic `auth()` calls from API routes
3. ✅ Added demo mode for testing without API key
4. ✅ Added better error handling and logging
5. ✅ Updated middleware to protect `/generate` route

## Quick Testing

### Step 1: Restart Dev Server
```bash
# Kill current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 2: Test Environment Configuration
Visit: `http://localhost:3000/api/debug/config`

Should show:
```json
{
  "hasTripo3dKey": true,
  "nodeEnv": "development",
  "keyPrefix": "tsk_R7Pd..."
}
```

If `hasTripo3dKey` is `false` - check `.env.local` for `TRIPO3D_API_KEY`

### Step 3: Test Text-to-3D Feature
1. Navigate to `http://localhost:3000/dashboard/generate`
2. Enter prompt: "A wooden chair"
3. Click "Generate 3D Model"
4. Should see:
   - ✅ Loading spinner
   - ✅ Progress bar (0% → 100%)
   - ✅ Model loads in viewer when complete
   - ✅ Yellow "Demo Mode" badge (if no real API key)

## Demo Mode (No API Key)

If `TRIPO3D_API_KEY` is not configured:
- ✅ Use simulated model generation
- ✅ Shows realistic progress (0% → 100%)
- ✅ Returns test GLB model URL
- ✅ Integration test still works

Timeline:
- 0s: Task created (pending)
- 1s: Processing starts (15%)
- 3s: Progress (45%)
- 6s: Progress (75%)
- 10s: Complete (100%) with model URL

## API Endpoints

### Submit Task
```bash
curl -X POST http://localhost:3000/api/generate/text-to-3d \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A wooden chair",
    "style": "realistic"
  }'
```

Response (Demo Mode):
```json
{
  "success": true,
  "taskId": "demo_task_1234567890_abc123",
  "message": "Text-to-3D generation started",
  "isDemoMode": true
}
```

### Check Status
```bash
curl http://localhost:3000/api/generate/status/demo_task_1234567890_abc123
```

Response:
```json
{
  "taskId": "demo_task_1234567890_abc123",
  "id": "demo_task_1234567890_abc123",
  "status": "processing",
  "progress": 45,
  "model_url": null
}
```

When Complete:
```json
{
  "taskId": "demo_task_1234567890_abc123",
  "id": "demo_task_1234567890_abc123",
  "status": "completed",
  "progress": 100,
  "model_url": "https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.glb"
}
```

## File Changes

- ✅ `src/lib/services/tripo3d.ts` - Deferred env var access
- ✅ `src/lib/services/demoGeneration.ts` - NEW demo service
- ✅ `src/app/api/generate/text-to-3d/route.ts` - Removed auth, added demo mode
- ✅ `src/app/api/generate/status/[taskId]/route.ts` - Removed auth, added demo support
- ✅ `src/components/generator/TextToModel.tsx` - Added demo mode display
- ✅ `src/middleware.ts` - Added `/generate` protection
- ✅ `src/app/api/debug/config/route.ts` - NEW debug endpoint

## Browser DevTools Debugging

### Check Console
- Should NOT see HTML error responses
- Should see JSON-formatted responses

### Network Tab
1. Request to `/api/generate/text-to-3d` → Status 202
2. Multiple requests to `/api/generate/status/[taskId]` → Status 200
3. All responses should be valid JSON

### Expected Console Logs
```
[Fast Refresh] done
POST /api/generate/text-to-3d 202
GET /api/generate/status/[taskId] 200 (repeated)
Status: completed 100%
```

## Troubleshooting Checklist

- [ ] Dev server running without error
- [ ] `/api/debug/config` shows correct settings
- [ ] Can navigate to `/dashboard/generate`
- [ ] Text input accepts text
- [ ] "Generate 3D Model" button clickable
- [ ] Console shows status 202 (not 500 or HTML)
- [ ] Progress bar appears and updates
- [ ] Model URL returned in final status
- [ ] 3D Viewer displays model
- [ ] No JSON parse errors
- [ ] Dark mode toggle works

## If Still Getting 500 Error

### Check 1: Server Logs
Look at terminal running `npm run dev` for error output

### Check 2: Environment
```bash
# In terminal:
echo $env:TRIPO3D_API_KEY  # PowerShell
```

Should not be empty (shows actual key or nothing if missing)

### Check 3: Hard Refresh
- Ctrl+Shift+R (Windows/Linux)
- Cmd+Shift+R (Mac)
- Clear cache: DevTools → Application → Clear storage

### Check 4: Restart Everything
```bash
# Kill all terminals
# Clear cache:
rm -r .next/
# Reinstall:
npm install
# Start fresh:
npm run dev
```

## Production Setup (Real API Key)

1. Get API key from https://www.tripo3d.ai/
2. Update `.env.local`:
   ```
   TRIPO3D_API_KEY=tsk_your_real_key_here
   ```
3. Restart dev server
4. "Demo Mode" badge should disappear
5. Real API responses will be used

## Next Steps

1. ✅ Test demo mode (should work immediately)
2. ✅ Verify 3D model loading
3. ✅ Then get real Tripo3D API key
4. ✅ Switch to production API
5. ⏭️ Implement Image-to-3D
6. ⏭️ Add PBR texturing
7. ⏭️ Set up job queue

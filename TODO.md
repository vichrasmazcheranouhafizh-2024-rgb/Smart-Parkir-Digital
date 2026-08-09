# TODO — ParkWise Navigation & Role Login Wiring

## Steps
- [x] Read project structure & inventory all feature components
- [x] Run `tsc --noEmit` to identify compile errors (12 errors found)
- [x] Add missing component exports to `src/components/index.ts`
- [x] Wire per-role `RoleLoginView` into `App.tsx` nav flow (login per role)
- [x] Track authenticated account (email/fullName) in App state
- [x] Fix `AdminDashboard` activeMenu type union
- [x] Fix `JukirProfileView` Record cast
- [x] Fix `PetugasScanner` torch method typing
- [x] Verify with `npx tsc --noEmit` (0 errors — EXIT=0)
- [x] Run `npm run dev` to confirm app boots

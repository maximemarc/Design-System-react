# Project memory

## Product intent & audience

- Reusable, customizable React design pattern library for production use across projects.
- Includes themed demo previews; current theme: **wedding** with a live countdown timer.
- Audience: developers seeking polished, drop-in UI patterns rather than boilerplate.

## Brand personality & voice

- Fluid, modern, animated, fully customizable.
- Emphasis on beautiful, non-cookie-cutter, production-grade design.

## Visual design & UX direction

- **Wedding theme**: countdown timer with calendar date picker + time selector.
- Countdown updates dynamically as user picks date/time.
- Shows timezone label alongside countdown.
- Displays a message when the selected date/time is reached.
- Picker controls are embedded directly inside the wedding preview (not a separate config screen).
- Interactions should feel immediate and seamless.

## Decisions, constraints & rationale

- Framework: Vite + React.
- Date/time selections are currently **temporary** (session-only, not persisted).
- Automated checks pass; manual browser interaction testing still pending.
- Global styling/tech constraints (Tailwind, Lucide, `@/` alias, no extra UI packages) are governed by `.bolt/prompt`; not restated here.

## Open questions & assumptions

- Should selected event date/time persist (localStorage or app state) across reloads?
- Will additional themes beyond "wedding" be added, and should the picker be reusable across themes?
- Is timezone selection needed, or is local timezone sufficient?
- Accessibility of the date/time picker (keyboard nav, screen readers) not yet verified.
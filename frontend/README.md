# CodeLens Frontend

CodeLens is a React dashboard for viewing API Gateway and service health. It is
built with React 19, Vite, Tailwind CSS 4, Lucide icons, and Recharts.

## Run the frontend

From this directory:

```bash
npm install
npm run dev
```

Vite prints the local URL (usually `http://localhost:5173`). The dashboard
requests live health data from `http://localhost:8080/service-health`, so start
the API Gateway as well. If the browser reports a CORS error, configure the
gateway to allow the Vite development origin.

Other commands:

```bash
npm run build    # Create a production bundle in dist/
npm run preview  # Preview the production bundle locally
npm run lint     # Run ESLint
```

## How the frontend is organized

The entry point is `src/main.jsx`. It loads the global stylesheet and mounts
`App` into the page. `src/App.jsx` composes the dashboard and owns the shared
state:

- `activePage` controls the selected navigation label and header title.
- `sidebarOpen` controls the mobile navigation drawer.
- `services`, `healthLoading`, `healthError`, and `lastChecked` track the
  service-health check.
- A health check runs on startup and can be triggered from either refresh
  button.

The dashboard is split into focused components in `src/component/`:

| Component | Responsibility |
| --- | --- |
| `Sidebar.jsx` | Navigation, mobile drawer, and workspace information |
| `DashboardHeader.jsx` | Current section title, environment label, and health-check action |
| `OverviewSummary.jsx` | Overview introduction, last-check time, and health error |
| `MetricGrid.jsx` | Arranges the summary metric cards |
| `MetricCard.jsx` | Displays one metric, its change indicator, and icon |
| `TrafficChart.jsx` | Recharts area chart with illustrative traffic data |
| `RateLimiterCard.jsx` | Displays the example rate-limit policy and percentages |
| `ServicesTable.jsx` | Service names, ports, statuses, latency, and refresh action |
| `ServiceStatusBadge.jsx` | Color-coded service status indicator |
| `DashboardFooter.jsx` | Dashboard footer and data caveat |

`src/services/healthService.js` contains the HTTP request. It checks for network
and HTTP errors and validates that the response is an object before returning
it. `App.jsx` translates the gateway response into display statuses:

- `API Gateway` is marked online when the health request succeeds. Its latency
  is the elapsed time for that request.
- `user-service`, `product-service`, and `order-service` are online only when
  their corresponding response value is `"UP"`.
- `Redis` is shown as not monitored.
- If the request fails, the error is displayed and the gateway/services are
  marked offline/unknown.

Traffic chart points, metric totals, and rate-limit usage/percentages are
illustrative demo values, not live measurements. Navigation currently updates
the selected label and header; it does not switch to separate page content.

## Styling and utility classes

`src/index.css` imports Tailwind with `@import "tailwindcss";` and defines the
global font, page colors, box sizing, and minimum body dimensions. Most visual
styling is written directly in JSX as Tailwind utility classes; there are no
component-specific CSS class rules for the dashboard. The old Vite starter
styles in `src/App.css` are not imported by the current entry point.

Tailwind utilities are small, composable classes. For example:

```jsx
<div className="flex items-center gap-3 rounded-xl border p-4">
```

This creates a flex row, vertically centers its children, adds a gap, rounds
the corners, draws a border, and adds padding. A JSX `className` can contain
many such utilities; they are not separate CSS files or React components.

### Common classes used by this dashboard

| Class pattern | What it does | Example |
| --- | --- | --- |
| `flex`, `grid` | Selects a flexbox or grid layout | `flex items-center`, `grid grid-cols-2` |
| `items-center`, `items-end` | Aligns children on the cross axis | Vertically centers a row |
| `justify-between`, `justify-center` | Distributes or centers children | Header actions |
| `gap-*`, `space-y-*` | Adds spacing between children | `gap-3`, `space-y-7` |
| `p-*`, `px-*`, `py-*`, `mt-*` | Adds padding or margin | `px-4`, `mt-5` |
| `w-*`, `h-*`, `min-h-*`, `max-w-*` | Sets width and height constraints | `min-h-screen`, `max-w-[1600px]` |
| `text-*`, `font-*`, `tracking-*`, `leading-*` | Controls text size, color, weight, spacing, and line height | `text-sm text-zinc-400 font-semibold` |
| `bg-*`, `text-*`, `border-*` | Sets background, foreground, and border colors | `bg-[#111113]`, `border-white/[0.08]` |
| `rounded-*` | Rounds corners | `rounded-xl`, `rounded-full` |
| `overflow-*` | Controls overflowing content | `overflow-x-auto` keeps the table usable on narrow screens |
| `hidden`, `block`, `flex` | Controls display | `hidden sm:flex` shows an element at the `sm` breakpoint and above |
| `sticky`, `fixed`, `inset-*`, `z-*` | Positions elements and sets stacking order | Sticky header and mobile drawer |
| `hover:*`, `disabled:*` | Applies styles for interaction states | `hover:bg-white/[0.08]`, `disabled:opacity-60` |
| `animate-spin` | Rotates an element continuously | Health refresh icon while loading |

The prefixes `sm:`, `md:`, and `xl:` apply a utility at Tailwind's corresponding
responsive breakpoint and above. For example, `md:ml-64` reserves space for the
desktop sidebar, while `md:hidden` hides the mobile menu button on desktop.
`max-w-[1600px]`, `bg-[#09090b]`, and values like `border-white/[0.08]` are
Tailwind arbitrary values: they express a custom value inline rather than
referencing a named spacing or color token.

Utilities are applied only to the element whose `className` contains them;
they do not automatically style child components. For example, a parent's
`p-4` adds padding to that parent, not each child, and `text-zinc-400` does not
set the background color. Responsive and state prefixes are variants, not
separate classes that need to be declared in a stylesheet.

### Styling the dashboard

1. Adjust global defaults (font, page background, or box sizing) in
   `src/index.css`.
2. Adjust a component's layout or appearance using Tailwind utilities in that
   component's `className`.
3. Use responsive variants such as `sm:` and `md:` for viewport-specific
   behavior, and `hover:` or `disabled:` for interaction states.
4. For genuinely reusable styling that cannot be expressed clearly with
   utilities, add a named CSS rule and import its stylesheet explicitly. Avoid
   editing the unused Vite starter rules in `src/App.css` unless that file is
   intentionally brought back into use.

## Dependencies

- **React** renders the component tree and manages UI state.
- **Vite** provides the development server and production build.
- **Tailwind CSS** provides the utility classes used in JSX.
- **Lucide React** supplies navigation, status, and action icons.
- **Recharts** renders the demo traffic chart.

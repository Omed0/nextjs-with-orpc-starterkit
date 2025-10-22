# PostHog Analytics Dashboard

A comprehensive analytics dashboard for monitoring application usage, user behavior, and performance metrics using PostHog.

## Features

- **Real-time Metrics Overview**
  - Total events tracked
  - Unique users count
  - Pageviews
  - Active sessions

- **Top Events Tracking**
  - Most frequently triggered events
  - Event counts and rankings

- **Page Analytics**
  - Most visited pages
  - Unique visitors per page
  - Pageview counts

- **User Behavior Analysis**
  - Recent events stream
  - Real-time activity monitoring
  - Event details (timestamp, type, browser, OS)

- **Browser & Device Statistics**
  - Browser usage distribution
  - Device type breakdown
  - User counts per platform

## Architecture

### Server-Side (oRPC Procedures)

All analytics data fetching happens server-side using protected oRPC procedures:

```typescript
// src/o-rpc/analytics.ts
- getOverviewMetrics  // Total events, users, pageviews, sessions
- getTopEvents        // Most frequent events
- getTopPages         // Most visited pages
- getEventsTrend      // Events over time (trends)
- getRecentEvents     // Latest activity stream
- getBrowserStats     // Browser usage statistics
- getDeviceStats      // Device type distribution
```

### Client-Side (React Components)

```typescript
// src/components/analytics/
- AnalyticsManager     // Main container with auto-refresh
- AnalyticsMetrics     // Overview metric cards
- AnalyticsTable       // Various data tables
- index.ts             // Barrel exports
```

## Usage

### Basic Implementation

```tsx
import { AnalyticsManager } from "@/components/analytics";

export default function AnalyticsPage() {
  return <AnalyticsManager />;
}
```

### Individual Components

```tsx
import {
  AnalyticsMetrics,
  TopEventsTable,
  TopPagesTable,
  BrowserStatsTable,
} from "@/components/analytics";

// Use components individually
<AnalyticsMetrics metrics={metricsData} />
<TopEventsTable events={eventsData.events} />
<TopPagesTable pages={pagesData.pages} />
<BrowserStatsTable browsers={browsersData.browsers} />
```

## API Integration

### PostHog Query API

The system uses PostHog's Query API with HogQL for data retrieval:

```typescript
const query = {
  query: {
    kind: "HogQLQuery",
    query: `SELECT count() as total FROM events WHERE event = '$pageview'`,
  },
  name: "Get total pageviews",
};

const result = await fetch(
  `${POSTHOG_API_HOST}/api/projects/${PROJECT_ID}/query/`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PERSONAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  }
);
```

### Date Range Filtering

All analytics procedures support optional date range filtering:

```typescript
// Get metrics for last 7 days
const metrics = await client.analytics.getOverviewMetrics({
  from: "2025-01-01",
  to: "2025-01-07",
});

// Get all-time metrics
const allTimeMetrics = await client.analytics.getOverviewMetrics({});
```

## Environment Variables

Required PostHog environment variables:

```env
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_PROJECT_ID=12345
NEXT_PUBLIC_POSTHOG_API_HOST=https://us.posthog.com
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxx
```

**Important Notes:**
- `NEXT_PUBLIC_POSTHOG_KEY` is the **project API key** (public, for client-side)
- `POSTHOG_PERSONAL_API_KEY` is your **personal API key** (private, server-side only)
- `NEXT_PUBLIC_POSTHOG_PROJECT_ID` is your project ID number
- API host differs from ingest host (no `/ingest` path)

## Auto-Refresh

The dashboard automatically refreshes data at different intervals:

- **Overview Metrics**: Every 30 seconds
- **Top Events/Pages**: Every 30 seconds
- **Browser/Device Stats**: Every 30 seconds
- **Recent Events**: Every 10 seconds (for real-time feel)

Manual refresh is also available via the refresh button.

## Security

- All analytics procedures use `protectedProcedure` requiring authentication
- Personal API key is stored server-side only
- No sensitive data exposed to client
- Rate limiting handled by PostHog API (240 requests/minute for analytics)

## Data Structure

### Overview Metrics Response
```typescript
{
  totalEvents: number;
  totalUsers: number;
  totalPageviews: number;
  totalSessions: number;
}
```

### Top Events Response
```typescript
{
  events: Array<{
    name: string;
    count: number;
  }>;
}
```

### Top Pages Response
```typescript
{
  pages: Array<{
    url: string;
    views: number;
    uniqueVisitors: number;
  }>;
}
```

### Recent Events Response
```typescript
{
  events: Array<{
    timestamp: string;
    event: string;
    personId: string;
    url: string | null;
    browser: string | null;
    os: string | null;
  }>;
}
```

### Browser Stats Response
```typescript
{
  browsers: Array<{
    browser: string;
    count: number;
    uniqueUsers: number;
  }>;
}
```

### Device Stats Response
```typescript
{
  devices: Array<{
    device: string;
    count: number;
    uniqueUsers: number;
  }>;
}
```

## HogQL Examples

### Count Total Events
```sql
SELECT count() as total_events 
FROM events
```

### Get Unique Users
```sql
SELECT count(DISTINCT person_id) as total_users 
FROM events
```

### Top Events by Count
```sql
SELECT 
  event as name,
  count() as count
FROM events 
GROUP BY event 
ORDER BY count DESC 
LIMIT 10
```

### Page Analytics
```sql
SELECT 
  properties.$current_url as url,
  count() as views,
  count(DISTINCT person_id) as unique_visitors
FROM events 
WHERE event = '$pageview' 
  AND properties.$current_url IS NOT NULL
GROUP BY properties.$current_url 
ORDER BY views DESC 
LIMIT 10
```

### Events Trend (Daily)
```sql
SELECT 
  toStartOfDay(timestamp) as date,
  count() as count
FROM events 
GROUP BY date 
ORDER BY date ASC
```

### Browser Statistics
```sql
SELECT 
  properties.$browser as browser,
  count() as count,
  count(DISTINCT person_id) as unique_users
FROM events 
WHERE properties.$browser IS NOT NULL
GROUP BY properties.$browser 
ORDER BY count DESC 
LIMIT 10
```

## Customization

### Adding New Metrics

1. **Create oRPC Procedure** (`src/o-rpc/analytics.ts`):
```typescript
export const getCustomMetric = protectedProcedure
  .input(z.object({ /* your input schema */ }))
  .handler(async ({ input }) => {
    const query = {
      query: {
        kind: "HogQLQuery",
        query: `/* your HogQL query */`,
      },
      name: "Your metric name",
    };
    
    const result = await makePostHogRequest("/query/", {
      method: "POST",
      body: JSON.stringify(query),
    });
    
    return { /* your formatted data */ };
  });
```

2. **Add to Component**:
```tsx
const { data } = useQuery({
  queryKey: ["analytics", "custom-metric"],
  queryFn: () => client.analytics.getCustomMetric({}),
  refetchInterval: 30000,
});
```

### Styling

All components use shadcn/ui components with Tailwind CSS. Customize by:

- Modifying component classes
- Using shadcn/ui theming
- Adjusting Tailwind config

## Troubleshooting

### "Failed to fetch analytics overview"

**Cause**: PostHog API authentication or configuration issue

**Solution**: 
- Verify environment variables are set correctly
- Check `POSTHOG_PERSONAL_API_KEY` has required scopes
- Ensure project ID is correct

### Empty Data Tables

**Cause**: No events captured yet or date range too narrow

**Solution**:
- Verify PostHog is capturing events (check PostHog dashboard)
- Remove date range filters to see all-time data
- Check browser console for client-side errors

### Rate Limiting Errors

**Cause**: Exceeding PostHog API rate limits (240/min for analytics)

**Solution**:
- Increase `refetchInterval` in queries
- Reduce number of simultaneous requests
- Implement request queuing

### TypeScript Errors

**Cause**: Missing types or incorrect API response structure

**Solution**:
- Check PostHog API response structure has not changed
- Update type definitions if needed
- Add proper error handling

## Performance Tips

1. **Use Date Ranges**: Narrow queries with date filters for faster responses
2. **Limit Results**: Use reasonable limits (10-50 items) for list queries
3. **Cache Wisely**: Adjust `refetchInterval` based on data freshness needs
4. **Lazy Load**: Load heavy components only when needed
5. **Server-Side Only**: Keep API keys server-side, never expose to client

## Related Documentation

- [PostHog API Documentation](https://posthog.com/docs/api)
- [PostHog HogQL Documentation](https://posthog.com/docs/hogql)
- [PostHog Query API](https://posthog.com/docs/api/query)
- [oRPC Documentation](https://orpc.io)
- [TanStack Query Documentation](https://tanstack.com/query)

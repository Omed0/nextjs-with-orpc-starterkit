# 📊 Analytics with PostHog

Product analytics platform integration for tracking user behavior, events, and gaining insights with PostHog.

## Overview

PostHog is an open-source product analytics platform that provides event tracking, user analytics, and insights without vendor lock-in.

## Features

✅ Real-time event tracking  
✅ User behavior analysis  
✅ Page view tracking  
✅ Custom event capture  
✅ Session recording  
✅ Feature flags  
✅ A/B testing  
✅ Self-hostable  
✅ Privacy-focused  

## Configuration

### Environment Variables

```env
# Public (Client-side)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx  # Project API key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com  # or eu.i.posthog.com
NEXT_PUBLIC_POSTHOG_API_HOST=https://us.posthog.com  # API host (no /ingest)
NEXT_PUBLIC_POSTHOG_PROJECT_ID=12345  # Project ID

# Private (Server-side)
POSTHOG_PERSONAL_API_KEY=phx_xxxxxxxxxxxxx  # Personal API key
```

### Get PostHog Credentials

1. Sign up at [PostHog Cloud](https://posthog.com/) or self-host
2. Create a project
3. Get **Project API Key** from Settings → Project
4. Get **Project ID** from URL or Settings
5. Create **Personal API Key** from Settings → Personal API Keys (needs "Query Read" permission)

### Choose Region

- **US**: `https://us.i.posthog.com` (ingest), `https://us.posthog.com` (API)
- **EU**: `https://eu.i.posthog.com` (ingest), `https://eu.posthog.com` (API)

## Client Setup

### Provider Setup (`src/app/layout.tsx`)

```typescript
import { PostHogProvider } from '@/components/analytics';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
```

### PostHog Configuration

```typescript
// components/analytics/posthog-provider.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as Provider } from 'posthog-js/react';
import { env } from '@/lib/utils/env';

if (typeof window !== 'undefined') {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    capture_pageviews: false, // We handle this manually
    capture_pageleave: true,
    autocapture: false, // Manual event tracking
  });
}

export function PostHogProvider({ children }) {
  return <Provider client={posthog}>{children}</Provider>;
}
```

## Client-Side Tracking

### Track Page Views

```typescript
'use client';

import { usePostHog } from 'posthog-js/react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const posthog = usePostHog();

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url += `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, posthog]);

  return null;
}
```

### Track Custom Events

```typescript
'use client';

import { usePostHog } from 'posthog-js/react';

export function MyComponent() {
  const posthog = usePostHog();

  function handleButtonClick() {
    posthog.capture('button_clicked', {
      button_name: 'subscribe',
      location: 'homepage',
    });
  }

  return <button onClick={handleButtonClick}>Subscribe</button>;
}
```

### Identify Users

```typescript
import { usePostHog } from 'posthog-js/react';

function identifyUser(user: { id: string; email: string; name: string }) {
  const posthog = usePostHog();
  
  posthog.identify(user.id, {
    email: user.email,
    name: user.name,
  });
}
```

### Track User Properties

```typescript
posthog.people.set({
  plan: 'premium',
  signup_date: '2024-01-01',
  feature_flags: ['new_ui', 'beta_access'],
});
```

## Server-Side Analytics

### oRPC Procedures (`src/o-rpc/analytics.ts`)

```typescript
import { publicProcedure } from './base';
import { z } from 'zod';

export const analyticsRouter = {
  getPageViews: publicProcedure
    .input(z.object({
      days: z.number().default(7),
    }))
    .handler(async ({ input }) => {
      // Query PostHog API
      const response = await fetch(
        `${env.NEXT_PUBLIC_POSTHOG_API_HOST}/api/projects/${env.NEXT_PUBLIC_POSTHOG_PROJECT_ID}/insights/trend/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.POSTHOG_PERSONAL_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            events: [{ id: '$pageview', name: '$pageview', type: 'events' }],
            date_from: `-${input.days}d`,
            interval: 'day',
          }),
        }
      );

      return await response.json();
    }),
};
```

### Query PostHog Data

```typescript
async function getAnalytics() {
  const baseUrl = env.NEXT_PUBLIC_POSTHOG_API_HOST;
  const projectId = env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
  const apiKey = env.POSTHOG_PERSONAL_API_KEY;

  const response = await fetch(
    `${baseUrl}/api/projects/${projectId}/insights/trend/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [
          { id: '$pageview', name: '$pageview', type: 'events' }
        ],
        date_from: '-7d',
        interval: 'day',
        refresh: 'blocking', // Force fresh data
      }),
    }
  );

  return await response.json();
}
```

## Analytics Dashboard

Located at `/admin/analytic`:

```typescript
'use client';

import { orpc } from '@/lib/orpc';
import { AnalyticsMetrics, AnalyticsTables } from '@/components/analytics';

export default function AnalyticsPage() {
  const { data: pageViews } = orpc.analytics.getPageViews.useQuery({ days: 7 });
  const { data: topPages } = orpc.analytics.getTopPages.useQuery({ limit: 10 });

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <AnalyticsMetrics data={pageViews} />
      <AnalyticsTables data={topPages} />
    </div>
  );
}
```

## Common Events

### E-commerce Events

```typescript
// Product viewed
posthog.capture('product_viewed', {
  product_id: 'prod_123',
  product_name: 'T-Shirt',
  price: 29.99,
  category: 'clothing',
});

// Add to cart
posthog.capture('add_to_cart', {
  product_id: 'prod_123',
  quantity: 2,
  value: 59.98,
});

// Purchase
posthog.capture('purchase', {
  order_id: 'order_456',
  revenue: 59.98,
  products: ['prod_123', 'prod_124'],
});
```

### User Engagement

```typescript
// Sign up
posthog.capture('user_signed_up', {
  method: 'email',  // or 'google', 'github'
  referral_source: 'landing_page',
});

// Feature used
posthog.capture('feature_used', {
  feature_name: 'export_csv',
  user_plan: 'premium',
});
```

## PostHog Queries

### Trends Query

```typescript
const query = {
  kind: 'TrendsQuery',
  series: [
    {
      event: '$pageview',
      kind: 'EventsNode',
    },
  ],
  trendsFilter: {
    display: 'ActionsLineGraph',
  },
  interval: 'day',
  dateRange: {
    date_from: '-7d',
  },
};
```

### Funnel Query

```typescript
const query = {
  kind: 'FunnelsQuery',
  series: [
    { event: 'page_view', kind: 'EventsNode' },
    { event: 'add_to_cart', kind: 'EventsNode' },
    { event: 'checkout', kind: 'EventsNode' },
    { event: 'purchase', kind: 'EventsNode' },
  ],
  funnelsFilter: {
    funnelWindowInterval: 14,
    funnelWindowIntervalUnit: 'day',
  },
};
```

## Best Practices

### 1. Event Naming Convention

Use snake_case and be descriptive:
```typescript
// ✅ Good
posthog.capture('product_added_to_cart');
posthog.capture('user_updated_profile');

// ❌ Bad
posthog.capture('click');
posthog.capture('ProductAddedToCart');
```

### 2. Include Context

```typescript
posthog.capture('button_clicked', {
  button_name: 'subscribe',
  button_location: 'header',
  page_path: window.location.pathname,
  user_plan: 'free',
});
```

### 3. Don't Track PII

```typescript
// ❌ Don't track emails, passwords, credit cards
posthog.capture('form_submitted', {
  email: 'user@example.com',  // Bad!
});

// ✅ Use anonymous identifiers
posthog.capture('form_submitted', {
  form_type: 'contact',
  user_id: 'user_123',
});
```

### 4. Retry Failed Requests

```typescript
const response = await fetch(posthogUrl, {
  method: 'POST',
  body: JSON.stringify(data),
});

if (!response.ok && response.status === 429) {
  // Rate limited, retry after delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  // Retry request
}
```

## Session Recording

Enable in PostHog settings:

```typescript
posthog.init(key, {
  api_host: host,
  session_recording: {
    enabled: true,
    maskAllInputs: true,  // Privacy
    maskAllText: false,
  },
});
```

## Feature Flags

```typescript
// Check feature flag
const showNewUI = posthog.isFeatureEnabled('new_ui');

if (showNewUI) {
  return <NewUI />;
}
return <OldUI />;
```

## Troubleshooting

### Events Not Showing

1. Check API key is correct
2. Verify region matches (US vs EU)
3. Check browser console for errors
4. Wait a few seconds for events to process

### Personal API Key Issues

1. Generate new key at PostHog Settings → Personal API Keys
2. Ensure "Query Read" permission is enabled
3. Don't share personal API keys

## Resources

- [PostHog Documentation](https://posthog.com/docs)
- [PostHog API Reference](https://posthog.com/docs/api)
- [PostHog React SDK](https://posthog.com/docs/libraries/react)
- [Event Tracking Guide](https://posthog.com/docs/data/events)

---

[← Back to Main README](../README.md)

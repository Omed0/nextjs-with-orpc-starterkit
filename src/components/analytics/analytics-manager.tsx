"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/orpc";
import { AnalyticsMetrics } from "./analytics-metrics";
import {
    TopEventsTable,
    TopPagesTable,
    RecentEventsTable,
    BrowserStatsTable,
    DeviceStatsTable,
} from "./analytics-tables";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AnalyticsManager() {
    const [dateRange, setDateRange] = useState<{ days?: number }>({
        days: 30, // Default to last 30 days
    });

    // Fetch overview metrics
    const {
        data: metricsData,
        isLoading: metricsLoading,
        refetch: refetchMetrics,
    } = useQuery({
        queryKey: ["analytics", "overview", dateRange],
        queryFn: () => client.analytics.getOverviewMetrics(dateRange),
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    // Fetch top events
    const {
        data: eventsData,
        isLoading: eventsLoading,
        refetch: refetchEvents,
    } = useQuery({
        queryKey: ["analytics", "top-events", dateRange],
        queryFn: () =>
            client.analytics.getTopEvents({ ...dateRange, limit: 10 }),
        refetchInterval: 30000,
    });

    // Fetch top pages
    const {
        data: pagesData,
        isLoading: pagesLoading,
        refetch: refetchPages,
    } = useQuery({
        queryKey: ["analytics", "top-pages", dateRange],
        queryFn: () => client.analytics.getTopPages({ ...dateRange, limit: 10 }),
        refetchInterval: 30000,
    });

    // Fetch recent events
    const {
        data: recentData,
        isLoading: recentLoading,
        refetch: refetchRecent,
    } = useQuery({
        queryKey: ["analytics", "recent-events"],
        queryFn: () => client.analytics.getRecentEvents({ limit: 20 }),
        refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
    });

    // Fetch browser stats
    const {
        data: browsersData,
        isLoading: browsersLoading,
        refetch: refetchBrowsers,
    } = useQuery({
        queryKey: ["analytics", "browsers", dateRange],
        queryFn: () => client.analytics.getBrowserStats(dateRange),
        refetchInterval: 30000,
    });

    // Fetch device stats
    const {
        data: devicesData,
        isLoading: devicesLoading,
        refetch: refetchDevices,
    } = useQuery({
        queryKey: ["analytics", "devices", dateRange],
        queryFn: () => client.analytics.getDeviceStats(dateRange),
        refetchInterval: 30000,
    });

    const handleRefreshAll = () => {
        refetchMetrics();
        refetchEvents();
        refetchPages();
        refetchRecent();
        refetchBrowsers();
        refetchDevices();
    };

    const isLoading =
        metricsLoading ||
        eventsLoading ||
        pagesLoading ||
        recentLoading ||
        browsersLoading ||
        devicesLoading;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Monitor your application performance and user behavior
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Date Range Selector */}
                    <Select
                        value={dateRange.days?.toString() || "7"}
                        onValueChange={(value) =>
                            setDateRange({ days: parseInt(value) })
                        }
                    >
                        <SelectTrigger className="w-[180px]">
                            <Calendar className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Last 24 hours</SelectItem>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="14">Last 14 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleRefreshAll}
                        disabled={isLoading}
                        variant="outline"
                    //size="sm"
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                        />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Overview Metrics */}
            {metricsLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="space-y-0 pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[120px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : metricsData ? (
                <AnalyticsMetrics metrics={metricsData} />
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-sm text-muted-foreground">
                            Failed to load analytics metrics
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Two-column layout for events and pages */}
            <div className="grid gap-6 md:grid-cols-2">
                {eventsLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[120px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px]" />
                        </CardContent>
                    </Card>
                ) : eventsData ? (
                    <TopEventsTable events={eventsData.events} />
                ) : null}

                {pagesLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[120px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px]" />
                        </CardContent>
                    </Card>
                ) : pagesData ? (
                    <TopPagesTable pages={pagesData.pages} />
                ) : null}
            </div>

            {/* Two-column layout for browser and device stats */}
            <div className="grid gap-6 md:grid-cols-2">
                {browsersLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[150px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px]" />
                        </CardContent>
                    </Card>
                ) : browsersData ? (
                    <BrowserStatsTable browsers={browsersData.browsers} />
                ) : null}

                {devicesLoading ? (
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-[150px]" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-[200px]" />
                        </CardContent>
                    </Card>
                ) : devicesData ? (
                    <DeviceStatsTable devices={devicesData.devices} />
                ) : null}
            </div>

            {/* Recent Events - Full width */}
            {recentLoading ? (
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-[150px]" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px]" />
                    </CardContent>
                </Card>
            ) : recentData ? (
                <RecentEventsTable events={recentData.events} />
            ) : null}
        </div>
    );
}

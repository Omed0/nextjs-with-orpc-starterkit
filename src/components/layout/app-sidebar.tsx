"use client";

import {
    Home,
    LayoutDashboard,
    ListTodo,
    Upload,
    BarChart3,
    Layers,
    Menu,
    Database,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    //SidebarTrigger,
} from "@/components/ui/sidebar";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import LocaleSwitcher from "./locale-switcher";
import { Separator } from "@/components/ui/separator";
import { env } from "@/lib/utils/env";
import { useLocale, useTranslations } from "next-intl";
import { isRTLLocale } from "@/i18n/config";

export function AppSidebar() {
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('navigation');

    // Menu items configuration with translation keys
    const menuItems = [
        {
            titleKey: "home",
            url: "/",
            icon: Home,
        },
        {
            titleKey: "dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            titleKey: "todos",
            url: "/todos",
            icon: ListTodo,
        },
        {
            titleKey: "uploadFile",
            url: "/admin/upload-file",
            icon: Upload,
        },
        {
            titleKey: "analytics",
            url: "/admin/analytic",
            icon: BarChart3,
        },
        {
            titleKey: "backup",
            url: "/admin/backup",
            icon: Database,
        },
        {
            titleKey: "queues",
            url: "/admin/queues",
            icon: Layers,
        },
    ];

    return (
        <Sidebar side={isRTLLocale(locale) ? "right" : "left"}>
            <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                    <Menu className="h-5 w-5" />
                    <span className="font-semibold text-lg">
                        {env.NEXT_PUBLIC_PROJECT_NAME}
                    </span>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('navigation')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => {
                                const isActive = pathname === item.url;
                                return (
                                    <SidebarMenuItem key={item.titleKey}>
                                        <SidebarMenuButton asChild isActive={isActive}>
                                            <Link href={item.url as any}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{t(item.titleKey)}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="flex flex-col gap-2 ">
                    <div className="flex-1 flex gap-2">
                        <LocaleSwitcher />
                        <ModeToggle />
                    </div>
                    <Separator />
                    <UserMenu inSidebar />
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}

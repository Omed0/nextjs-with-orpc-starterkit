"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient } from "@/lib/react-query/client";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { useLocale } from "next-intl";
import { isRTLLocale } from "@/i18n/config";
import { cn } from "@/lib/utils/utils";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => createQueryClient())
	const locale = useLocale()

	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<div
					className={cn(isRTLLocale(locale) ? "font-rabar" : "font-mono")}
					dir={isRTLLocale(locale) ? "rtl" : "ltr"}
				>
					{children}
				</div>
				<ReactQueryDevtools />
			</ThemeProvider>
		</QueryClientProvider>
	);
}



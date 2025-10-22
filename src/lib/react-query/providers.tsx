"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient } from "./client";
import { useState } from "react";
import { ThemeProvider } from "@/components/layout/theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(() => createQueryClient())
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				{children}
				<ReactQueryDevtools />
			</ThemeProvider>
		</QueryClientProvider>
	);
}



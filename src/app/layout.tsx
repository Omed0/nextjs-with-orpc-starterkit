import "@/lib/orpc.server";

import { ThemeProvider } from "@/components/layout/theme-provider";
import Providers from "@/lib/react-query/providers";
import { geistMono, geistSans } from "@/lib/utils/font";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/header";
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
	title: "digital-menu",
	description: "Digital Menu for Restaurants",
}

export default async function LocaleLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {

	return (
		<html suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
				cz-shortcut-listen="true"
			>
				<NextIntlClientProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<Providers>
							<div className="grid h-svh grid-rows-[auto_1fr]">
								<Header />
								{children}
							</div>
						</Providers>
						<Toaster richColors />
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

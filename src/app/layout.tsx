import "@/lib/orpc.server";

import Providers from "@/lib/react-query/providers";
import fonts from "@/lib/utils/font";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import Header from "@/components/layout/header";
import { env } from "@/lib/utils/env";
import type { Metadata } from "next";
import "@/app/globals.css";

export const metadata: Metadata = {
	title: env.NEXT_PUBLIC_PROJECT_NAME,
	description: "A bundle starter kit for Next.js with orpc integration.",
}

//export async function generateStaticParams() {
//	return locales.map((locale) => ({ locale })); //for this project not work, but if u using next-intl with routing, or with some of business logic u can enable this
//}

export default function LocaleLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const fontVariables = Object.values(fonts).map((font) => font.variable).join(" ");

	return (
		<html suppressHydrationWarning>
			<body
				className={`${fontVariables} antialiased`}
				cz-shortcut-listen="true"
			>
				<NextIntlClientProvider>
					<Providers>
						<SidebarProvider defaultOpen={false}>
							<AppSidebar />
							<main className="flex-1 w-full">
								<Header />
								<div className="container mx-auto">
									{children}
								</div>
							</main>
						</SidebarProvider>
					</Providers>
					<Toaster richColors />
				</NextIntlClientProvider>
			</body>
		</html>
	);
}

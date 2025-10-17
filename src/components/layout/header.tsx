"use client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import LocaleSwitcher from "./locale-switcher";
import { Suspense } from "react";
import { Button } from "../ui/button";
import { GlobeIcon } from "lucide-react";
import Link from "next/link";
import { env } from "@/lib/utils/env";

export default function Header() {
	const links: { href: string; label: string; }[] = [
		{ href: "", label: "Home" },
		{ href: "/dashboard", label: "Dashboard" },
		{ href: "/todos", label: "Todos" },
		{ href: "/dashboard/upload-file", label: "UploadFile" },
	]

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{links.map(({ href, label }) => {
						const url = new URL(href, env.NEXT_PUBLIC_SERVER_URL);
						return (
							<Link key={label} href={url}>
								{label}
							</Link>
						);
					})}
				</nav>
				<div className="flex items-center gap-2">
					<Suspense fallback={
						<Button variant="outline" className="flex items-center gap-2">
							<GlobeIcon className="h-5 w-5" />
						</Button>
					}>
						<LocaleSwitcher />
					</Suspense>
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}

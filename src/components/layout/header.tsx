"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Header() {
	const { isPending, data } = authClient.useSession();

	const user = data?.user;
	const initials = user?.name.charAt(0) || "U";

	return (
		<header className="w-full sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex-1 h-14 flex items-center justify-between gap-4 px-4">
				{/* Mobile sidebar trigger */}
				<SidebarTrigger className="-ml-1" />

				{/* Right side actions - visible on all screen sizes */}
				<div className="flex justify-end font-medium text-lg">
					{isPending ? (
						<Skeleton className="h-9 w-20" />
					) : user ? (
						<div className="flex gap-2 items-center">
							<Avatar>
								<AvatarImage
									src={user?.image || undefined}
									alt={user?.name || "User Avatar"}
								/>
								<AvatarFallback>
									{initials}
								</AvatarFallback>
							</Avatar>
							<span>{user?.name.split(" ")[0]}</span>
						</div>
					) : (
						<Link href="/sign-in" className={buttonVariants()}>
							Sign In
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}

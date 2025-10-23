import { client } from "@/lib/orpc";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	BarChart3,
	Users,
	FileText,
	Activity,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Dashboard() {
	const t = await getTranslations('dashboard');
	const [sessions, privateData] = await Promise.all([
		client.session(),
		client.privateData(),
	]);
	const user = sessions.session.user;

	// Generate ASCII art for welcome message
	const asciiArt = `
 ███╗   ██╗███████╗██╗  ██╗████████╗     ██╗███████╗
 ████╗  ██║██╔════╝╚██╗██╔╝╚══██╔══╝     ██║██╔════╝
 ██╔██╗ ██║█████╗   ╚███╔╝    ██║        ██║███████╗
 ██║╚██╗██║██╔══╝   ██╔██╗    ██║   ██   ██║╚════██║
 ██║ ╚████║███████╗██╔╝ ██╗   ██║   ╚█████╔╝███████║
 ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝    ╚════╝ ╚══════╝

 ██╗  ██╗██╗████████╗    ██╗    ██╗██╗████████╗██╗  ██╗
 ██║ ██╔╝██║╚══██╔══╝    ██║    ██║██║╚══██╔══╝██║  ██║
 █████╔╝ ██║   ██║       ██║ █╗ ██║██║   ██║   ███████║
 ██╔═██╗ ██║   ██║       ██║███╗██║██║   ██║   ██╔══██║
 ██║  ██╗██║   ██║       ╚███╔███╔╝██║   ██║   ██║  ██║
 ╚═╝  ╚═╝╚═╝   ╚═╝        ╚══╝╚══╝ ╚═╝   ╚═╝   ╚═╝  ╚═╝

	██████╗ ██████╗ ██████╗  ██████╗
 ██╔═══██╗██╔══██╗██╔══██╗██╔════╝
 ██║   ██║██████╔╝██████╔╝██║     
 ██║   ██║██╔══██╗██╔═══╝ ██║     
 ╚██████╔╝██║  ██║██║     ╚██████╗
	╚═════╝ ╚═╝  ╚═╝╚═╝      ╚═════╝
 `;

	return (
		<div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
			<div className="space-y-6">
				{/* Welcome Section with ASCII Art */}
				<div className="space-y-2">
					<div className="space-y-1">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
							{t('welcomeBack')}, {user.name}! 👋
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground">
							{t('happeningToday')}
						</p>
					</div>

					{/* ASCII Art Banner */}
					<Card dir="ltr" className="bg-gradient-to-br from-primary/5 via-primary/10 to-background border-primary/20 text-center">
						<CardContent>
							{/* Make ASCII responsive and allow horizontal scrolling on very small screens */}
							<pre className="text-[6px] sm:text-[8px] md:text-xs lg:text-sm leading-tight text-primary overflow-x-auto whitespace-pre">
								{asciiArt}
							</pre>
							<p className="mt-3 text-sm sm:text-base text-muted-foreground">
								{privateData.message}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>{t('quickActions')}</CardTitle>
						<CardDescription>
							{t('quickActionsDescription')}
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Responsive grid: 1 col mobile, 2 cols small, 3 cols md, 4 cols lg */}
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
							<QuickAction title={t('viewAnalytics')} href="/admin/analytic" Icon={BarChart3} />
							<QuickAction title={t('manageFiles')} href="/admin/upload-file" Icon={FileText} />
							<QuickAction title={t('checkQueues')} href="/admin/queues" Icon={Activity} />
							<QuickAction title={t('viewTodos')} href="/todos" Icon={Users} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function QuickAction({
	title,
	href,
	Icon,
}: {
	title: string;
	href: string;
	Icon?: LucideIcon;
}) {
	return (
		<Link
			href={href as any}
			className="w-full flex flex-col sm:flex-row items-center gap-3 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all text-sm sm:text-base font-medium justify-center text-center"
			aria-label={title}
		>
			{Icon ? <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary/90" /> : null}
			<span className="whitespace-nowrap">{title}</span>
		</Link>
	);
}

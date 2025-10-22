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
	TrendingUp,
	Activity,
	Clock,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import { textToAsciiArt } from "@/lib/utils/ascii-art";

export default async function Dashboard() {
	const [sessions, privateData] = await Promise.all([
		client.session(),
		client.privateData(),
	]);
	const user = sessions.session.user;

	// Generate ASCII art for welcome message
	const asciiArt = textToAsciiArt("NEXT.JS KIT WITH ORPC", {
		spacing: 0,
		uppercase: true,
	});

	return (
		<div className="container mx-auto py-8 px-4 max-w-7xl">
			<div className="space-y-8">
				{/* Welcome Section with ASCII Art */}
				<div className="space-y-4">
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight">
							Welcome back, {user.name}! 👋
						</h1>
						<p className="text-muted-foreground">
							Here's what's happening with your system today
						</p>
					</div>

					{/* ASCII Art Banner */}
					<Card className="bg-gradient-to-br from-primary/5 via-primary/10 to-background border-primary/20">
						<CardContent className="pt-6">
							<pre className="font-mono text-[8px] sm:text-xs leading-tight text-primary overflow-x-auto">
								{asciiArt}
							</pre>
							<p className="mt-4 text-sm text-muted-foreground text-center">
								{privateData.message}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Quick Actions */}
				<Card>
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>
							Common tasks and shortcuts
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
							<QuickAction title="View Analytics" href="/admin/analytic" />
							<QuickAction title="Manage Files" href="/admin/upload-file" />
							<QuickAction title="Check Queues" href="/admin/queues" />
							<QuickAction title="View Todos" href="/todos" />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}


function QuickAction({ title, href }: { title: string; href: string }) {
	return (
		<a
			href={href}
			className="flex items-center justify-center p-4 rounded-lg border bg-card hover:bg-accent hover:border-primary/50 transition-all text-sm font-medium"
		>
			{title}
		</a>
	);
}

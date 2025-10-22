import { client } from "@/lib/orpc";
import { getTranslations } from "next-intl/server";

const TITLE_TEXT = `
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

export default async function Home() {
	const t = await getTranslations('home');
	const healthCheck = await client.healthCheck() === "OK"

	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			<pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
			<div className="grid gap-6">
				<section className="rounded-lg border p-4">
					<h2 className="mb-2 font-medium">{t.raw("status")}</h2>
					<div className="flex items-center gap-2">
						<div
							className={`h-2 w-2 rounded-full ${healthCheck ? "bg-green-500" : "bg-red-500"}`}
						/>

						<span className="text-muted-foreground text-sm">
							{healthCheck
								? t.raw("connected")
								: t.raw("disconnected")}
						</span>
						{/*<span className="text-muted-foreground text-sm">
							{healthCheck.isLoading
								? "Checking..."
								: healthCheck.data
									? "Connected"
									: "Disconnected"}
						</span>*/}
					</div>
				</section>
			</div>
		</div>
	);
}


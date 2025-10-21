import { client } from "@/lib/orpc";


export default async function Dashboard() {
	//const session = await getSession(await headers())
	const [sessions, privateData] = await Promise.all([
		client.session(),
		client.privateData()
	]);
	const user = sessions.session.user;

	return (
		<div>
			<h1>Dashboard</h1>
			<p>Welcome {user.name}</p>
			<p>privateData: {privateData.message}</p>
		</div>
	);
}


export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <main className="p-2">
            {children}
        </main>
    );
}

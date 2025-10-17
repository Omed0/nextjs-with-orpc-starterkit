
export default async function MenuLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <main>
            {children}
        </main>
    );
}

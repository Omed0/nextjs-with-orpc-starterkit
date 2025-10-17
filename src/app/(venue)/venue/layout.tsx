
export default async function VenueLayout({
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

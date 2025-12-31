export default function PlainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="overflow-hidden relative">
      <main>{children}</main>
    </div>
  );
}

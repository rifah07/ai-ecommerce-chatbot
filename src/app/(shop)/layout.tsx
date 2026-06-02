export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar — added Day 4 */}
      <nav className="bg-white border-b px-6 py-4">
        <p className="font-semibold text-gray-900">
          ShopBot - Navbar
        </p>
      </nav>
      <main>{children}</main>
    </div>
  );
}

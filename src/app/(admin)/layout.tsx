export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-56 bg-white border-r p-4">
        <p className="font-semibold text-sm text-gray-500">Admin</p>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}

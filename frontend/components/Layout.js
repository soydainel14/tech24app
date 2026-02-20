import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="text-xl font-bold text-blue-600">Tech24.do</span>
          </Link>
          <nav className="space-x-4">
            <Link href="/catalogue" className="text-gray-600 hover:text-blue-600">Catálogo</Link>
            <Link href="/cart" className="text-gray-600 hover:text-blue-600">Carrito</Link>
            <Link href="/orders" className="text-gray-600 hover:text-blue-600">Mis órdenes</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-gray-200 text-center py-4 text-sm text-gray-600">
        © {new Date().getFullYear()} Tech24.do
      </footer>
    </div>
  );
}
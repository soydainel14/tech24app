import Layout from '@/components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold mb-4">Bienvenido a Tech24.do</h1>
        <p className="text-lg mb-6">Encuentra los mejores productos de tecnología con entrega rápida y segura.</p>
        <Link href="/catalogue" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700">
          Ver catálogo
        </Link>
      </div>
    </Layout>
  );
}
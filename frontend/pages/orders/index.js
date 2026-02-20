import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    async function fetchOrders() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al obtener órdenes');
        setOrders(data.orders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Mis órdenes</h1>
      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="bg-white p-4 rounded shadow">
            <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline font-semibold">
              {order.order_number}
            </Link>
            <p>Estado: {order.order_status}</p>
            <p>Monto: ${order.total_amount}</p>
          </li>
        ))}
        {orders.length === 0 && !loading && <p>No tienes órdenes.</p>}
      </ul>
    </Layout>
  );
}
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    async function fetchOrder() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error al obtener orden');
        setOrder(data.order);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Detalle de orden</h1>
      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {order && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="font-semibold">Número de orden: {order.order_number}</p>
            <p>Código de compra: {order.purchase_code}</p>
            <p>Estado de orden: {order.order_status}</p>
            <p>Estado de pago: {order.payment_status}</p>
            <p>Monto total: ${order.total_amount}</p>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold mb-2">Items</h2>
            <ul className="space-y-2">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>Producto #{item.product_id} x{item.quantity}</span>
                  <span>${item.subtotal}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Layout>
  );
}
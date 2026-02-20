import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

export default function Checkout() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [shippingInfo, setShippingInfo] = useState({ name: '', address: '', city: '', country: '' });
  const [paymentMethod, setPaymentMethod] = useState('SUR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Debe iniciar sesión para realizar la compra');
        router.push('/login');
        return;
      }
      const itemsPayload = cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity }));
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: itemsPayload,
          paymentMethod,
          shippingAddressId: null, // placeholder – shipping addresses can be managed in profile
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al crear orden');
      }
      const data = await res.json();
      setOrder(data.order);
      localStorage.removeItem('cart');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (order) {
    return (
      <Layout>
        <h1 className="text-2xl font-bold mb-4">Orden creada</h1>
        <p>Número de orden: {order.order_number}</p>
        <p>Código de compra: {order.purchase_code}</p>
        <p className="mt-4">Gracias por su compra. Recibirá un correo con los detalles.</p>
        <button className="mt-6 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700" onClick={() => router.push('/')}>Volver al inicio</button>
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <h2 className="font-semibold mb-2">Resumen de compra</h2>
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between py-1">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="font-bold flex justify-between border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
            </div>
          </div>
          <div>
            <h2 className="font-semibold mb-2">Información de envío</h2>
            <input type="text" placeholder="Nombre completo" className="border w-full p-2 mb-2" value={shippingInfo.name} onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })} required />
            <input type="text" placeholder="Dirección" className="border w-full p-2 mb-2" value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} required />
            <input type="text" placeholder="Ciudad" className="border w-full p-2 mb-2" value={shippingInfo.city} onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} required />
            <input type="text" placeholder="País" className="border w-full p-2" value={shippingInfo.country} onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })} required />
          </div>
          <div>
            <h2 className="font-semibold mb-2">Método de pago</h2>
            <select className="border w-full p-2" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="SUR">SUR</option>
              <option value="transferencia">Transferencia</option>
              <option value="cod">Contra entrega</option>
            </select>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700">
            {loading ? 'Procesando…' : 'Confirmar pedido'}
          </button>
        </form>
      )}
    </Layout>
  );
}
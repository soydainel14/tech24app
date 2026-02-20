import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useRouter } from 'next/router';

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(cart);
  }, []);

  const updateQuantity = (productId, quantity) => {
    const updated = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(quantity, 1) } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Carrito</h1>
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex items-center justify-between bg-white p-4 rounded shadow">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-500">${item.price}</p>
              </div>
              <div className="flex items-center">
                <input
                  type="number"
                  value={item.quantity}
                  min={1}
                  onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                  className="border rounded w-16 p-1 mr-2 text-center"
                />
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeItem(item.productId)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          <div className="text-right font-bold text-xl">Total: ${total.toFixed(2)}</div>
          <button
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
            onClick={() => router.push('/checkout')}
          >
            Proceder al checkout
          </button>
        </div>
      )}
    </Layout>
  );
}
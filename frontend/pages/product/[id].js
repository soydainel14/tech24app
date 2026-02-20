import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    async function fetchProduct() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`);
        if (!res.ok) throw new Error('Error al obtener producto');
        const data = await res.json();
        setProduct(data.product);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  return (
    <Layout>
      {loading && <p>Cargando…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {product && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-500 mb-2">SKU: {product.sku}</p>
          <p className="mb-4">{product.description}</p>
          <p className="text-3xl font-bold mb-4">${product.price}</p>
          <button
            className="w-full bg-green-600 text-white py-3 rounded-md hover:bg-green-700"
            onClick={() => {
              const cart = JSON.parse(localStorage.getItem('cart') || '[]');
              const existing = cart.find((item) => item.productId === product.id);
              if (existing) existing.quantity += 1;
              else cart.push({ productId: product.id, quantity: 1, name: product.name, price: product.price });
              localStorage.setItem('cart', JSON.stringify(cart));
              alert('Producto agregado al carrito');
            }}
          >
            Añadir al carrito
          </button>
        </div>
      )}
    </Layout>
  );
}
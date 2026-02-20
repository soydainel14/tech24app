import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function Catalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        if (!res.ok) throw new Error('Error fetching products');
        const data = await res.json();
        setProducts(data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Catálogo</h1>
      {loading && <p>Cargando productos…</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 bg-white">
            <Link href={`/product/${product.id}`}
              className="block text-lg font-semibold text-blue-600 hover:underline">
              {product.name}
            </Link>
            <p className="text-gray-500 mb-2">SKU: {product.sku}</p>
            <p className="font-bold mb-2">${product.price}</p>
            <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              onClick={() => {
                // basic cart add: store in localStorage
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
        ))}
      </div>
    </Layout>
  );
}
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProductScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/products/${id}`);
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

  const addToCart = async () => {
    try {
      const cartStr = await AsyncStorage.getItem('cart');
      const cart = cartStr ? JSON.parse(cartStr) : [];
      const existing = cart.find((item) => item.productId === product.id);
      if (existing) existing.quantity += 1;
      else cart.push({ productId: product.id, quantity: 1, name: product.name, price: product.price });
      await AsyncStorage.setItem('cart', JSON.stringify(cart));
      Alert.alert('Carrito', 'Producto agregado al carrito');
    } catch (err) {
      Alert.alert('Error', 'No se pudo agregar al carrito');
    }
  };

  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!product) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.sku}>SKU: {product.sku}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Button title="Añadir al carrito" onPress={addToCart} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sku: {
    color: '#666',
    marginBottom: 10,
  },
  description: {
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    padding: 20,
  },
});
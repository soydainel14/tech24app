import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CheckoutScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('SUR');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      const cartStr = await AsyncStorage.getItem('cart');
      setCartItems(cartStr ? JSON.parse(cartStr) : []);
    };
    loadCart();
  }, []);

  const handleSubmit = async () => {
    if (!cartItems.length) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de comprar');
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Autenticación', 'Inicia sesión en la web antes de comprar');
        return;
      }
      const itemsPayload = cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity }));
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: itemsPayload, paymentMethod, shippingAddressId: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear orden');
      await AsyncStorage.removeItem('cart');
      Alert.alert('Orden creada', `Número de orden: ${data.order.order_number}`);
      navigation.navigate('Home');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      {!cartItems.length ? (
        <Text>Tu carrito está vacío.</Text>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Información de envío</Text>
          <TextInput placeholder="Nombre completo" style={styles.input} value={name} onChangeText={setName} />
          <TextInput placeholder="Dirección" style={styles.input} value={address} onChangeText={setAddress} />
          <TextInput placeholder="Ciudad" style={styles.input} value={city} onChangeText={setCity} />
          <TextInput placeholder="País" style={styles.input} value={country} onChangeText={setCountry} />
          <Text style={styles.sectionTitle}>Método de pago</Text>
          <TextInput placeholder="SUR / transferencia / cod" style={styles.input} value={paymentMethod} onChangeText={setPaymentMethod} />
          {loading ? (
            <ActivityIndicator />
          ) : (
            <Button title="Confirmar pedido" onPress={handleSubmit} />
          )}
        </>
      )}
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
  },
});
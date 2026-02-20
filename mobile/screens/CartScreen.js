import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TextInput, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CartScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const loadCart = async () => {
      const cartStr = await AsyncStorage.getItem('cart');
      setCartItems(cartStr ? JSON.parse(cartStr) : []);
    };
    const unsubscribe = navigation.addListener('focus', loadCart);
    return unsubscribe;
  }, [navigation]);

  const updateQuantity = async (productId, quantity) => {
    const updated = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: Math.max(quantity, 1) } : item
    );
    setCartItems(updated);
    await AsyncStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = async (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    setCartItems(updated);
    await AsyncStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito</Text>
      {cartItems.length === 0 ? (
        <Text>Tu carrito está vacío.</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.productId.toString()}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text>${item.price}</Text>
                </View>
                <TextInput
                  style={styles.quantityInput}
                  keyboardType="numeric"
                  value={String(item.quantity)}
                  onChangeText={(text) => updateQuantity(item.productId, parseInt(text || '1'))}
                />
                <Button title="Eliminar" onPress={() => removeItem(item.productId)} color="red" />
              </View>
            )}
          />
          <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
          <Button title="Proceder al checkout" onPress={() => navigation.navigate('Checkout')} />
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  name: {
    fontSize: 16,
  },
  quantityInput: {
    width: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    marginHorizontal: 10,
    textAlign: 'center',
  },
  total: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});
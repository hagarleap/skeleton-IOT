import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as SignalR from '@microsoft/signalr';

const BASE_URL = "https://skeleton-app.azurewebsites.net/api";

export default function App() {
  const [counter, setCounter] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const signalrConnection = new SignalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/negotiate`, {
        withCredentials: false,
      })
      .withAutomaticReconnect()
      .configureLogging(SignalR.LogLevel.Information)
      .build();

    signalrConnection.on('newCountUpdate', (message) => {
      setCounter(parseInt(message));
    });

    signalrConnection.onclose(() => {
      console.log('Connection closed.');
    });

    const startConnection = async () => {
      try {
        await signalrConnection.start();
        console.log('SignalR connected.');
        setConnection(signalrConnection);
        readCounter();
      } catch (err) {
        console.log('SignalR connection error:', err);
        setTimeout(startConnection, 5000);
      }
    };

    setConnection(signalrConnection);
    startConnection();
  }, []);

  const increaseCounter = () => {
    fetch(`${BASE_URL}/IncreaseCounter`, {
      method: 'GET',
    })
      .then((response) => response.text())
      .then((text) => setCounter(parseInt(text)))
      .catch((error) => console.error(error));
  };

  const decreaseCounter = () => {
    fetch(`${BASE_URL}/DecreaseCounter`, {
      method: 'GET',
    })
      .then((response) => response.text())
      .then((text) => setCounter(parseInt(text)))
      .catch((error) => console.error(error));
  };

  const readCounter = () => {
    console.log("📞 Calling ReadCounter...");
    fetch(`${BASE_URL}/ReadCounter`, {
      method: 'GET',
    })
      .then((response) => {
        console.log("✅ ReadCounter response received");
        return response.text();
      })
      .then((text) => {
        console.log("📦 Raw response text:", text);
        const parsed = parseInt(text);
        if (!isNaN(parsed)) {
          setCounter(parsed);
          console.log("✅ Set counter to:", parsed);
        } else {
          console.warn("⚠️ Invalid response from backend:", text);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error reading counter:", error);
        setIsLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>Counter: {counter}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Increase" onPress={increaseCounter} />
        <Button title="Decrease" onPress={decreaseCounter} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  counterText: {
    fontSize: 32,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
});

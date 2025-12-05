import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Button,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from "react-native";

const Stack = createNativeStackNavigator();

// Reusable labeled input component
const LabeledInput = ({
  label,
  value,
  onChangeText,
  keyboardType = "default",
  placeholder,
  autoCapitalize = "none",
}) => {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
};

const MainScreen = ({ navigation }) => {
  const [baseCurrency, setBaseCurrency] = useState("CAD");
  const [destCurrency, setDestCurrency] = useState("USD");
  const [amount, setAmount] = useState("1");

  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateInput = () => {
    const currencyRegex = /^[A-Z]{3}$/;

    if (!currencyRegex.test(baseCurrency.trim())) {
      setErrorMessage("Base currency must be a 3-letter uppercase code (e.g. CAD).");
      return false;
    }

    if (!currencyRegex.test(destCurrency.trim())) {
      setErrorMessage("Destination currency must be a 3-letter uppercase code (e.g. USD).");
      return false;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Amount must be a positive number.");
      return false;
    }

    return true;
  };

  const handleConvert = async () => {
    setErrorMessage("");
    setConvertedAmount(null);
    setExchangeRate(null);

    if (!validateInput()) return;

    const numericAmount = parseFloat(amount);
    const base = baseCurrency.trim().toUpperCase();
    const dest = destCurrency.trim().toUpperCase();

    // NOTE: This key is hardcoded for simplicity as requested.
    // For a real app, this should be stored securely.
    const apiKey = "fca_live_oMoG8VygncoNd6rUsq3mMtjDYCzaSzjKtpjf9EXN";
    const url = `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&base_currency=${base}&currencies=${dest}`;

    try {
      setIsLoading(true);
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage("Invalid API Key. Please check the key in App.js.");
        } else {
          const errorData = await response.json().catch(() => null);
          setErrorMessage(errorData?.message || `Request failed with status ${response.status}.`);
        }
      } else {
        const json = await response.json();
        const rate = json.data?.[dest];
        if (rate) {
          setExchangeRate(rate);
          setConvertedAmount(numericAmount * rate);
        } else {
          setErrorMessage("Invalid currency code or missing exchange rate.");
        }
      }
    } catch (error) {
      setErrorMessage("A network error occurred. Please check your connection.");
      Alert.alert("Network Error", "Could not connect to the currency service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Currency Converter</Text>

        <LabeledInput
          label="Base Currency Code"
          value={baseCurrency}
          onChangeText={(text) => setBaseCurrency(text.toUpperCase())}
          placeholder="e.g. CAD"
          autoCapitalize="characters"
        />

        <LabeledInput
          label="Destination Currency Code"
          value={destCurrency}
          onChangeText={(text) => setDestCurrency(text.toUpperCase())}
          placeholder="e.g. USD"
          autoCapitalize="characters"
        />

        <LabeledInput
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g. 1"
        />

        {errorMessage ? (
          <View style={styles.errorContainer}><Text style={styles.errorText}>{errorMessage}</Text></View>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button title={isLoading ? "Converting..." : "Convert"} onPress={handleConvert} disabled={isLoading} />
        </View>

        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

        {!isLoading && convertedAmount !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>
              1 {baseCurrency} = {exchangeRate.toFixed(4)} {destCurrency}
            </Text>
            <Text style={styles.convertedAmountValue}>
              {convertedAmount.toFixed(2)}
            </Text>
            <Text style={styles.convertedAmountLabel}>{destCurrency}</Text>
          </View>
        )}

        <View style={{ marginTop: 24 }}>
          <Button title="Go to About Screen" onPress={() => navigation.navigate('About')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>About This App</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Student Name</Text>
            <Text style={styles.value}>Adam Fareed Syed</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Student ID</Text>
            <Text style={styles.value}>101261942</Text>
          </View>
        </View>
        <Text style={styles.description}>
          This application converts an amount from a base currency to a
          destination currency using live exchange rates from FreeCurrencyAPI.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainScreen} options={{ title: "Currency Converter" }} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
    fontWeight: "500",
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 14,
    color: "#166534",
    marginBottom: 8,
  },
  convertedAmountValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#15803D",
  },
  convertedAmountLabel: {
    fontSize: 16,
    color: "#166534",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    marginBottom: 12,
  },
  value: {
    fontSize: 18,
    color: "#1F2937",
  },
});
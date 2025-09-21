// Payment service utility functions

// Convert BDT to USD for international payments (approximate rate)
export const convertBDTToUSD = (bdtAmount) => {
  const exchangeRate = 110; // 1 USD = 110 BDT (approximate)
  return Math.round((bdtAmount / exchangeRate) * 100) / 100;
};

// Format amount for display
export const formatAmount = (amount, currency = 'BDT') => {
  if (currency === 'BDT') {
    return `৳${amount.toLocaleString()}`;
  }
  return `$${amount.toFixed(2)}`;
};

// Validate payment method
export const validatePaymentMethod = (method) => {
  const validMethods = ['COD', 'Stripe', 'bKash'];
  return validMethods.includes(method);
};

// Generate payment reference
export const generatePaymentReference = (orderNumber, method) => {
  const timestamp = Date.now();
  return `${method.toUpperCase()}-${orderNumber}-${timestamp}`;
};
// src/services/PaymentService.js
import { Alert } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useStore } from '../store';

class PaymentService {
  constructor() {
    this.razorpayKey = process.env.RAZORPAY_KEY || 'rzp_live_xxxxxxxx';
  }

  async processPayment(plan) {
    const plans = {
      monthly: {
        amount: 299, // $2.99 in cents
        description: 'Aura AI Monthly Premium'
      },
      lifetime: {
        amount: 1500, // $15.00 in cents
        description: 'Aura AI Lifetime Premium'
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return { success: false, message: 'Invalid plan selected' };
    }

    try {
      // For demo purposes, simulate payment
      // In production, use Razorpay or Flutterwave

      // Option 1: Razorpay (for India/Nigeria users)
      if (this.razorpayKey) {
        return await this.processRazorpay(selectedPlan);
      }

      // Option 2: Simulate payment (for testing)
      return await this.simulatePayment(selectedPlan);
      
    } catch (error) {
      console.error('Payment error:', error);
      return { success: false, message: 'Payment failed. Please try again.' };
    }
  }

  async processRazorpay(plan) {
    return new Promise((resolve) => {
      const options = {
        description: plan.description,
        image: 'https://yourapp.com/aura-logo.png',
        currency: 'USD',
        key: this.razorpayKey,
        amount: plan.amount,
        name: 'Aura AI',
        prefill: {
          email: 'user@example.com',
          contact: '9876543210'
        },
        theme: { color: '#7B61FF' }
      };

      RazorpayCheckout.open(options)
        .then((data) => {
          resolve({ success: true, data });
        })
        .catch((error) => {
          if (error.code === 'PAYMENT_ERROR') {
            resolve({ success: false, message: 'Payment failed' });
          } else {
            resolve({ success: false, message: 'Something went wrong' });
          }
        });
    });
  }

  async simulatePayment(plan) {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.2; // 80% success rate
        if (success) {
          resolve({
            success: true,
            message: 'Payment successful! Premium activated.',
            data: {
              transactionId: 'TXN_' + Date.now(),
              plan: plan
            }
          });
        } else {
          resolve({
            success: false,
            message: 'Payment failed. Please try again.'
          });
        }
      }, 1500);
    });
  }
}

export { PaymentService };

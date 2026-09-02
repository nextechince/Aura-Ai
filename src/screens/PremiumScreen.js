// src/screens/PremiumScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useStore } from '../store';
import { PaymentService } from '../services/PaymentService';

const { width } = Dimensions.get('window');

const PremiumScreen = ({ navigation }) => {
  const { isPremium, setIsPremium } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const paymentService = new PaymentService();

  const premiumFeatures = [
    { icon: '💻', name: 'Multi-Language Code Generation' },
    { icon: '📱', name: 'WhatsApp Automation' },
    { icon: '📨', name: 'Telegram Bot Builder' },
    { icon: '🎤', name: 'Custom Wake Word' },
    { icon: '🏠', name: 'Smart Home Control' },
    { icon: '📂', name: 'MT Manager Control' },
    { icon: '🎥', name: 'Screen Recorder' },
    { icon: '🎨', name: 'AI Image Generator' },
    { icon: '📧', name: 'Email Automation' },
    { icon: '🌍', name: 'Real-time Translation' },
    { icon: '🔒', name: 'Voice Lock' },
    { icon: '⚡', name: 'Advanced Automation' },
  ];

  const handlePurchase = async (plan) => {
    setIsLoading(true);
    try {
      const result = await paymentService.processPayment(plan);
      if (result.success) {
        setIsPremium(true);
        Alert.alert(
          '🎉 Premium Activated!',
          'You now have access to all 90+ premium features!'
        );
        navigation.goBack();
      } else {
        Alert.alert('❌ Payment Failed', result.message || 'Please try again.');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isPremium) {
    return (
      <LinearGradient colors={['#0A0A0F', '#141420']} style={styles.container}>
        <View style={styles.premiumActive}>
          <Text style={styles.premiumIcon}>✨</Text>
          <Text style={styles.premiumTitle}>Premium Active!</Text>
          <Text style={styles.premiumSubtext}>
            Enjoy all 90+ premium features
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0A0A0F', '#141420']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>💎</Text>
          <Text style={styles.headerTitle}>Unlock Premium</Text>
          <Text style={styles.headerSubtitle}>
            Get access to all 90+ features
          </Text>
        </View>

        {/* Pricing Cards */}
        <View style={styles.pricingContainer}>
          <TouchableOpacity
            style={[styles.pricingCard, styles.pricingCardFeatured]}
            onPress={() => handlePurchase('monthly')}
            disabled={isLoading}
          >
            <View style={styles.pricingBadge}>🔥 Most Popular</View>
            <Text style={styles.pricingPlan}>Monthly</Text>
            <Text style={styles.pricingPrice}>
              $2.99
              <Text style={styles.pricingPeriod}>/month</Text>
            </Text>
            <View style={styles.pricingDivider} />
            <Text style={styles.pricingFeature}>✅ All Premium Features</Text>
            <Text style={styles.pricingFeature}>✅ Cancel Anytime</Text>
            <Text style={styles.pricingFeature}>✅ Priority Support</Text>
            <View style={styles.pricingBtn}>
              <Text style={styles.pricingBtnText}>
                {isLoading ? 'Processing...' : 'Upgrade Now'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.pricingCard}
            onPress={() => handlePurchase('lifetime')}
            disabled={isLoading}
          >
            <Text style={styles.pricingPlan}>Lifetime</Text>
            <Text style={styles.pricingPrice}>
              $15
              <Text style={styles.pricingPeriod}>/one-time</Text>
            </Text>
            <View style={styles.pricingDivider} />
            <Text style={styles.pricingFeature}>✅ All Premium Features</Text>
            <Text style={styles.pricingFeature}>✅ Lifetime Updates</Text>
            <Text style={styles.pricingFeature}>✅ VIP Support</Text>
            <View style={[styles.pricingBtn, styles.pricingBtnLifetime]}>
              <Text style={[styles.pricingBtnText, styles.pricingBtnTextLifetime]}>
                {isLoading ? 'Processing...' : 'Buy Lifetime'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Features List */}
        <Text style={styles.sectionTitle}>✨ All Premium Features</Text>
        <View style={styles.featuresList}>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureName}>{feature.name}</Text>
              <Text style={styles.featureBadge}>🔒</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30
  },
  headerIcon: {
    fontSize: 50,
    marginBottom: 10
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  headerSubtitle: {
    color: '#9A9AB0',
    fontSize: 16
  },
  pricingContainer: {
    paddingHorizontal: 20,
    gap: 16
  },
  pricingCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center'
  },
  pricingCardFeatured: {
    borderColor: '#7B61FF',
    backgroundColor: 'rgba(123,97,255,0.06)'
  },
  pricingBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#7B61FF',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  pricingPlan: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4
  },
  pricingPrice: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800'
  },
  pricingPeriod: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9A9AB0'
  },
  pricingDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12
  },
  pricingFeature: {
    color: '#9A9AB0',
    fontSize: 14,
    paddingVertical: 4
  },
  pricingBtn: {
    marginTop: 16,
    backgroundColor: '#7B61FF',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center'
  },
  pricingBtnLifetime: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: '#7B61FF'
  },
  pricingBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  },
  pricingBtnTextLifetime: {
    color: '#7B61FF'
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 12
  },
  featuresList: {
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)'
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12
  },
  featureName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15
  },
  featureBadge: {
    fontSize: 14,
    color: '#6A6A80'
  },
  premiumActive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  premiumIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  premiumTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8
  },
  premiumSubtext: {
    color: '#9A9AB0',
    fontSize: 16,
    marginBottom: 30
  },
  backBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 50
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default PremiumScreen;

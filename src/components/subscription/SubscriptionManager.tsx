import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  Crown, 
  User, 
  CheckCircle, 
  XCircle, 
  Calendar,
  CreditCard,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';
import axios from 'axios';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  current?: boolean;
}

interface SubscriptionStatus {
  is_active: boolean;
  plan_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
}

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      interval: 'monthly',
      features: [
        'Access to basic content',
        'Standard support',
        'Limited features'
      ],
      current: user?.user_type === 'user'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      interval: 'monthly',
      features: [
        'All basic features',
        'Premium content access',
        'Priority support',
        'Advanced analytics',
        'No ads'
      ],
      popular: true,
      current: user?.user_type === 'subscribed'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19.99,
      interval: 'monthly',
      features: [
        'All premium features',
        'API access',
        'White-label options',
        'Dedicated support',
        'Custom integrations'
      ],
      current: user?.user_type === 'admin'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchSubscriptionStatus();
    }
  }, [user]);

  const fetchSubscriptionStatus = async () => {
    try {
      // In a real app, this would fetch from your subscription service
      // For now, we'll simulate based on user type
      const status: SubscriptionStatus = {
        is_active: user?.user_type === 'subscribed' || user?.user_type === 'admin',
        plan_id: user?.user_type === 'subscribed' ? 'premium' : user?.user_type === 'admin' ? 'pro' : 'basic',
        status: user?.user_type === 'subscribed' || user?.user_type === 'admin' ? 'active' : 'canceled',
        current_period_start: user?.created_at,
        current_period_end: user?.created_at, // This would be calculated based on subscription
        cancel_at_period_end: false
      };
      
      setSubscriptionStatus(status);
    } catch (err: any) {
      setError('Failed to fetch subscription status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan) return;
    
    try {
      // In a real app, this would integrate with your payment processor
      // For now, we'll simulate the upgrade
      await axios.post('/api/admin/users/upgrade', { 
        user_type: selectedPlan.id === 'premium' ? 'subscribed' : 'admin' 
      });
      
      // Refresh user data
      window.location.reload();
    } catch (err: any) {
      setError('Failed to upgrade subscription');
    } finally {
      setShowUpgradeModal(false);
      setSelectedPlan(null);
    }
  };

  const cancelSubscription = async () => {
    try {
      // In a real app, this would cancel the subscription
      await axios.post('/api/admin/users/upgrade', { user_type: 'user' });
      window.location.reload();
    } catch (err: any) {
      setError('Failed to cancel subscription');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your subscription</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600 mt-2">Manage your subscription and billing preferences</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Current Status */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Current Subscription</h2>
          </div>
          <div className="px-6 py-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading subscription details...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    {subscriptionStatus?.is_active ? (
                      <Shield className="h-8 w-8 text-blue-600" />
                    ) : (
                      <User className="h-8 w-8 text-gray-600" />
                    )}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {subscriptionStatus?.is_active ? 'Active Subscription' : 'Free Plan'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {subscriptionStatus?.is_active 
                      ? `You're currently on the ${subscriptionStatus.plan_id} plan`
                      : 'You\'re currently on the free plan'
                    }
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <Calendar className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Cycle</h3>
                  <p className="text-sm text-gray-600">
                    {subscriptionStatus?.is_active ? 'Monthly billing' : 'No billing required'}
                  </p>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <CreditCard className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Method</h3>
                  <p className="text-sm text-gray-600">
                    {subscriptionStatus?.is_active ? 'Card ending in ****' : 'No payment method'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Available Plans */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Available Plans</h2>
          </div>
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border-2 p-6 ${
                    plan.current
                      ? 'border-blue-500 bg-blue-50'
                      : plan.popular
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {plan.current && (
                    <div className="absolute -top-3 right-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Current Plan
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600">/{plan.interval}</span>
                    </div>

                    <ul className="space-y-3 mb-6 text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.current ? (
                      <button
                        disabled
                        className="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
                      >
                        Current Plan
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpgrade(plan)}
                        className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                          plan.popular
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Billing History */}
        {subscriptionStatus?.is_active && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Billing History</h2>
            </div>
            <div className="px-6 py-6">
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Billing history will be displayed here</p>
                <p className="text-sm text-gray-500 mt-2">In a real application, this would show your payment history</p>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {showUpgradeModal && selectedPlan && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Upgrade to {selectedPlan.name}</h3>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    You're about to upgrade to the {selectedPlan.name} plan for ${selectedPlan.price}/{selectedPlan.interval}.
                  </p>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUpgrade}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Confirm Upgrade
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;

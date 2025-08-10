import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/auth/ProtectedRoute';

const SubscriptionPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const plans = {
    monthly: {
      name: 'Monthly Premium',
      price: 9.99,
      period: 'month',
      features: [
        'Unlimited USSD transactions',
        'Priority customer support',
        'Advanced analytics dashboard',
        'Custom payment schedules',
        'SMS notifications',
        'API access'
      ]
    },
    yearly: {
      name: 'Yearly Premium',
      price: 99.99,
      period: 'year',
      features: [
        'Everything in Monthly Premium',
        '2 months free (save $19.98)',
        'Early access to new features',
        'Dedicated account manager',
        'Priority feature requests'
      ]
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setMessage(null);

    try {
      // In a real app, this would integrate with a payment processor
      // For now, we'll simulate the upgrade
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update user type to subscribed
      await updateProfile({ user_type: 'subscribed' });
      
      setMessage({ 
        type: 'success', 
        text: 'Congratulations! Your account has been upgraded to Premium!' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to upgrade account' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Don't show upgrade page for already subscribed users
  if (user.user_type === 'subscribed' || user.user_type === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Already Premium!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              You already have a premium subscription. Enjoy all the benefits!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Upgrade to Premium
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              Unlock unlimited USSD transactions and premium features
            </p>
          </div>

          {message && (
            <div className={`mt-8 max-w-md mx-auto p-4 rounded-md ${
              message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Plan Selection */}
          <div className="mt-12 flex justify-center">
            <div className="bg-white rounded-lg shadow-lg p-1">
              <div className="flex">
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedPlan === 'monthly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPlan('yearly')}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedPlan === 'yearly'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>

          {/* Plan Details */}
          <div className="mt-8 max-w-lg mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {plans[selectedPlan].name}
                  </h3>
                  <div className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${plans[selectedPlan].price}
                    </span>
                    <span className="text-gray-500">/{plans[selectedPlan].period}</span>
                  </div>
                  {selectedPlan === 'yearly' && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                      Save $19.98 compared to monthly
                    </p>
                  )}
                </div>

                <div className="mt-8">
                  <ul className="space-y-4">
                    {plans[selectedPlan].features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Processing...' : `Upgrade to ${plans[selectedPlan].name}`}
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    By upgrading, you agree to our{' '}
                    <a href="/terms" className="text-blue-600 hover:text-blue-500">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan Info */}
          <div className="mt-12 max-w-md mx-auto text-center">
            <div className="bg-gray-100 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900">Current Plan</h4>
              <p className="mt-1 text-sm text-gray-600">
                {user.user_type === 'guest' ? 'Guest User' : 'Free User'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Limited USSD transactions and basic features
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SubscriptionPage;

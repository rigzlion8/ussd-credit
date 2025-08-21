import { useState } from 'react';
import axios from 'axios';
import './SubscribeForm.css'; // Create this file for component-specific styles

interface SubscribeFormProps {
  influencerId: number;
  influencerName: string;
  influencerPhone: string;
  influencerReceived: number;
  influencerImageUrl?: string;
}

export const SubscribeForm = ({ 
  influencerId, 
  influencerName,
  influencerPhone,
  influencerReceived,
  influencerImageUrl
}: SubscribeFormProps) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [amount, setAmount] = useState(10);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'none'>('none');
  const [step, setStep] = useState<'phone' | 'pin' | 'confirmation'>('phone');

  const verifyPin = async () => {
    try {
      const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001';
      const response = await axios.get(`${base}/api/users?phone=${phone}&pin=${pin}`);
      return response.data.length > 0;
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  };

  const handleSubscribe = async () => {
    try {
      const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8001';
      await axios.post(`${base}/api/subscribers`, {
        fan_phone: phone,
        influencer_id: influencerId,
        amount,
        frequency,
        is_active: true
      });
      setStep('confirmation');
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'phone') {
      setStep('pin');
    } else if (step === 'pin') {
      const isValid = await verifyPin();
      if (isValid) {
        await handleSubscribe();
      } else {
        alert('Invalid PIN!');
        setPin('');
      }
    }
  };

  // Determine which image to use: influencerImageUrl or placeholder
  const profileImageSrc = influencerImageUrl && influencerImageUrl.trim() !== ''
    ? influencerImageUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(influencerName)}&background=cccccc&size=64&rounded=true&color=555`;

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm hover:shadow-lg hover:border-primary-500 transition-all duration-300 hover:-translate-y-1 p-6 max-w-sm mx-auto mb-6">
      {/* Unified influencer profile and form */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <img
            src={profileImageSrc}
            alt={influencerName}
            className="w-16 h-16 rounded-full border-2 border-gray-200 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencerName)}&background=cccccc&size=64&rounded=true&color=555`;
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{influencerName}</h3>
            <p className="text-sm text-gray-600">Phone: {influencerPhone}</p>
            <p className="text-sm text-gray-600">Total Received: KSh {influencerReceived}</p>
          </div>
        </div>

        {/* Form fields directly below profile */}
        <div className="space-y-4">
          {step === 'phone' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Phone (254...)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="254[0-9]{9}"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="254700000000"
                />
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Continue
              </button>
            </form>
          )}

          {step === 'pin' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">USSD Shortcode</label>
                <input
                  type="tel"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="1234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KSh)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="10"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  placeholder="10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="none">None</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                Confirm
              </button>
            </form>
          )}

          {step === 'confirmation' && (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-lg font-medium text-green-600 mb-2">Wait for M-PESA PIN!</p>
              <p className="text-gray-600">{amount} KSh {frequency}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
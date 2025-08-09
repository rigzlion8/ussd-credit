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
    <div className="subscribe-card">
      {/* Unified influencer profile and form */}
      <div className="profile-and-form">
        <div className="profile-header-horizontal">
          <img
            src={profileImageSrc}
            alt={influencerName}
            className="profile-image-round"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencerName)}&background=cccccc&size=64&rounded=true&color=555`;
            }}
          />
          <div className="profile-details-horizontal">
            <h3 className="influencer-name">{influencerName}</h3>
            <p className="influencer-phone">Phone: {influencerPhone}</p>
            <p className="influencer-received">Total Received: KSh {influencerReceived}</p>
          </div>
        </div>

        {/* Form fields directly below profile */}
        <div className="form-section">
          {step === 'phone' && (
            <form onSubmit={handleSubmit} className="subscription-form">
              <div className="form-group">
                <label>Your Phone (254...)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  pattern="254[0-9]{9}"
                  required
                />
              </div>
              <button type="submit">Continue</button>
            </form>
          )}

          {step === 'pin' && (
            <form onSubmit={handleSubmit} className="subscription-form">
              <div className="form-group">
                <label>USSD Shortcode</label>
                <input
                  type="tel"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={4}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount (KSh)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min="10"
                  required
                />
              </div>
              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'none')}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="none">None</option>
                </select>
              </div>
              <button type="submit">Confirm</button>
            </form>
          )}

          {step === 'confirmation' && (
            <div className="confirmation">
              <p>✅ Wait for M-PESA PIN!</p>
              <p>{amount} KSh {frequency}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
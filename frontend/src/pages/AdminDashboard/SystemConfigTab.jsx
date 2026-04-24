import React, { useState, useEffect, useRef } from 'react';
import { Phone, QrCode, ImageIcon, Database, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../../services/api';
import { formatKenyanNumber } from '../../lib/utils';

const SystemConfigTab = () => {
  const [config, setConfig] = useState({
    whatsappToken: '',
    whatsappPhoneNumberId: '',
    adminWhatsApp: '',
    mongoURI: '',
    mpesaConsumerKey: '',
    mpesaConsumerSecret: '',
    mpesaShortcode: '',
    mpesaPasskey: '',
    mpesaCallbackURL: '',
    cloudinaryCloudName: '',
    cloudinaryApiKey: '',
    cloudinaryApiSecret: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingMpesa, setTestingMpesa] = useState(false);
  const [testPhone, setTestPhone] = useState('');

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/api/admin/config');
      setConfig(data || {
        whatsappToken: '',
        whatsappPhoneNumberId: '',
        adminWhatsApp: '',
        mongoURI: '',
        mpesaConsumerKey: '',
        mpesaConsumerSecret: '',
        mpesaShortcode: '',
        mpesaPasskey: '',
        mpesaCallbackURL: '',
        cloudinaryCloudName: '',
        cloudinaryApiKey: '',
        cloudinaryApiSecret: '',
      });
    } catch (err) {
      toast.error("Failed to fetch system configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiRequest('/api/admin/config', {
        method: 'POST',
        body: JSON.stringify(config)
      });
      toast.success("Configuration saved successfully");
      fetchConfig();
    } catch (err) {
      toast.error("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleTestMpesa = async () => {
    if (!testPhone || testPhone.length < 9) {
      toast.error("Enter a valid phone number to test");
      return;
    }
    setTestingMpesa(true);
    try {
      const data = await apiRequest('/api/payments/stkpush', {
        method: 'POST',
        body: JSON.stringify({
          phone: testPhone,
          amount: 1,
          bookingId: "test-" + Math.random().toString(36).substring(7),
          // Use current form values for test
          shortCode: config.mpesaShortcode,
          passkey: config.mpesaPasskey,
          consumerKey: config.mpesaConsumerKey,
          consumerSecret: config.mpesaConsumerSecret,
          callbackUrl: config.mpesaCallbackURL
        })
      });
      if (data.success || data.ResponseCode === '0') {
        toast.success("STK Push triggered! Check your phone.");
      } else {
        toast.error(data.message || "STK Push failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "M-Pesa request failed");
    } finally {
      setTestingMpesa(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-brand-accent" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-gray-900">System Configuration</h2>
        <p className="text-gray-600">Manage API keys, M-Pesa credentials, and database settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* WhatsApp Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Phone size={24} />
            </div>
            <h3 className="text-xl font-bold">WhatsApp Cloud API</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Access Token</label>
              <input 
                type="password"
                value={config.whatsappToken}
                onChange={(e) => setConfig({...config, whatsappToken: e.target.value})}
                className="input-field"
                placeholder="EAAB..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number ID</label>
              <input 
                type="text"
                value={config.whatsappPhoneNumberId}
                onChange={(e) => setConfig({...config, whatsappPhoneNumberId: e.target.value})}
                className="input-field"
                placeholder="1234567890..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Admin WhatsApp Number</label>
              <div className="flex items-center gap-0 border border-gray-200 rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
                <span className="pl-4 pr-2 py-3 text-gray-500 font-bold border-r border-gray-100 bg-gray-50/50">
                  +254
                </span>
                <input 
                  type="tel"
                  value={formatKenyanNumber(config.adminWhatsApp)}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.startsWith('0')) val = val.slice(1);
                    if (val.startsWith('254')) val = val.slice(3);
                    if (val.length <= 9) setConfig({...config, adminWhatsApp: val});
                  }}
                  placeholder="712 345 678"
                  className="flex-1 px-4 py-3 outline-none text-gray-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* M-Pesa Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-50 rounded-2xl text-green-600">
              <QrCode size={24} />
            </div>
            <h3 className="text-xl font-bold">M-Pesa Daraja 3.0</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Consumer Key</label>
              <input 
                type="password"
                value={config.mpesaConsumerKey}
                onChange={(e) => setConfig({...config, mpesaConsumerKey: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Consumer Secret</label>
              <input 
                type="password"
                value={config.mpesaConsumerSecret}
                onChange={(e) => setConfig({...config, mpesaConsumerSecret: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Shortcode</label>
              <input 
                type="text"
                value={config.mpesaShortcode}
                onChange={(e) => setConfig({...config, mpesaShortcode: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Passkey</label>
              <input 
                type="password"
                value={config.mpesaPasskey}
                onChange={(e) => setConfig({...config, mpesaPasskey: e.target.value})}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Callback URL</label>
              <input 
                type="text"
                value={config.mpesaCallbackURL}
                onChange={(e) => setConfig({...config, mpesaCallbackURL: e.target.value})}
                placeholder="https://your-domain.com/api/payments/callback"
                className="input-field"
              />
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4">Test M-Pesa STK Push</h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex items-center gap-0 border border-gray-200 rounded-2xl bg-white focus-within:border-brand-accent transition-all overflow-hidden">
                <span className="pl-4 pr-2 py-3 text-gray-500 font-bold border-r border-gray-100 bg-gray-50/50">
                  +254
                </span>
                <input 
                  type="tel"
                  value={formatKenyanNumber(testPhone)}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val.startsWith('0')) val = val.slice(1);
                    if (val.startsWith('254')) val = val.slice(3);
                    if (val.length <= 9) setTestPhone(val);
                  }}
                  placeholder="712 345 678"
                  className="flex-1 px-4 py-3 outline-none text-gray-900 font-medium"
                />
              </div>
              <button 
                type="button"
                onClick={handleTestMpesa}
                disabled={testingMpesa}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {testingMpesa ? <Loader2 className="animate-spin" size={20} /> : <QrCode size={20} />}
                Test STK Push
              </button>
            </div>
          </div>
        </div>

        {/* Cloudinary Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-xl font-bold">Cloudinary Storage</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-2">Cloud Name</label>
              <input 
                type="text"
                value={config.cloudinaryCloudName}
                onChange={(e) => setConfig({...config, cloudinaryCloudName: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">API Key</label>
              <input 
                type="password"
                value={config.cloudinaryApiKey}
                onChange={(e) => setConfig({...config, cloudinaryApiKey: e.target.value})}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">API Secret</label>
              <input 
                type="password"
                value={config.cloudinaryApiSecret}
                onChange={(e) => setConfig({...config, cloudinaryApiSecret: e.target.value})}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Database Section */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold">Database</h3>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">MongoDB URI</label>
            <input 
              type="password"
              value={config.mongoURI}
              onChange={(e) => setConfig({...config, mongoURI: e.target.value})}
              className="input-field"
              placeholder="mongodb+srv://..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            disabled={saving}
            className="btn-primary flex items-center gap-2 px-12 py-4 text-lg"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemConfigTab;

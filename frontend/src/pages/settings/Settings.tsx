import { useState, useEffect, useContext } from 'react';
import { settingService } from '../../services/settingService';
import { authService } from '../../services/authService';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { setCurrency, setExchangeRate } from '../../utils/format';
import { languages } from '../../translations';
import toast from 'react-hot-toast';

const currencies = [
  { value: 'PKR', label: 'PKR - Pakistani Rupee' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'BDT', label: 'BDT - Bangladeshi Taka' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
];

export function Settings() {
  const { user } = useContext(AuthContext);
  const { lang, setLang, t } = useLanguage();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Admin profile state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingService.get().then((res) => {
      const data = res.data.data || {};
      setSettings(data);
      setFullName(user?.full_name || '');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const handleSaveSetting = async (key: string, value: string) => {
    try {
      await settingService.update(key, value);
      setSettings((prev) => ({ ...prev, [key]: value }));
      if (key === 'currency') setCurrency(value);
      if (key === 'exchange_rate') setExchangeRate(parseFloat(value) || 1);
      toast.success(`${key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} ${t.common.updated}`);
    } catch {
      toast.error(t.common.failed);
    }
  };

  const handleCurrencyChange = (code: string) => {
    handleSaveSetting('currency', code);
  };

  const handleLanguageChange = (code: string) => {
    setLang(code);
    toast.success(`${t.settings.language} ${t.common.updated}`);
  };

  const handleProfileUpdate = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!fullName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const payload: any = { full_name: fullName.trim() };
      if (currentPassword && newPassword) {
        payload.current_password = currentPassword;
        payload.new_password = newPassword;
      }
      await authService.updateProfile(payload);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.full_name = fullName.trim();
      localStorage.setItem('user', JSON.stringify(storedUser));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t.settings.nameUpdated);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || t.common.failed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-center text-gray-400">{t.common.loading}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings.title}</h1>

      {/* Currency, Exchange Rate, Tax Rate */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Select
              label={t.settings.currency}
              value={settings['currency'] || 'PKR'}
              options={currencies}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            />
          </div>
          <div>
            <Input
              label={t.settings.exchangeRate}
              type="number"
              step="0.000001"
              value={settings['exchange_rate'] || '1'}
              onChange={(e) => {
                setSettings((prev) => ({ ...prev, exchange_rate: e.target.value }));
              }}
            />
            <Button size="sm" className="mt-1" onClick={() => handleSaveSetting('exchange_rate', settings['exchange_rate'] || '1')}>
              {t.common.save}
            </Button>
          </div>
          <div>
            <Input
              label={t.settings.taxRate}
              type="number"
              step="0.01"
              value={settings['tax_percentage'] || '0'}
              onChange={(e) => {
                setSettings((prev) => ({ ...prev, tax_percentage: e.target.value }));
              }}
            />
            <Button size="sm" className="mt-1" onClick={() => handleSaveSetting('tax_percentage', settings['tax_percentage'] || '0')}>
              {t.common.save}
            </Button>
          </div>
        </div>
      </Card>

      {/* Language */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.settings.language}</h2>
        <div className="max-w-xs">
          <Select
            label={t.settings.language}
            value={lang}
            options={languages}
            onChange={(e) => handleLanguageChange(e.target.value)}
          />
        </div>
      </Card>

      {/* Admin Profile */}
      {user && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.settings.adminProfile}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t.settings.fullName}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <div />
            <Input
              label={t.settings.currentPassword}
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label={t.settings.newPassword}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label={t.settings.confirmPassword}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button className="mt-4" onClick={handleProfileUpdate} disabled={saving}>
            {saving ? t.common.saving : t.settings.updateProfile}
          </Button>
        </Card>
      )}
    </div>
  );
}

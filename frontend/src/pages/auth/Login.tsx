import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';

export function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ username, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || t.login.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        {/* Full background image */}
        <img
          src="/login-left-panel.png"
          alt="Login background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-8 -left-8 w-[450px] h-[120px] rounded-full bg-white/[0.06] rotate-[25deg]" />
          <div className="absolute top-[18%] right-[-10%] w-[350px] h-[100px] rounded-full bg-white/[0.06] -rotate-[15deg]" />
          <div className="absolute bottom-[15%] left-[-8%] w-[420px] h-[110px] rounded-full bg-white/[0.06] rotate-[35deg]" />
          <div className="absolute top-[45%] left-[30%] w-[280px] h-[80px] rounded-full bg-white/[0.06] rotate-[10deg]" />
          <div className="absolute bottom-[5%] right-[-5%] w-[360px] h-[100px] rounded-full bg-white/[0.06] -rotate-[20deg]" />
          <div className="absolute top-[5%] right-[25%] w-[220px] h-[65px] rounded-full bg-white/[0.06] -rotate-[5deg]" />
        </div>

        <div className="relative z-10 text-center px-10">
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{t.login.medCare}</h2>
          <p className="text-white/60 text-base max-w-sm mx-auto leading-relaxed">
            {t.login.tagline}
          </p>

          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-white/50 text-xs mt-1 uppercase tracking-wider">{t.login.medicines}</div>
            </div>
            <div className="w-px h-9 bg-white/15" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500+</div>
              <div className="text-white/50 text-xs mt-1 uppercase tracking-wider">{t.login.customers}</div>
            </div>
            <div className="w-px h-9 bg-white/15" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99%</div>
              <div className="text-white/50 text-xs mt-1 uppercase tracking-wider">{t.login.uptime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[#f5f7fa]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1a5c7a] flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
              </svg>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_-6px_rgba(0,0,0,0.08)] p-8">
            {/* Badge */}
            <div className="w-10 h-10 mx-auto mb-5 rounded-xl bg-gradient-to-br from-[#0f2b4a] to-[#1a5c7a] flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-3-3v6" />
              </svg>
            </div>

            <div className="text-center mb-7">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{t.login.welcomeBack}</h1>
              <p className="text-gray-400 mt-1.5 text-sm">{t.login.enterCredentials}</p>
            </div>

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl mb-5 text-sm">
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.login.username}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-[10px] bg-[#f8fafc] border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f2b4a]/15 focus:border-[#0f2b4a] transition-all"
                    placeholder={t.login.username}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.login.password}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-[10px] bg-[#f8fafc] border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0f2b4a]/15 focus:border-[#0f2b4a] transition-all"
                    placeholder={t.login.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Checkbox id="remember" label={t.login.rememberMe} checked={remember} onChange={setRemember} />
                <Link to="/forgot-password" className="text-xs font-medium text-[#0f2b4a] hover:text-[#1a5c7a] transition-colors">
                  {t.login.forgotPassword}
                </Link>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="w-full !py-[10px] !rounded-xl text-sm font-semibold bg-gradient-to-r from-[#0f2b4a] to-[#1a5c7a] hover:from-[#0a1628] hover:to-[#0f2b4a] text-white shadow-lg shadow-blue-900/20 hover:shadow-xl transition-all duration-300"
              >
                {t.login.signIn}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              {t.login.noAccount}{' '}
              <Link to="/register" className="font-medium text-[#0f2b4a] hover:text-[#1a5c7a] transition-colors">
                {t.login.signUp}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

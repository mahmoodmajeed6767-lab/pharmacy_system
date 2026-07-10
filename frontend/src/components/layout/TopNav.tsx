import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../context/LanguageContext';
import { ThemeContext } from '../../context/ThemeContext';
import { searchService } from '../../services/searchService';
import { notificationService } from '../../services/notificationService';
import { useDebounce } from '../../hooks/useDebounce';

export function TopNav() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedSearch.length >= 2) {
      searchService.search(debouncedSearch).then((res) => {
        setSearchResults(res.data.data);
        setShowSearch(true);
      });
    } else {
      setSearchResults(null);
      setShowSearch(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    notificationService.unreadCount().then((res) => setNotifCount(res.data.data?.count || 0));
  }, []);

  useEffect(() => {
    const handler = () => {
      notificationService.unreadCount().then((res) => setNotifCount(res.data.data?.count || 0));
    };
    window.addEventListener('notif-read', handler);
    return () => window.removeEventListener('notif-read', handler);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.common.search}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c7a]/20 focus:border-[#1a5c7a] transition-all"
          />
          {showSearch && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.medicines?.length > 0 && (
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 px-2 py-1.5 uppercase tracking-wider">{t.nav.medicines}</p>
                  {searchResults.medicines.map((m: any) => (
                    <button key={m.id} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" onClick={() => { navigate(`/medicines/${m.id}`); setShowSearch(false); setSearch(''); }}>
                      {m.name} <span className="text-gray-400">({m.barcode})</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.customers?.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 px-2 py-1.5 uppercase tracking-wider">{t.dashboard.customers}</p>
                  {searchResults.customers.map((c: any) => (
                    <button key={c.id} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" onClick={() => { navigate(`/customers/${c.id}`); setShowSearch(false); setSearch(''); }}>
                      {c.name} <span className="text-gray-400">({c.phone})</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.suppliers?.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 px-2 py-1.5 uppercase tracking-wider">{t.nav.suppliers}</p>
                  {searchResults.suppliers.map((s: any) => (
                    <button key={s.id} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" onClick={() => { navigate(`/suppliers/${s.id}`); setShowSearch(false); setSearch(''); }}>
                      {s.company_name} <span className="text-gray-400">({s.phone})</span>
                    </button>
                  ))}
                </div>
              )}
              {!searchResults.medicines?.length && !searchResults.customers?.length && !searchResults.suppliers?.length && (
                <p className="p-4 text-sm text-gray-500 text-center">{t.common.noResults}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title={darkMode ? t.common.lightMode : t.common.darkMode}>
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>

          <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => navigate('/notifications')}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            {notifCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-sm">
                {notifCount > 9 ? '9+' : notifCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2.5 p-1.5 pr-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a5c7a] to-[#2d8bae] flex items-center justify-center text-white text-sm font-medium shadow-sm">
                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">{user?.full_name || 'User'}</span>
              <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{user?.role?.name || 'N/A'}</p>
                </div>
                <button onClick={() => { setShowUserMenu(false); navigate('/settings'); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                  {t.common.profile}
                </button>
                <div className="border-t border-gray-100 dark:border-gray-700" />
                <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                  </svg>
                  {t.common.logout}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import { ActiveScreen } from '../types';
import { useAuth } from '../contexts/AuthContext.tsx';

interface HeaderProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  cartCount: number;
  openCartDrawer: () => void;
  openAddressModal: () => void;
  currentAddress: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenSearchModal?: () => void;
  onOpenVoiceSearch?: () => void;
  onOpenSpinWheel?: () => void;
  onOpenReviews?: () => void;
  onOpenCustomer360?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenAIChat?: () => void;
  onOpenAIVoice?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  setActiveScreen,
  cartCount,
  openCartDrawer,
  openAddressModal,
  currentAddress,
  searchQuery,
  setSearchQuery,
  onOpenSearchModal,
  onOpenVoiceSearch,
  onOpenSpinWheel,
  onOpenReviews,
  onOpenCustomer360,
  onOpenCommandPalette,
  onOpenAIChat,
  onOpenAIVoice,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, userProfile, currentRole, activeAccount, switchRole, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="h-20 max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark & Location */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveScreen('landing')}
            className="flex items-center gap-2 text-emerald-800 hover:text-emerald-900 transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[28px] text-emerald-700">eco</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">FarmDirect</span>
          </button>

          <button
            onClick={openAddressModal}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-700">location_on</span>
            <span className="truncate max-w-[160px]">{currentAddress}</span>
            <span className="material-symbols-outlined text-[14px] text-slate-400">expand_more</span>
          </button>
        </div>

        {/* Global Search with Voice Trigger */}
        <div className="hidden md:flex flex-1 max-w-sm">
          <div
            onClick={onOpenSearchModal}
            className="relative w-full flex items-center cursor-pointer group"
          >
            <span className="material-symbols-outlined absolute left-3 text-slate-400 group-hover:text-emerald-700 pointer-events-none text-[18px]">
              search
            </span>
            <input
              type="text"
              readOnly
              value={searchQuery}
              onClick={onOpenSearchModal}
              placeholder="Search produce, farms, or speak..."
              className="w-full bg-slate-100 group-hover:bg-slate-50 text-slate-900 text-xs pl-9 pr-14 py-2 rounded-xl border border-transparent group-hover:border-slate-300 focus:outline-none transition-colors cursor-pointer"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenVoiceSearch) {
                  onOpenVoiceSearch();
                } else if (onOpenSearchModal) {
                  onOpenSearchModal();
                }
              }}
              className="absolute right-2 px-2 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 hover:text-emerald-800 flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-2xs transition"
              title="Voice Search (Web Speech & Microphone)"
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-700">mic</span>
              <span>Voice</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {[
            { id: 'landing', label: 'Home' },
            { id: 'marketplace', label: 'Marketplace' },
            { id: 'traceability', label: 'Traceability' },
            { id: 'wholesale', label: 'Wholesale B2B' },
            { id: 'community', label: 'Community' },
            { id: 'orders', label: 'My Orders' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id as ActiveScreen)}
              className={`transition-colors cursor-pointer relative py-1 text-xs font-semibold ${
                activeScreen === item.id
                  ? 'text-emerald-800 font-bold after:content-[""] after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-emerald-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions (Spin Wheel, Cart, Profile) */}
        <div className="flex items-center gap-2.5">
          {/* AI Copilot & Voice Buttons */}
          <button
            type="button"
            onClick={onOpenAIChat}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 border border-emerald-200/80 text-xs font-bold transition-all shadow-2xs cursor-pointer group"
            title="Ask FarmDirect AI (Search Grounding & High Thinking)"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-500 group-hover:rotate-12 transition-transform">
              auto_awesome
            </span>
            <span>AI Copilot</span>
          </button>

          <button
            type="button"
            onClick={onOpenAIVoice}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-800 border border-slate-200/90 text-xs font-bold transition-all shadow-xs cursor-pointer group"
            title="Real-Time Voice Assistant (gemini-3.8-live)"
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600 group-hover:scale-110 transition-transform">mic</span>
            <span className="hidden xl:inline text-slate-800 font-semibold">Live Voice</span>
          </button>

          {/* Spin Wheel Trigger */}
          <button
            type="button"
            onClick={onOpenSpinWheel}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
            title="Spin to Win Lucky Wheel"
          >
            <span>🎰</span>
            <span className="hidden xl:inline">Spin &amp; Win</span>
          </button>
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              aria-label="Harvest Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer relative"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Harvest &amp; Dispatch Alerts</span>
                  <span className="text-emerald-700 font-semibold">2 New</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="font-bold text-slate-900">Reefer Truck #4 Departed</p>
                  <p className="text-slate-500 mt-0.5">Nashik harvest locked at 3.8°C en route to Bandra.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <p className="font-bold text-slate-900">Ramesh Patel Morning Pick</p>
                  <p className="text-slate-500 mt-0.5">San Marzano tomatoes boxed in aerated crates.</p>
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <button
            type="button"
            aria-label="Shopping Cart"
            onClick={openCartDrawer}
            className="h-10 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
            <span className="font-bold text-xs">{cartCount}</span>
          </button>

          {/* Profile / Portals Menu */}
          <div className="relative">
            <button
              type="button"
              aria-label="User Profile and Portals"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="cursor-pointer flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <img
                src={activeAccount.avatar}
                alt={activeAccount.name}
                className="w-9 h-9 rounded-full object-cover border border-emerald-600/40 shadow-xs"
              />
              {currentRole !== 'customer' && (
                <span className="hidden xl:inline text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-900 text-white font-mono">
                  {currentRole}
                </span>
              )}
              <span className="material-symbols-outlined text-[16px] text-slate-400 hidden sm:inline">expand_more</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-fadeIn">
                <div className="p-2 border-b border-slate-100 mb-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 truncate">
                      {activeAccount.name}
                    </p>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold font-mono">
                      {activeAccount.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{activeAccount.email}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{activeAccount.title}</p>
                  {typeof activeAccount.escrowBalance === 'number' && (
                    <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-emerald-800 bg-emerald-50/80 px-2 py-1 rounded">
                      <span>Escrow Pool:</span>
                      <span className="font-bold">₹{activeAccount.escrowBalance.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Hackathon Quick Role Switcher */}
                <div className="px-2 py-1.5 bg-slate-50 rounded-xl mb-2 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Hackathon Role Switch (1-Click)
                  </span>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <button
                      onClick={() => {
                        switchRole('customer');
                        setActiveScreen('landing');
                        setShowProfileMenu(false);
                      }}
                      className={`p-1 rounded text-left flex items-center gap-1 transition ${
                        currentRole === 'customer'
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>🛍️</span>
                      <span className="truncate">Customer</span>
                    </button>
                    <button
                      onClick={() => {
                        switchRole('farmer');
                        setActiveScreen('farmer-panel');
                        setShowProfileMenu(false);
                      }}
                      className={`p-1 rounded text-left flex items-center gap-1 transition ${
                        currentRole === 'farmer'
                          ? 'bg-emerald-700 text-white font-bold'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>🚜</span>
                      <span className="truncate">Farmer</span>
                    </button>
                    <button
                      onClick={() => {
                        switchRole('admin');
                        setActiveScreen('admin-panel');
                        setShowProfileMenu(false);
                      }}
                      className={`p-1 rounded text-left flex items-center gap-1 transition ${
                        currentRole === 'admin'
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>🛡️</span>
                      <span className="truncate">Admin</span>
                    </button>
                    <button
                      onClick={() => {
                        switchRole('support');
                        setActiveScreen('support-panel');
                        setShowProfileMenu(false);
                      }}
                      className={`p-1 rounded text-left flex items-center gap-1 transition ${
                        currentRole === 'support'
                          ? 'bg-blue-700 text-white font-bold'
                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>🎧</span>
                      <span className="truncate">Support</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    switchRole('customer');
                    setActiveScreen('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <span className="material-symbols-outlined text-[16px] text-emerald-700">account_circle</span>
                  Customer Profile &amp; Preferences
                </button>

                <button
                  onClick={() => {
                    switchRole('customer');
                    setActiveScreen('orders');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  My Orders &amp; Escrow Releases
                </button>

                <button
                  onClick={() => {
                    switchRole('customer');
                    setActiveScreen('community');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left p-2 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">forum</span>
                  Farmer Messages &amp; Diaries
                </button>

                {/* Stakeholder Panels with Role Enforcement */}
                <div className="border-t border-slate-100 my-1 pt-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                    Stakeholder Panels
                  </span>
                  <button
                    onClick={() => {
                      setActiveScreen('farmer-panel');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between cursor-pointer ${
                      activeScreen === 'farmer-panel' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-emerald-700">agriculture</span>
                      <span>Farmer Workflow &amp; Panel</span>
                    </div>
                    {currentRole !== 'farmer' && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono font-semibold">
                        Farmer Only
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveScreen('admin-panel');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between cursor-pointer ${
                      activeScreen === 'admin-panel' ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-slate-700">admin_panel_settings</span>
                      <span>Admin Command Center</span>
                    </div>
                    {currentRole !== 'admin' && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono font-semibold">
                        Admin Only
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setActiveScreen('support-panel');
                      setShowProfileMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between cursor-pointer ${
                      activeScreen === 'support-panel' ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-blue-700">support_agent</span>
                      <span>Customer Support Executive</span>
                    </div>
                    {currentRole !== 'support' && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-mono font-semibold">
                        Support Only
                      </span>
                    )}
                  </button>
                </div>

                <div className="border-t border-slate-100 mt-1 pt-1">
                  {user ? (
                    <button
                      onClick={() => {
                        signOut();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        signInWithGoogle();
                        setShowProfileMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg hover:bg-emerald-50 text-emerald-800 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <span className="material-symbols-outlined text-[16px]">login</span>
                      Sign In with Google
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 px-2 py-1.5 bg-white text-xs">
        <button
          onClick={() => setActiveScreen('marketplace')}
          className={`py-1 px-2 font-semibold ${activeScreen === 'marketplace' ? 'text-emerald-700' : 'text-slate-500'}`}
        >
          Marketplace
        </button>
        <button
          onClick={() => setActiveScreen('traceability')}
          className={`py-1 px-2 font-semibold ${activeScreen === 'traceability' ? 'text-emerald-700' : 'text-slate-500'}`}
        >
          Traceability
        </button>
        <button
          onClick={() => setActiveScreen('community')}
          className={`py-1 px-2 font-semibold ${activeScreen === 'community' ? 'text-emerald-700' : 'text-slate-500'}`}
        >
          Community
        </button>
        <button
          onClick={() => setActiveScreen('orders')}
          className={`py-1 px-2 font-semibold ${activeScreen === 'orders' ? 'text-emerald-700' : 'text-slate-500'}`}
        >
          Orders
        </button>
      </div>
    </header>
  );
};

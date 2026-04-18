import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import ShoppingList from './components/ShoppingList';
import UserProfileModal, { useUserProfile } from './components/UserProfileModal';
import LandingPage from './components/LandingPage';

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="w-[18px] h-[18px]">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinejoin="round" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function AppLayout() {
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const { profile, save: saveProfile }  = useUserProfile();

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-[20px] font-bold tracking-tight text-ink leading-none"
            style={{ textDecoration: 'none' }}
          >
            sparkling<span className="text-accent">.</span>pizza
          </Link>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setProfileOpen(true)}
              title="My Profile"
              className="relative p-2 rounded-lg text-ink-3 hover:text-ink-2 hover:bg-border transition-colors duration-150"
            >
              <PersonIcon />
              {profile && (
                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-accent" />
              )}
            </button>

            <button
              onClick={() => setShoppingOpen(true)}
              title="Shopping List"
              className="p-2 rounded-lg text-ink-3 hover:text-ink-2 hover:bg-border transition-colors duration-150"
            >
              <BagIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8">
        <Routes>
          <Route path="/app"        element={<RecipeList />} />
          <Route path="/recipes/:id" element={<RecipeDetail userProfile={profile} />} />
        </Routes>
      </main>

      {shoppingOpen && <ShoppingList onClose={() => setShoppingOpen(false)} />}
      {profileOpen  && (
        <UserProfileModal onClose={() => setProfileOpen(false)} onSave={saveProfile} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<LandingPage />} />
        <Route path="/app"         element={<AppLayout />} />
        <Route path="/recipes/:id" element={<AppLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import ShoppingList from './components/ShoppingList';
import UserProfileModal, { useUserProfile } from './components/UserProfileModal';

function IconPerson() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

export default function App() {
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profile, save: saveProfile } = useUserProfile();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
            <a href="/" className="text-base font-bold tracking-tight text-gray-900">
              sparkling<span className="text-orange-500">.</span>pizza
            </a>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setProfileOpen(true)}
                title="My Profile"
                className={`relative p-2 rounded-xl transition-colors ${
                  profile ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'
                }`}
              >
                <IconPerson />
                {profile && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setShoppingOpen(true)}
                title="Shopping List"
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
              >
                <IconBag />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-5 py-8">
          <Routes>
            <Route path="/" element={<RecipeList />} />
            <Route path="/recipes/:id" element={<RecipeDetail userProfile={profile} />} />
          </Routes>
        </main>

        {shoppingOpen && <ShoppingList onClose={() => setShoppingOpen(false)} />}
        {profileOpen && (
          <UserProfileModal
            onClose={() => setProfileOpen(false)}
            onSave={saveProfile}
          />
        )}
      </div>
    </BrowserRouter>
  );
}

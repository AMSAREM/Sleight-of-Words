import React, { useState } from 'react';
import { X, User, Mail, Lock, Sparkles, Check, LogOut, ShieldCheck, Award } from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
}

const AVAILABLE_AVATARS = [
  { emoji: '🎩', label: 'Top Hat', title: 'Gentleman Conjurer' },
  { emoji: '🪄', label: 'Magic Wand', title: 'Apprentice Sleight' },
  { emoji: '🐰', label: 'Magic Bunny', title: 'Hat Trickster' },
  { emoji: '🃏', label: 'Joker Card', title: 'Master of Hands' },
  { emoji: '🔮', label: 'Crystal Orb', title: 'Mystic Seer' },
  { emoji: '🦉', label: 'Wise Owl', title: 'Cryptic Scholar' },
  { emoji: '🗝️', label: 'Skeleton Key', title: 'Cipher Breaker' },
  { emoji: '🎪', label: 'Carnival Tent', title: 'Grand Ringmaster' }
];

const USERS_STORAGE_KEY = 'sleight_of_words_registered_users';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout
}) => {
  const [tab, setTab] = useState<'signin' | 'signup' | 'profile'>(currentUser ? 'profile' : 'signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVAILABLE_AVATARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email/username and password');
      sound.playError();
      return;
    }

    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      const users: (UserProfile & { password?: string })[] = stored ? JSON.parse(stored) : [];
      const found = users.find(
        (u) =>
          (u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase()) &&
          u.password === password
      );

      if (found) {
        sound.playSuccess();
        const profile: UserProfile = {
          id: found.id,
          username: found.username,
          email: found.email,
          avatar: found.avatar,
          title: found.title,
          createdAt: found.createdAt
        };
        onLogin(profile);
        setSuccess('Welcome back, Magician!');
        setTimeout(() => {
          onClose();
        }, 600);
      } else {
        // Allow instant sign-in for demo convenience if no database yet
        const defaultProfile: UserProfile = {
          id: 'user_' + Date.now(),
          username: email.split('@')[0] || 'Magician',
          email: email.includes('@') ? email : `${email}@sleightofwords.game`,
          avatar: selectedAvatar.emoji,
          title: selectedAvatar.title,
          createdAt: new Date().toISOString()
        };
        onLogin(defaultProfile);
        sound.playSuccess();
        setSuccess('Signed in successfully!');
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch {
      setError('Could not verify credentials');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || username.length < 2) {
      setError('Username must be at least 2 characters');
      sound.playError();
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      sound.playError();
      return;
    }

    if (!password.trim() || password.length < 4) {
      setError('Password must be at least 4 characters');
      sound.playError();
      return;
    }

    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      const users: (UserProfile & { password?: string })[] = stored ? JSON.parse(stored) : [];

      const exists = users.some(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
      );
      if (exists) {
        setError('A magician with that username or email already exists');
        sound.playError();
        return;
      }

      const newUser = {
        id: 'user_' + Date.now(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
        avatar: selectedAvatar.emoji,
        title: selectedAvatar.title,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      sound.playSuccess();
      const profile: UserProfile = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        avatar: newUser.avatar,
        title: newUser.title,
        createdAt: newUser.createdAt
      };
      onLogin(profile);
      setSuccess('Magician account conjured successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch {
      setError('Failed to create account');
    }
  };

  const handleGuestLogin = () => {
    sound.playTap();
    const guestUser: UserProfile = {
      id: 'guest_' + Math.floor(Math.random() * 10000),
      username: 'Guest Illusionist',
      email: 'guest@sleightofwords.game',
      avatar: '🎩',
      title: 'Visiting Conjurer',
      createdAt: new Date().toISOString()
    };
    onLogin(guestUser);
    onClose();
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-[#0A102E]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-[#151F45] border-4 border-[#FFD467] rounded-3xl p-5 sm:p-6 shadow-2xl relative flex flex-col gap-4 text-[#FFF7E3]"
      >
        {/* Close Button */}
        <button
          id="close-auth-modal"
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#253675] hover:bg-[#344B98] text-[#FFF7E3] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-heading uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Magician Guild Pass</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl text-[#FFD467] drop-shadow-md">
            {currentUser ? 'Magician Profile' : tab === 'signup' ? 'Create Your Account' : 'Sign In'}
          </h2>
          <p className="text-xs text-[#9CB3E6] mt-0.5">
            {currentUser
              ? 'View your Sleight of Words identity and credentials'
              : 'Save your stars, coins, gems, and duel stats across sessions!'}
          </p>
        </div>

        {/* Tabs for Non-logged-in users */}
        {!currentUser && (
          <div className="flex bg-[#0E1638] rounded-xl p-1 border border-[#253258]">
            <button
              id="tab-sign-in"
              onClick={() => {
                sound.playTap();
                setTab('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-heading rounded-lg transition-all ${
                tab === 'signin'
                  ? 'btn-chunky-orange text-white shadow'
                  : 'text-[#9CB3E6] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-sign-up"
              onClick={() => {
                sound.playTap();
                setTab('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-heading rounded-lg transition-all ${
                tab === 'signup'
                  ? 'btn-chunky-orange text-white shadow'
                  : 'text-[#9CB3E6] hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Feedback message */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs font-bold text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* If Logged in: Profile View */}
        {currentUser ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-[#0E1638] rounded-2xl border border-[#2B3C75] flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F58A12] to-[#FFD467] border-2 border-[#FFE8A3] flex items-center justify-center text-3xl shadow-lg">
                {currentUser.avatar || '🎩'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-lg text-[#FFF7E3]">{currentUser.username}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-[#5EC3FF] font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{currentUser.title || 'Apprentice Sleight'}</span>
                </p>
                <p className="text-[11px] text-[#869CCF] mt-1 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="p-3 bg-[#182453] rounded-xl border border-[#253258] text-xs text-gray-300 flex items-center justify-between">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                Verified Magician
              </span>
            </div>

            <button
              id="auth-logout-btn"
              onClick={() => {
                sound.playTap();
                onLogout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-[#2A1D36] hover:bg-[#3D284F] text-[#FFA8BA] border border-[#522949] font-heading text-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : tab === 'signin' ? (
          /* Sign In Form */
          <form onSubmit={handleSignIn} className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-[#9CB3E6] block mb-1">
                Email or Magician Username:
              </label>
              <div className="relative">
                <input
                  id="signin-email-input"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. houdini@sleight.com or Houdini"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0E1638] text-white rounded-xl border border-[#2B3C75] focus:outline-hidden focus:ring-2 focus:ring-[#FFD467] text-sm"
                />
                <Mail className="w-4 h-4 text-[#5EC3FF] absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#9CB3E6] block mb-1">
                Password:
              </label>
              <div className="relative">
                <input
                  id="signin-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0E1638] text-white rounded-xl border border-[#2B3C75] focus:outline-hidden focus:ring-2 focus:ring-[#FFD467] text-sm"
                />
                <Lock className="w-4 h-4 text-[#5EC3FF] absolute left-3 top-3.5" />
              </div>
            </div>

            <button
              id="submit-signin-btn"
              type="submit"
              className="w-full py-3 rounded-xl btn-chunky-orange text-white font-heading text-sm shadow-lg mt-1 active:scale-98 transition-all"
            >
              SIGN IN
            </button>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-[#253258]"></div>
              <span className="shrink mx-2 text-[10px] text-gray-400 uppercase">Or</span>
              <div className="grow border-t border-[#253258]"></div>
            </div>

            <button
              id="guest-signin-btn"
              type="button"
              onClick={handleGuestLogin}
              className="w-full py-2 rounded-xl bg-[#1A2655] hover:bg-[#253675] text-[#93E6FB] font-heading text-xs border border-[#2D4288] transition-all"
            >
              Continue as Guest
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignUp} className="flex flex-col gap-3">
            {/* Avatar Selector */}
            <div>
              <label className="text-xs font-bold text-[#9CB3E6] block mb-1">
                Choose Magician Avatar:
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-2 bg-[#0E1638] rounded-xl border border-[#253258]">
                {AVAILABLE_AVATARS.map((av) => (
                  <button
                    key={av.label}
                    type="button"
                    onClick={() => {
                      sound.playTap();
                      setSelectedAvatar(av);
                    }}
                    className={`h-11 rounded-lg flex flex-col items-center justify-center text-xl transition-all ${
                      selectedAvatar.label === av.label
                        ? 'bg-amber-500/30 border-2 border-amber-400 scale-105 shadow'
                        : 'hover:bg-[#182453] border border-transparent'
                    }`}
                    title={`${av.label} - ${av.title}`}
                  >
                    <span>{av.emoji}</span>
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-[#FFD467] font-semibold mt-1 block text-center">
                Title: {selectedAvatar.title}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-[#9CB3E6] block mb-1">
                Magician Name:
              </label>
              <div className="relative">
                <input
                  id="signup-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. CleverSleight"
                  className="w-full pl-9 pr-3 py-2 bg-[#0E1638] text-white rounded-xl border border-[#2B3C75] focus:outline-hidden focus:ring-2 focus:ring-[#FFD467] text-sm"
                />
                <User className="w-4 h-4 text-[#5EC3FF] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#9CB3E6] block mb-1">
                Email:
              </label>
              <div className="relative">
                <input
                  id="signup-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sleight@puzzle.com"
                  className="w-full pl-9 pr-3 py-2 bg-[#0E1638] text-white rounded-xl border border-[#2B3C75] focus:outline-hidden focus:ring-2 focus:ring-[#FFD467] text-sm"
                />
                <Mail className="w-4 h-4 text-[#5EC3FF] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#9CB3E6] block mb-1">
                Password:
              </label>
              <div className="relative">
                <input
                  id="signup-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className="w-full pl-9 pr-3 py-2 bg-[#0E1638] text-white rounded-xl border border-[#2B3C75] focus:outline-hidden focus:ring-2 focus:ring-[#FFD467] text-sm"
                />
                <Lock className="w-4 h-4 text-[#5EC3FF] absolute left-3 top-3" />
              </div>
            </div>

            <button
              id="submit-signup-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl btn-chunky-green text-white font-heading text-sm shadow-lg mt-1 active:scale-98 transition-all"
            >
              CREATE MAGICIAN ACCOUNT
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Button } from '../common/Button.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { Sprout, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = async () => {
    setEmail('maya.gardener@plantpal.io');
    setPassword('plantpal123');
    setIsLogin(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isLogin ? 'Welcome Back to PlantPal' : 'Create Gardener Account'}
      subtitle={isLogin ? 'Sign in to access your saved plant collection' : 'Begin your smart gardening journey'}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        {!isLogin && (
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Your Name
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Green"
                className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gardener@example.com"
              className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-sm pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={loading}
        >
          {isLogin ? 'Sign In to Garden' : 'Create Free Account'}
        </Button>

        {/* 1-Click Demo Gardener Button */}
        <button
          type="button"
          onClick={handleFillDemo}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Fill Maya's Demo Credentials
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs text-stone-500 hover:text-emerald-800 font-medium"
          >
            {isLogin
              ? "Don't have an account yet? Sign up here"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

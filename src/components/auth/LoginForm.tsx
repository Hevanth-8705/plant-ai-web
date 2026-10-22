import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowRight, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormData } from '../../schemas/authSchemas.ts';
import { PasswordField } from './PasswordField.tsx';
import { Modal } from '../common/Modal.tsx';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateRegister,
}) => {
  const { login, signInWithGoogle } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    try {
      await login({
        email: data.email,
        password: data.password,
      });
      onSuccess();
    } catch (err: any) {
      setAuthError(err.message || 'Invalid email or password. Please verify your credentials.');
    }
  };

  const handleFillDemo = () => {
    setValue('email', 'maya.gardener@plantpal.io', { shouldValidate: true });
    setValue('password', 'plantpal123', { shouldValidate: true });
    setAuthError(null);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      setForgotLoading(true);
      const res = await api.auth.forgotPassword(forgotEmail);
      setForgotMessage(res.message + (res.demoHelper ? ` ${res.demoHelper}` : ''));
    } catch (err: any) {
      setForgotMessage(err.message || 'Failed to dispatch password reset.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {authError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5 text-left">
          <label htmlFor="login-email" className="block text-xs font-bold text-stone-700 tracking-wide">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={`w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border transition-all outline-none ${
                errors.email
                  ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-stone-200/90 bg-white/90 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-600 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <PasswordField
          label="Password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-stone-600 select-none">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 border-stone-300"
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            onClick={() => {
              setForgotEmail('');
              setForgotMessage(null);
              setShowForgotModal(true);
            }}
            className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors hover:underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || googleLoading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-800 hover:to-teal-800 transition-all duration-200 shadow-md shadow-emerald-700/25 hover:shadow-lg hover:shadow-emerald-700/35 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Signing into Garden...</span>
            </>
          ) : (
            <>
              <span>Sign In to PlantPal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative my-3 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Or continue with
          </span>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign in with Google</span>
        </button>

        {/* Demo Account Quick Access */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-300/80 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Fill Maya's Demo Account Credentials</span>
          </button>
        </div>

        {/* Navigation to Register */}
        <div className="pt-3 border-t border-stone-100 text-center text-xs text-stone-500">
          <span>Don't have a PlantPal account yet? </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="font-bold text-emerald-700 hover:text-emerald-800 transition-colors hover:underline"
          >
            Create account
          </button>
        </div>
      </form>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Your Password"
        subtitle="Enter your email to receive recovery instructions"
        maxWidth="sm"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          {forgotMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xl leading-relaxed">
              {forgotMessage}
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-stone-700">
              Account Email Address
            </label>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={forgotLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs disabled:opacity-60 flex items-center gap-1.5"
            >
              {forgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Send Instructions</span>
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SignInFormValues } from '../types';
import { AUTH_ERRORS, signInSchema } from '../constants';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import SignalLogo from '@/components/common/SignalLogo';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';

function GoogleIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
        fill='#EA4335'
      />
    </svg>
  );
}

export default function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  async function onSubmit(values: SignInFormValues) {
    if (fetchStatus === 'fetching') return;

    const { error: createError } = await signIn.create({
      identifier: values.email,
    });

    if (createError) {
      toast.error(
        AUTH_ERRORS[createError.code] ??
          'Something went wrong. Please try again.',
      );
      return;
    }

    const { error: passwordError } = await signIn.password({
      password: values.password,
    });

    if (passwordError) {
      toast.error(
        AUTH_ERRORS[passwordError.code] ??
          'Something went wrong. Please try again.',
      );
      return;
    }

    if (signIn.status === 'complete') {
      const { error: finalizeError } = await signIn.finalize();
      if (!finalizeError) {
        router.push('/chat');
      }
    }
  }

  async function handleGoogleSignIn() {
    if (!signIn) return;
    setGoogleLoading(true);
    try {
      const { error } = await signIn.sso({
        strategy: 'oauth_google',
        redirectCallbackUrl: '/sso-callback', // was: redirectUrl
        redirectUrl: '/chat', // was: redirectUrlComplete
      });
      if (error) {
        toast.error('Google sign-in failed. Please try again.');
        setGoogleLoading(false);
      }
    } catch {
      toast.error('Google sign-in failed. Please try again.');
      setGoogleLoading(false);
    }
  }

  const inputBase =
    'bg-secondary border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring w-full';

  return (
    <div className='w-full max-w-sm'>
      <div className='flex items-center justify-center mb-8'>
        <SignalLogo iconSize={32} />
      </div>

      <div className='card-neural'>
        <h1 className='text-foreground text-xl font-bold mb-1'>Welcome back</h1>
        <p className='text-muted-foreground text-sm mb-6'>
          Sign in to your account
        </p>

        {/* Google Sign In */}
        <button
          type='button'
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className='w-full flex items-center justify-center gap-2.5 bg-secondary hover:bg-secondary/80 border border-border rounded-md px-4 py-2.5 text-sm text-foreground font-medium transition-all mb-4 disabled:opacity-50'
        >
          {googleLoading ? (
            <Loader2 size={16} className='animate-spin' />
          ) : (
            <GoogleIcon />
          )}
          Continue with Google
        </button>

        <div className='flex items-center gap-3 mb-4'>
          <div className='flex-1 h-px bg-border' />
          <span className='text-muted-foreground/50 text-xs'>or</span>
          <div className='flex-1 h-px bg-border' />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm text-muted-foreground'>Email</label>
            <input
              type='email'
              placeholder='you@example.com'
              {...register('email')}
              className={cn(
                inputBase,
                errors.email ? 'border-error' : 'border-border',
              )}
            />
            {errors.email && (
              <p className='text-error text-xs'>{errors.email.message}</p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm text-muted-foreground'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                {...register('password')}
                className={cn(
                  inputBase,
                  'pr-10',
                  errors.password ? 'border-error' : 'border-border',
                )}
              />
              <button
                type='button'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p className='text-error text-xs'>{errors.password.message}</p>
            )}
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSubmitting && <Loader2 size={15} className='animate-spin' />}
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className='text-muted-foreground text-sm text-center mt-5'>
          Don&apos;t have an account?{' '}
          <Link href='/sign-up' className='text-primary hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import SignalLogo from '@/components/common/SignalLogo';
import { signUpSchema, verifyEmailSchema, AUTH_ERRORS } from '../constants';
import type { SignUpFormValues, VerifyEmailFormValues } from '../types';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';

type Step = 'register' | 'verify';

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

export default function SignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const [step, setStep] = useState<Step>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const registerForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
  });

  const verifyForm = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
  });

  async function handleGoogleSignUp() {
    if (!signUp) return;
    setGoogleLoading(true);
    try {
      const { error } = await signUp.sso({
        strategy: 'oauth_google',
        redirectCallbackUrl: '/sso-callback',
        redirectUrl: '/chat',
      });
      if (error) {
        toast.error('Google sign-up failed. Please try again.');
        setGoogleLoading(false);
      }
    } catch {
      toast.error('Google sign-up failed. Please try again.');
      setGoogleLoading(false);
    }
  }

  async function onRegister(values: SignUpFormValues) {
    if (fetchStatus === 'fetching') return;

    const { error: createError } = await signUp.create({
      firstName: values.firstName,
      lastName: values.lastName,
      emailAddress: values.email,
    });

    if (createError) {
      toast.error(
        AUTH_ERRORS[createError.code] ??
          'Something went wrong. Please try again.',
      );
      return;
    }

    const { error: passwordError } = await signUp.password({
      password: values.password,
    });

    if (passwordError) {
      toast.error(
        AUTH_ERRORS[passwordError.code] ??
          'Something went wrong. Please try again.',
      );
      return;
    }

    const { error: sendError } = await signUp.verifications.sendEmailCode();

    if (sendError) {
      toast.error(
        AUTH_ERRORS[sendError.code] ??
          'Something went wrong. Please try again.',
      );
      return;
    }

    setRegisteredEmail(values.email);
    setStep('verify');
  }

  async function onVerify(values: VerifyEmailFormValues) {
    if (fetchStatus === 'fetching') return;

    const { error: verifyError } = await signUp.verifications.verifyEmailCode({
      code: values.code,
    });

    if (verifyError) {
      toast.error(
        AUTH_ERRORS[verifyError.code] ?? 'Invalid code. Please try again.',
      );
      return;
    }

    if (signUp.status === 'complete') {
      const { error: finalizeError } = await signUp.finalize();
      if (!finalizeError) {
        router.push('/complete-profile');
      }
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
        {step === 'register' ? (
          <>
            <h1 className='text-foreground text-xl font-bold mb-1'>
              Create account
            </h1>
            <p className='text-muted-foreground text-sm mb-6'>
              Start trading smarter today
            </p>

            {/* Google Sign Up */}
            <button
              type='button'
              onClick={handleGoogleSignUp}
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

            <form
              onSubmit={registerForm.handleSubmit(onRegister)}
              className='flex flex-col gap-4'
            >
              <div className='flex gap-3'>
                <div className='flex flex-col gap-1.5 flex-1'>
                  <label className='text-sm text-muted-foreground'>
                    First name
                  </label>
                  <input
                    type='text'
                    placeholder='John'
                    {...registerForm.register('firstName')}
                    className={cn(
                      inputBase,
                      registerForm.formState.errors.firstName
                        ? 'border-error'
                        : 'border-border',
                    )}
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className='text-error text-xs'>
                      {registerForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className='flex flex-col gap-1.5 flex-1'>
                  <label className='text-sm text-muted-foreground'>
                    Last name
                  </label>
                  <input
                    type='text'
                    placeholder='Doe'
                    {...registerForm.register('lastName')}
                    className={cn(
                      inputBase,
                      registerForm.formState.errors.lastName
                        ? 'border-error'
                        : 'border-border',
                    )}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className='text-error text-xs'>
                      {registerForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='text-sm text-muted-foreground'>Email</label>
                <input
                  type='email'
                  placeholder='you@example.com'
                  {...registerForm.register('email')}
                  className={cn(
                    inputBase,
                    registerForm.formState.errors.email
                      ? 'border-error'
                      : 'border-border',
                  )}
                />
                {registerForm.formState.errors.email && (
                  <p className='text-error text-xs'>
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className='flex flex-col gap-1.5'>
                <label className='text-sm text-muted-foreground'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Min. 8 characters'
                    {...registerForm.register('password')}
                    className={cn(
                      inputBase,
                      'pr-10',
                      registerForm.formState.errors.password
                        ? 'border-error'
                        : 'border-border',
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
                {registerForm.formState.errors.password && (
                  <p className='text-error text-xs'>
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div id='clerk-captcha' />

              <button
                type='submit'
                disabled={registerForm.formState.isSubmitting}
                className='btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {registerForm.formState.isSubmitting && (
                  <Loader2 size={15} className='animate-spin' />
                )}
                {registerForm.formState.isSubmitting
                  ? 'Creating account...'
                  : 'Create Account'}
              </button>
            </form>

            <p className='text-muted-foreground text-sm text-center mt-5'>
              Already have an account?{' '}
              <Link href='/sign-in' className='text-primary hover:underline'>
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className='text-foreground text-xl font-bold mb-1'>
              Verify your email
            </h1>
            <p className='text-muted-foreground text-sm mb-6'>
              We sent a 6-digit code to{' '}
              <span className='text-foreground'>{registeredEmail}</span>
            </p>

            <form
              onSubmit={verifyForm.handleSubmit(onVerify)}
              className='flex flex-col gap-4'
            >
              <div className='flex flex-col gap-1.5'>
                <label className='text-sm text-muted-foreground'>
                  Verification code
                </label>
                <input
                  type='text'
                  placeholder='123456'
                  maxLength={6}
                  {...verifyForm.register('code')}
                  className={cn(
                    inputBase,
                    'tracking-widest text-center text-lg',
                    verifyForm.formState.errors.code
                      ? 'border-error'
                      : 'border-border',
                  )}
                />
                {verifyForm.formState.errors.code && (
                  <p className='text-error text-xs'>
                    {verifyForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <button
                type='submit'
                disabled={verifyForm.formState.isSubmitting}
                className='btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {verifyForm.formState.isSubmitting && (
                  <Loader2 size={15} className='animate-spin' />
                )}
                {verifyForm.formState.isSubmitting
                  ? 'Verifying...'
                  : 'Verify Email'}
              </button>

              <button
                type='button'
                onClick={() => setStep('register')}
                className='btn-ghost text-sm w-full flex items-center justify-center gap-1'
              >
                <ArrowLeft size={14} /> Back
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

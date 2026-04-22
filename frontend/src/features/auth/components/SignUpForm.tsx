'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signUpSchema, verifyEmailSchema, AUTH_ERRORS } from '../constants';
import type { SignUpFormValues, VerifyEmailFormValues } from '../types';

type Step = 'register' | 'verify';

export default function SignUpForm() {
  const { signUp, isLoaded, setActive } = useSignUp() as any; // eslint-disable-line
  const router = useRouter();
  const [step, setStep] = useState<Step>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const registerForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const verifyForm = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
  });

  async function onRegister(values: SignUpFormValues) {
    if (!isLoaded) return;

    try {
      await signUp.create({
        firstName: values.firstName,
        lastName: values.lastName,
        emailAddress: values.email,
        password: values.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setRegisteredEmail(values.email);
      setStep('verify');
      //eslint-disable-next-line
    } catch (err: any) {
      const code = err?.errors?.[0]?.code ?? '';
      toast.error(
        AUTH_ERRORS[code] ?? 'Something went wrong. Please try again.',
      );
    }
  }

  async function onVerify(values: VerifyEmailFormValues) {
    if (!isLoaded) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: values.code,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/complete-profile');
      }
      //eslint-disable-next-line
    } catch (err: any) {
      const code = err?.errors?.[0]?.code ?? '';
      toast.error(AUTH_ERRORS[code] ?? 'Invalid code. Please try again.');
    }
  }

  const inputBase =
    'bg-secondary border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring w-full';

  return (
    <div className='w-full max-w-sm'>
      <div className='flex items-center justify-center gap-2 mb-8'>
        <div className='w-8 h-8 rounded-md bg-primary flex items-center justify-center glow-blue'>
          <svg width='16' height='16' viewBox='0 0 14 14' fill='none'>
            <path
              d='M7 1L13 4V10L7 13L1 10V4L7 1Z'
              fill='white'
              fillOpacity='0.9'
            />
          </svg>
        </div>
        <span className='text-foreground font-bold text-base tracking-wide'>
          SIGNAL
        </span>
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

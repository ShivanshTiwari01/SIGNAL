'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SignInFormValues } from '../types';
import { AUTH_ERRORS, signInSchema } from '../constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import Link from 'next/link';
import SignalLogo from '@/components/common/SignalLogo';

export default function SignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

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
          Don&apost have an account?{' '}
          <Link href='/sign-up' className='text-primary hover:underline'>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/store/axios';
import { completeProfileSchema } from '../constants';
import type { CompleteProfileFormValues } from '../types';
import SignalLogo from '@/components/common/SignalLogo';

async function completeProfileRequest(data: CompleteProfileFormValues) {
  const res = await api.patch('/auth/complete-profile', data);
  return res.data;
}

export default function CompleteProfileForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { bio: '', dob: '', mobile: '' },
  });

  const bioValue = watch('bio') ?? '';

  const mutation = useMutation({
    mutationFn: completeProfileRequest,
    onSuccess: () => {
      toast.success('Profile saved!');
      router.push('/chat');
    },
    onError: () => {
      toast.error('Failed to save profile. Please try again.');
    },
  });

  function onSubmit(values: CompleteProfileFormValues) {
    mutation.mutate({
      bio: values.bio || undefined,
      dob: values.dob || undefined,
      mobile: values.mobile || undefined,
    });
  }

  const inputBase =
    'bg-secondary border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring w-full';

  return (
    <div className='w-full max-w-md'>
      <div className='flex items-center justify-center mb-8'>
        <SignalLogo iconSize={32} />
      </div>

      <div className='card-neural'>
        <h1 className='text-foreground text-xl font-bold mb-1'>
          Complete your profile
        </h1>
        <p className='text-muted-foreground text-sm mb-6'>
          All fields are optional. You can update these later.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1.5'>
            <label className='text-sm text-muted-foreground'>Bio</label>
            <textarea
              rows={3}
              placeholder='Tell us about your trading style...'
              {...register('bio')}
              className={cn(
                inputBase,
                'resize-none',
                errors.bio ? 'border-error' : 'border-border',
              )}
            />
            <div className='flex justify-between items-center'>
              {errors.bio ? (
                <p className='text-error text-xs'>{errors.bio.message}</p>
              ) : (
                <span />
              )}
              <span className='text-muted-foreground/50 text-xs'>
                {bioValue.length}/300
              </span>
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm text-muted-foreground'>
              Date of birth
            </label>
            <input
              type='date'
              {...register('dob')}
              className={cn(
                inputBase,
                errors.dob ? 'border-error' : 'border-border',
              )}
            />
            {errors.dob && (
              <p className='text-error text-xs'>{errors.dob.message}</p>
            )}
          </div>

          <div className='flex flex-col gap-1.5'>
            <label className='text-sm text-muted-foreground'>
              Mobile number
            </label>
            <input
              type='tel'
              placeholder='+91 98765 43210'
              {...register('mobile')}
              className={cn(
                inputBase,
                errors.mobile ? 'border-error' : 'border-border',
              )}
            />
            {errors.mobile && (
              <p className='text-error text-xs'>{errors.mobile.message}</p>
            )}
          </div>

          <div className='flex gap-3 mt-2'>
            <button
              type='button'
              onClick={() => router.push('/chat')}
              className='btn-ghost flex-1 text-sm'
            >
              Skip for now
            </button>
            <button
              type='submit'
              disabled={mutation.isPending}
              className='btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {mutation.isPending && (
                <Loader2 size={15} className='animate-spin' />
              )}
              {mutation.isPending ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

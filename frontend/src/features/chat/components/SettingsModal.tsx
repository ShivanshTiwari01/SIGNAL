'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, User, Mail, Phone, FileText, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/store/axios';
import { zodResolver } from '@hookform/resolvers/zod/dist/zod.js';

const settingsSchema = z.object({
  bio: z.string().max(300).optional(),
  mobile: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  dob: z.string().optional(),
});

type SettingsValues = z.infer<typeof settingsSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: Props) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'account'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
  });

  // Fetch current profile on open
  useEffect(() => {
    if (!open) return;
    api
      .get('/auth/me')
      .then((res) => {
        const profile = res.data?.data?.profile;
        reset({
          bio: profile?.bio ?? '',
          mobile: res.data?.data?.mobile ?? '',
          dob: profile?.dob ? profile.dob.slice(0, 10) : '',
        });
      })
      .catch(() => {
        // Ignore - form stays with defaults
      });
  }, [open, reset]);

  async function onSubmit(values: SettingsValues) {
    setIsSaving(true);
    setSaved(false);
    try {
      await api.patch('/auth/complete-profile', {
        bio: values.bio || undefined,
        mobile: values.mobile || undefined,
        dob: values.dob || undefined,
      });
      setSaved(true);
      toast.success('Profile updated successfully');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) return null;

  const inputBase =
    'bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring w-full transition-colors';

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-background/80 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative z-10 w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl shadow-black/40 flex flex-col max-h-[90vh]'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-border'>
          <div>
            <h2 className='text-foreground font-semibold text-base'>
              Settings
            </h2>
            <p className='text-muted-foreground text-xs mt-0.5'>
              Manage your account and preferences
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-secondary'
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex gap-1 px-6 pt-4 pb-0'>
          {(['profile', 'account'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 text-sm rounded-md transition-all capitalize',
                activeTab === tab
                  ? 'bg-primary/10 text-primary border border-primary/20 font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-5'>
          {activeTab === 'profile' && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-col gap-5'
            >
              {/* Avatar + Name (read-only from Clerk) */}
              <div className='flex items-center gap-4 p-4 bg-secondary/50 rounded-lg border border-border/50'>
                <div className='w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-lg font-bold text-primary shrink-0'>
                  {user?.firstName?.[0] ?? 'U'}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-foreground font-semibold text-sm'>
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className='text-muted-foreground text-xs mt-0.5 flex items-center gap-1'>
                    <Mail size={10} />
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-sm text-muted-foreground flex items-center gap-1.5'>
                  <FileText size={12} />
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  placeholder='Tell us about yourself…'
                  rows={3}
                  className={cn(
                    inputBase,
                    'resize-none',
                    errors.bio && 'border-error',
                  )}
                />
                {errors.bio && (
                  <p className='text-error text-xs'>{errors.bio.message}</p>
                )}
              </div>

              {/* Mobile */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-sm text-muted-foreground flex items-center gap-1.5'>
                  <Phone size={12} />
                  Mobile Number
                </label>
                <input
                  type='tel'
                  placeholder='+91 98765 43210'
                  {...register('mobile')}
                  className={cn(inputBase, errors.mobile && 'border-error')}
                />
                {errors.mobile && (
                  <p className='text-error text-xs'>{errors.mobile.message}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div className='flex flex-col gap-1.5'>
                <label className='text-sm text-muted-foreground flex items-center gap-1.5'>
                  <User size={12} />
                  Date of Birth
                </label>
                <input
                  type='date'
                  {...register('dob')}
                  className={cn(
                    inputBase,
                    'text-foreground [color-scheme:dark]',
                  )}
                />
              </div>

              {/* Save button */}
              <button
                type='submit'
                disabled={isSaving}
                className={cn(
                  'btn-primary flex items-center justify-center gap-2 mt-1',
                  isSaving && 'opacity-70 cursor-not-allowed',
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={15} className='animate-spin' /> Saving…
                  </>
                ) : saved ? (
                  <>
                    <Check size={15} /> Saved
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          )}

          {activeTab === 'account' && (
            <div className='flex flex-col gap-4'>
              <div className='p-4 bg-secondary/50 rounded-lg border border-border/50 flex flex-col gap-3'>
                <p className='text-foreground font-semibold text-sm'>
                  Account Details
                </p>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>Email</span>
                  <span className='text-foreground text-sm'>
                    {user?.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>
                    Account ID
                  </span>
                  <span className='text-muted-foreground text-xs font-mono'>
                    {user?.id?.slice(0, 20)}…
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>Joined</span>
                  <span className='text-foreground text-sm'>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : '—'}
                  </span>
                </div>
              </div>
              <div className='p-4 bg-error/5 rounded-lg border border-error/20'>
                <p className='text-foreground font-semibold text-sm mb-1'>
                  Danger Zone
                </p>
                <p className='text-muted-foreground text-xs mb-3 leading-relaxed'>
                  To delete your account or manage advanced security settings,
                  please visit your account portal.
                </p>
                <a
                  href='https://accounts.clerk.dev'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-xs text-error hover:underline'
                >
                  Open Account Portal →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

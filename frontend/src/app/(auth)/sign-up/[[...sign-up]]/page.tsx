import { SignUpForm } from '@/features/auth/components';

export default function SignUpPage() {
  return (
    <div className='relative flex items-center justify-center min-h-screen px-4 bg-background'>
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]' />
      </div>
      <div className='relative z-10'>
        <SignUpForm />
      </div>
    </div>
  );
}

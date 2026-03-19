import Image from 'next/image';

export default function Home() {
  return (
    <div className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
      <main className='flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start'>
        <div className='flex flex-col items-center justify-center w-full gap-6 text-center sm:items-start'>
          <h1 className='text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl'>
            Welcome to <span className='text-blue-600'>AI Agent</span>
          </h1>
          <p className='mt-3 text-2xl text-gray-500 dark:text-gray-400 sm:mt-5 sm:text-3xl'>
            An AI agent that can perform various tasks and interact with users.
          </p>
        </div>
      </main>
    </div>
  );
}

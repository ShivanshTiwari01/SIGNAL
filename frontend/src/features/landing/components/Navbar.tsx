export function Navbar() {
  return (
    <nav className='flex items-center justify-between p-4 bg-background text-white'>
      <span className='font-bold text-xl text-primary'>FLUX AI</span>
      <div className='space-x-4'>
        <a href='#features' className='hover:text-primary transition-colors'>
          Features
        </a>
        <a href='#pricing' className='hover:text-primary transition-colors'>
          Pricing
        </a>
        <a href='#docs' className='hover:text-primary transition-colors'>
          Docs
        </a>
      </div>
      <button className='bg-secondary text-primary px-4 py-2 rounded hover:bg-primary-dark transition-colors'>
        Sign In
      </button>
    </nav>
  );
}

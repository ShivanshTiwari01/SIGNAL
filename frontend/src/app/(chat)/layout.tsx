export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='h-screen flex overflow-hidden bg-background'>
      {children}
    </div>
  );
}

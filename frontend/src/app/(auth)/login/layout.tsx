// Layout of the login/register page: no header, no footer, no AI button.
// The card is centered on a light blue background.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-50 p-4">
      {children}
    </main>
  );
}
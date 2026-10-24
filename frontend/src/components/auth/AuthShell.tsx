import Image from "next/image";
import Link from "next/link";
import AuthCarousel from "@/components/auth/AuthCarousel";

// The card of the login/register page.
// On phones the image side is hidden and only the form is shown.
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* Image side */}
      <div className="relative hidden min-h-[620px] bg-blue-50 md:block">
        <AuthCarousel />
      </div>

      {/* Form side: the logo (click = go to the shop), then the page content */}
      <div className="p-6 sm:p-10">
        <Link href="/" aria-label="Back to SmartShop AI" className="inline-block">
          <Image
            src="/assets/images/logo.png"
            alt="SmartShop AI"
            width={48}
            height={48}
            style={{ height: "48px", width: "auto" }}
          />
        </Link>

        {children}
      </div>
    </div>
  );
}
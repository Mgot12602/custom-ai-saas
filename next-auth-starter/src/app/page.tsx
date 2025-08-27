import Image from "next/image";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center min-h-screen p-8 pb-20 gap-8 sm:p-20">
      <header className="w-full flex justify-between items-center">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={120}
          height={30}
          priority
        />
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="font-medium text-sm hover:underline"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <button className="font-medium text-sm hover:underline">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="rounded-full bg-black text-white px-4 py-2 text-sm font-medium">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </header>

      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <div className="max-w-2xl text-center sm:text-left">
          <h1 className="text-4xl font-bold mb-4">
            Next.js with Clerk Authentication
          </h1>
          <p className="text-lg mb-8">
            A starter template for building secure applications with Next.js and
            Clerk authentication.
          </p>

          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-base h-12 px-5 inline-flex"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
          <SignedOut>
            <div className="flex gap-4 items-center flex-col sm:flex-row">
              <SignUpButton>
                <button className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto">
                  Get Started
                </button>
              </SignUpButton>
              <SignInButton>
                <button className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </div>
      </main>

      <footer className="flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://clerk.com/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Clerk Documentation
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noopener noreferrer"
        >
          Next.js Documentation
        </a>
      </footer>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthActions } from '@convex-dev/auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/';
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn('password', { email, password, flow: 'signIn' });
      router.push(returnTo);
    } catch (err) {
      toast.error('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-problem-500">
            <span className="text-lg font-bold text-white">P</span>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Welcome back</h1>
          <p className="mt-1 text-sm text-text-secondary">Sign in to your ProblemHunt account</p>
        </div>

        {/* Email/password form */}
        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            Sign in
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-text-tertiary">
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="text-problem-500 hover:text-problem-400">
            Sign up
          </Link>
        </p>

        {/* Escape hatch — browse without account */}
        <div className="mt-4 text-center">
          <Link
            href="/explore"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            ← Continue browsing without an account
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useAuthActions } from '@convex-dev/auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export default function SignUpPage() {
  const { signIn } = useAuthActions();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn('password', { email, password, name, flow: 'signUp' });
    } catch (err) {
      toast.error('Could not create account. Please try again.');
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
          <h1 className="text-xl font-semibold text-text-primary">Join ProblemHunt</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Share problems. Help builders find what to build.
          </p>
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailSignUp} className="flex flex-col gap-4">
          <Input
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Smith"
            autoComplete="name"
            required
          />
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
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Button type="submit" isLoading={isLoading} className="w-full mt-2">
            Create account
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-text-muted">
          By signing up you agree to our{' '}
          <Link href="/terms" className="text-text-tertiary hover:text-text-secondary">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-text-tertiary hover:text-text-secondary">
            Privacy Policy
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-text-tertiary">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="text-problem-500 hover:text-problem-400">
            Sign in
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

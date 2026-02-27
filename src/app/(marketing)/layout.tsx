import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProblemHunt — The place where the best problems find builders',
  description:
    'Browse a subreddit-style feed of real problems posted by real humans waiting to be solved.',
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

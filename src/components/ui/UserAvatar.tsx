import Image from 'next/image';
import { cn, getInitials, getAvatarColor } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CONFIG: Record<AvatarSize, { container: string; text: string; px: number }> = {
  xs: { container: 'h-6 w-6',   text: 'text-2xs', px: 24 },
  sm: { container: 'h-7 w-7',   text: 'text-2xs', px: 28 },
  md: { container: 'h-8 w-8',   text: 'text-xs',  px: 32 },
  lg: { container: 'h-10 w-10', text: 'text-sm',  px: 40 },
  xl: { container: 'h-16 w-16', text: 'text-base',px: 64 },
};

export interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
  className,
}: UserAvatarProps) {
  const config = SIZE_CONFIG[size];
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  if (avatarUrl) {
    return (
      <div
        className={cn(
          'relative rounded-full overflow-hidden flex-shrink-0',
          config.container,
          className,
        )}
      >
        <Image
          src={avatarUrl}
          alt={`${name}'s avatar`}
          width={config.px}
          height={config.px}
          className="object-cover"
          unoptimized={avatarUrl.startsWith('https://lh3.googleusercontent.com')}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0',
        'font-semibold text-white select-none',
        config.container,
        config.text,
        colorClass,
        className,
      )}
      aria-label={`${name}'s avatar`}
    >
      {initials}
    </div>
  );
}

// src/components/ui/OAuthButtons.tsx

import type { AuthProviderInfo } from 'pocketbase';
import { PrimaryActionButton } from './PrimaryActionButton';

interface OAuthButtonsProps {
  providers?: AuthProviderInfo[];
  onClick: (providerName: string) => void | Promise<void>;
}

export function OAuthButtons({ providers, onClick }: OAuthButtonsProps) {
  if (!providers?.length) return null;
  return (
    <div>
      {providers.map((provider) => (
        <PrimaryActionButton
          key={provider.name}
          className="mt-4"
          onClick={() => onClick(provider.name)}
        >
          Sign in with {provider.displayName}
        </PrimaryActionButton>
      ))}
    </div>
  );
}

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode };

export function WorkspaceIconButton({ label, children, className = '', ...props }: Props) {
  return <button type="button" aria-label={label} title={label} className={`workspace-icon-button ${className}`} {...props}>{children}</button>;
}

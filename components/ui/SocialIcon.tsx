import type { SVGProps } from "react";

interface SocialIconProps extends SVGProps<SVGSVGElement> {
  name: string;
}

export default function SocialIcon({ name, ...props }: SocialIconProps) {
  const commonProps = {
    ...props,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: "false" as const,
  } satisfies SVGProps<SVGSVGElement>;

  if (name === "Instagram") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (name === "LinkedIn") {
    return (
      <svg {...commonProps} fill="currentColor" stroke="none">
        <path d="M6.5 9H3.8v11h2.7V9Z" />
        <path d="M5.15 4a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3Z" />
        <path d="M20.2 13.7c0-3.1-1.65-4.95-4.3-4.95-1.45 0-2.45.65-3.05 1.45V9H10.2v11h2.7v-5.9c0-1.65.85-2.6 2.2-2.6 1.25 0 2 .85 2 2.55V20h3.1v-6.3Z" />
      </svg>
    );
  }

  if (name === "YouTube") {
    return (
      <svg {...commonProps} fill="currentColor" stroke="none">
        <path d="M21.4 7.2a3 3 0 0 0-2.1-2.1C17.45 4.6 12 4.6 12 4.6s-5.45 0-7.3.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2.1 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.85.5 7.3.5 7.3.5s5.45 0 7.3-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 21.9 12a31 31 0 0 0-.5-4.8ZM10 15.45v-6.9L15.9 12 10 15.45Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

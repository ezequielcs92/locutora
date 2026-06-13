"use client";

import { ExternalLink, FolderOpen, ListMusic, LogOut, Video } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { signOut } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin/demos", label: "Demos", icon: ListMusic },
  { href: "/admin/videos", label: "Videos", icon: Video },
  { href: "/admin/categorias", label: "Categorías", icon: FolderOpen },
];

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <aside className="flex shrink-0 flex-col border-b border-cream/8 bg-surface md:min-h-screen md:w-60 md:border-b-0 md:border-r">
      <div className="border-b border-cream/8 p-5">
        <p className="font-display text-lg font-medium text-cream">
          Panel<span className="text-accent">.</span>
        </p>
        <p className="mt-1 truncate text-xs text-muted">{userEmail}</p>
      </div>

      <nav className="flex flex-row gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-accent/15 font-medium text-accent"
                  : "text-muted hover:bg-cream/5 hover:text-cream"
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-row gap-1 border-t border-cream/8 p-3 md:flex-col">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted transition-colors hover:bg-cream/5 hover:text-cream"
        >
          <ExternalLink size={17} />
          Ver sitio
        </a>
        <button
          onClick={() => startTransition(() => signOut())}
          disabled={pending}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-muted transition-colors hover:bg-cream/5 hover:text-cream disabled:opacity-60"
        >
          <LogOut size={17} />
          {pending ? "Cerrando…" : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  );
}

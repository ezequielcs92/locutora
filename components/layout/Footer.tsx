import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-cream/5 py-10">
      <div className="section-container flex flex-col items-center justify-between gap-4 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.name} — {siteConfig.role}
        </p>
        <div className="flex items-center gap-6">
          {siteConfig.socials.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-cream"
            >
              {social.name}
            </a>
          ))}
          <Link href="/admin" className="opacity-50 transition-opacity hover:opacity-100">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

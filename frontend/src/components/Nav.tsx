"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Inspiratie + Generaties hidden from nav per Dennis (07-24, "not going to use
// it for now"). Routes still exist — just not linked.
const TABS = [
  { href: "/triage", label: "Triage" },
  { href: "/library", label: "Library" },
  { href: "/ad-system", label: "Ad system" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [logoOk, setLogoOk] = useState(true);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {logoOk && (
              // Small brand logo, top-left (Dennis 07-24). Self-hosted at
              // public/logo.webp (free image hosts block hotlinking, so we
              // ship the file). Self-hides until the file is committed.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/logo.webp"
                alt="Bakje Geluk"
                className="h-8 w-auto"
                onError={() => setLogoOk(false)}
              />
            )}
            <span className="font-semibold text-gray-900">ADS Tool · Bakje Geluk</span>
          </div>
          <nav className="flex gap-1">
            {TABS.map((t) => {
              const active = pathname === t.href;
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    active
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

import Link from "next/link";
import { BookOpen, ExternalLink } from "lucide-react";

const siteLinks = [
  { href: "/learn", label: "학습 위키" },
  { href: "/blog", label: "블로그" },
  { href: "/tools", label: "도구 소개" },
  { href: "/about", label: "소개" },
];

const toolLinks = [
  { href: "https://auditsay.com", label: "AuditSay" },
  { href: "https://apqpmanager.com", label: "APQP Manager" },
  { href: "https://gaugemanager.com", label: "Gauge Manager" },
  { href: "https://nc-manager-chi.vercel.app", label: "NC Manager" },
  { href: "https://change-manager-self.vercel.app", label: "4M Change Manager" },
];

export default function Footer() {
  return (
    <footer className="bg-background-soft border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-brand-navy mb-3">
              <BookOpen className="h-5 w-5 text-brand-orange" />
              <span>QmIntel</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              품질 실무자가 IATF 16949·품질기술사·실무 도구를
              한 곳에서 만나는 지식 베이스.
            </p>
          </div>

          {/* This site */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">이 사이트</h3>
            <ul className="space-y-2">
              {siteLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quality tools */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">품질 도구</h3>
            <ul className="space-y-2">
              {toolLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 QmIntel. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            문의:{" "}
            <a
              href="mailto:support@qmintel.com"
              className="hover:text-foreground transition-colors underline underline-offset-2"
            >
              support@qmintel.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

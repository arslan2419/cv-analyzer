"use client";

import Link from "next/link";
import {
  FileText,
  MessageCircleCode,
  Github,
  Linkedin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background-secondary/50 mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">ResumeAI</span>
            </div>
            <p className="text-sm text-foreground-muted">
              AI-powered resume analyzer helping job seekers land their dream
              jobs.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li>
                <Link href="#features" className="hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-foreground">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li>
                <Link
                  href="https://zhsolutions.vercel.app/#about"
                  className="hover:text-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="https://zhsolutions.vercel.app"
                  className="hover:text-foreground"
                >
                  Website
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-foreground-muted">
              <li>
                <Link href="#privacy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground-muted">
            <Link
              href="https://zhsoftwaresolutions.com/"
              target="_blank"
              className="text-foreground-muted hover:text-foreground"
            >
              Zh Solutions
            </Link>{" "}
            © {new Date().getFullYear()} ResumeAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://wa.me/923340042304"
              target="_blank"
              className="text-foreground-muted hover:text-foreground"
            >
              <MessageCircleCode className="w-5 h-5" />
            </Link>
            <Link
              href="https://github.com/arslan2419"
              target="_blank"
              className="text-foreground-muted hover:text-foreground"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://linkedin.com/in/arslan-mukhtar"
              target="_blank"
              className="p-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


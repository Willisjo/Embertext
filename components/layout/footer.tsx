"use client";

import Link from "next/link";
import { Sparkles, Github, Twitter, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 glass mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <img src="/icon.jpg" alt="Embertext" className="w-7 h-7 rounded-lg object-cover" />
              <span className="font-bold text-base">Embertext</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              Free AI tools and Bitcoin utilities. No signup, no paywalls, no limits.
              Built for everyone who needs powerful tools without the cost.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Tools</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/humanizer" className="hover:text-foreground transition-colors">AI Humanizer</Link></li>
              <li><Link href="/detector" className="hover:text-foreground transition-colors">AI Detector</Link></li>
              <li><Link href="/image-detector" className="hover:text-foreground transition-colors">AI Image Detector</Link></li>
              <li><Link href="/bitcoin" className="hover:text-foreground transition-colors">Bitcoin Calculator</Link></li>
              <li><Link href="/receipts" className="hover:text-foreground transition-colors">Receipt Generator</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Cookie Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Embertext. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="text-xs flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for the community
            </span>
            <div className="flex gap-3">
              <a href="https://github.com/Willisjo" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://x.com/leintrel5" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

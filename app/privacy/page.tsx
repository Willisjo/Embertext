import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Embertext",
  description: "Privacy Policy for Embertext AI tools and Bitcoin utilities.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: July 19, 2026
      </p>

      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            Welcome to Embertext (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We are committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard information when you use
            our website and services (collectively, the &quot;Service&quot;). By using the Service, you agree
            to the practices described in this policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We designed the Service with privacy in mind. We collect minimal data:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              <strong>Text Input:</strong> Text you enter into the AI Humanizer or AI Detector is processed
              in real time and is not stored on our servers. AI-processed text is sent to third-party
              providers (Groq, NaraRouter) solely to generate a response and is immediately discarded.
            </li>
            <li>
              <strong>Image Uploads:</strong> Images uploaded to the AI Image Detector are processed locally
              in your browser and are never transmitted to our servers.
            </li>
            <li>
              <strong>Bitcoin Data:</strong> Price data is fetched from CoinGecko&apos;s public API. No personal
              information is exchanged during these requests.
            </li>
            <li>
              <strong>Usage Analytics:</strong> We may collect anonymized, aggregate usage data (such as
              page views and feature usage) to improve the Service. This data cannot be used to identify
              you personally.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the limited data we collect solely to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
            <li>Operate and maintain the Service</li>
            <li>Process your requests in real time</li>
            <li>Improve and optimize the Service</li>
            <li>Monitor and analyze usage trends</li>
            <li>Detect and prevent abuse or security issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Storage and Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not store your text input, uploaded images, or generated output on our servers.
            All processing happens in real time, and data is discarded immediately after a response
            is returned. We do not create profiles of users or maintain databases of user activity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">
            The Service integrates with the following third-party providers:
          </p>
          <ul className="list-disc list-inside text-muted-foreground space-y-2">
            <li>
              <strong>Groq (groq.com):</strong> Provides AI text processing capabilities. Text sent to
              Groq is processed in real time and is subject to Groq&apos;s privacy policy. We do not
              control how Groq handles data after processing.
            </li>
            <li>
              <strong>NaraRouter (router.bynara.id):</strong> Provides AI text processing as a secondary
              provider. Same data handling applies as with Groq.
            </li>
            <li>
              <strong>CoinGecko (coingecko.com):</strong> Provides cryptocurrency price data. No personal
              information is shared with CoinGecko.
            </li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We encourage you to review the privacy policies of these third-party services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Cookies and Local Storage</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service may use browser local storage to remember your preferences (such as theme
            settings and mode selections). We do not use tracking cookies or advertising cookies.
            No third-party tracking scripts are loaded for advertising or analytics purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement reasonable security measures to protect the Service. However, no method
            of transmission over the Internet or method of electronic storage is 100% secure. We
            cannot guarantee absolute security of data, but we are committed to protecting your
            information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service is not intended for children under the age of 13. We do not knowingly collect
            personal information from children. If you are a parent or guardian and believe your child
            has provided us with personal information, please contact us so we can take appropriate
            action.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this Privacy Policy from time to time. Any changes will be posted on this
            page with an updated &quot;Last updated&quot; date. We encourage you to review this page
            periodically. Your continued use of the Service after any changes constitutes acceptance
            of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data
            practices, please contact us through the channels available on our website.
          </p>
        </section>
      </div>
    </div>
  );
}

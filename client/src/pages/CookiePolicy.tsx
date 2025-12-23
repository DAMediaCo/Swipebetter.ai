import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. How SwipeBetter.ai Uses Cookies</h2>
            <p>
              SwipeBetter.ai uses cookies to enhance your experience, maintain your session, and analyze how our service is used. We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device for a set period).
            </p>
            <p className="mt-2">
              Please note that SwipeBetter.ai is an AI advice tool. We do NOT guarantee matches, replies, dates, or relationship success. Our service provides suggestions only, and results depend on many factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Types of Cookies We Use</h2>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Essential Cookies</h3>
            <p>
              These cookies are necessary for the website to function properly. They enable core functionality such as security, session management, and account authentication. You cannot opt out of these cookies as the website would not function without them.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Session Cookie:</strong> Maintains your login session and keeps you authenticated</li>
              <li><strong>Security Cookie:</strong> Helps protect against fraudulent activity</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Functional Cookies</h3>
            <p>
              These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Theme Preference:</strong> Remembers your light/dark mode preference</li>
              <li><strong>User Preferences:</strong> Stores your selected options and settings</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Analytics Cookies</h3>
            <p>
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Google Analytics:</strong> Tracks page views, user behavior, and traffic sources</li>
              <li><strong>Performance Cookies:</strong> Help us measure and improve site performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages. We use third-party services for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Payment Processing (Stripe):</strong> To securely process payments</li>
              <li><strong>Analytics (Google Analytics):</strong> To understand user behavior</li>
            </ul>
            <p className="mt-2">
              These third parties have their own cookie policies, and we recommend reviewing them for more information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Managing Cookies</h2>
            <p>
              You can control and manage cookies in several ways:
            </p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Browser Settings</h3>
            <p>
              Most web browsers allow you to control cookies through their settings. You can typically find these options in your browser's "Settings," "Preferences," or "Privacy" menu. You can:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>View what cookies are stored and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies from specific sites</li>
              <li>Block all cookies from being set</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Consequences of Disabling Cookies</h3>
            <p>
              If you disable or decline cookies, some features of SwipeBetter.ai may not function properly. For example, you may not be able to stay logged in, and your preferences may not be saved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Please revisit this page periodically to stay informed about our use of cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> support@swipebetter.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

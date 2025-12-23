import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              SwipeBetter.ai is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered dating profile improvement service.
            </p>
            <p className="mt-2">
              SwipeBetter.ai is an AI advice tool designed to help you improve your dating profile and messages. We do NOT guarantee matches, replies, dates, or relationship success. Results may vary and depend on many factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <p>We collect the following types of information:</p>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email address</li>
              <li>First name (optional)</li>
              <li>Password (stored securely using encryption)</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Content You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Screenshots of dating profiles and conversations</li>
              <li>Profile text and bio information</li>
              <li>Messages and conversation content</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Usage data (pages visited, features used, time spent)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide and maintain our service</li>
              <li>Process your uploaded content through AI analysis</li>
              <li>Generate personalized suggestions and advice</li>
              <li>Process payments and manage subscriptions</li>
              <li>Communicate with you about your account and service updates</li>
              <li>Improve and optimize our service</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Third-Party Services</h2>
            <p>We use the following third-party services that may collect and process your data:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Stripe:</strong> For payment processing and subscription management</li>
              <li><strong>AI Providers:</strong> For processing and analyzing your content to generate suggestions</li>
              <li><strong>Analytics Services:</strong> For understanding how users interact with our service</li>
            </ul>
            <p className="mt-2">
              These third parties have their own privacy policies and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Cookies and Tracking</h2>
            <p>
              SwipeBetter.ai uses cookies and similar tracking technologies to enhance your experience. For detailed information about the cookies we use, please see our <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Retention</h2>
            <p>
              We retain your account information for as long as your account is active or as needed to provide you with our services. Uploaded screenshots and content are processed in memory for AI analysis and are not permanently stored on our servers. Analysis results may be retained to allow you to access your history.
            </p>
            <p className="mt-2">
              If you delete your account, we will delete or anonymize your personal information within 30 days, except where we are required by law to retain certain data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Opt-out:</strong> Opt out of marketing communications</li>
              <li><strong>Data Portability:</strong> Request your data in a portable format</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us at hello@swipebetter.ai.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Children's Privacy</h2>
            <p>
              SwipeBetter.ai is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected data from a child under 18, we will take steps to delete that information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the effective date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> hello@swipebetter.ai
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

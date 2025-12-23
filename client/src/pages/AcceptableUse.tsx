import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AcceptableUse() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Acceptable Use Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Purpose</h2>
            <p>
              This Acceptable Use Policy outlines the rules and guidelines for using SwipeBetter.ai. By using our service, you agree to comply with this policy. Violation of this policy may result in suspension or termination of your account.
            </p>
            <p className="mt-2">
              SwipeBetter.ai is an AI advice tool designed to help you improve your dating profile and messages. We do NOT guarantee matches, replies, dates, or relationship success. Our service provides suggestions for educational and informational purposes only, and outcomes depend on many factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Prohibited Conduct</h2>
            <p>
              When using SwipeBetter.ai, you must NOT engage in any of the following activities:
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">Harassment and Harmful Behavior</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harass, bully, intimidate, or threaten other individuals</li>
              <li>Upload or share content that promotes violence, hatred, or discrimination</li>
              <li>Use our suggestions to manipulate, deceive, or harm others</li>
              <li>Engage in stalking or unwanted contact with other people</li>
              <li>Create or share content that is sexually explicit, obscene, or offensive</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Illegal Activities</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any unlawful purpose</li>
              <li>Violate any applicable laws, regulations, or third-party rights</li>
              <li>Facilitate or promote illegal activities</li>
              <li>Upload content depicting minors or any illegal material</li>
              <li>Use the service in connection with fraud or scams</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">System Abuse and Technical Violations</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Scrape, crawl, or use automated systems to access the service without permission</li>
              <li>Attempt to reverse engineer, decompile, or hack our systems</li>
              <li>Interfere with or disrupt the service or its infrastructure</li>
              <li>Attempt to gain unauthorized access to accounts or data</li>
              <li>Distribute malware, viruses, or other harmful software</li>
              <li>Bypass any security measures or access controls</li>
              <li>Overwhelm or abuse our API or systems with excessive requests</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Impersonation and Misrepresentation</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Impersonate another person or entity</li>
              <li>Create fake accounts or misrepresent your identity</li>
              <li>Falsely claim affiliation with SwipeBetter.ai</li>
              <li>Use our suggestions to misrepresent yourself on dating platforms</li>
              <li>Upload content you do not have the right to share</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Misuse of Advice and Suggestions</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use AI-generated suggestions to deceive or mislead potential matches</li>
              <li>Present AI-generated content as genuine when it fundamentally misrepresents who you are</li>
              <li>Use suggestions for purposes other than improving your own dating profile or messages</li>
              <li>Commercially resell or redistribute suggestions without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Content Standards</h2>
            <p>
              Any content you upload to SwipeBetter.ai must:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Be your own content or content you have permission to share</li>
              <li>Not contain personally identifiable information of others without consent</li>
              <li>Not violate any intellectual property rights</li>
              <li>Not contain malicious code or harmful elements</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Reporting Violations</h2>
            <p>
              If you become aware of any violations of this Acceptable Use Policy, please report them to us at support@swipebetter.ai. We take all reports seriously and will investigate appropriately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Consequences of Violations</h2>
            <p>
              Violations of this Acceptable Use Policy may result in:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Warning or notification of the violation</li>
              <li>Temporary suspension of your account</li>
              <li>Permanent termination of your account</li>
              <li>Removal of content that violates this policy</li>
              <li>Legal action where appropriate</li>
            </ul>
            <p className="mt-2">
              We reserve the right to take any action we deem necessary to enforce this policy, at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Changes to This Policy</h2>
            <p>
              We may update this Acceptable Use Policy from time to time. Continued use of the service after changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about this Acceptable Use Policy, please contact us at:
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

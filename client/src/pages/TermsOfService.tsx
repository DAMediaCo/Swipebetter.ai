import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Service Description</h2>
            <p>
              SwipeBetter.ai is an AI-powered web application that helps users improve their dating app profiles and generate message replies. Users can upload screenshots of their dating profiles and conversations to receive AI-generated suggestions for bios, photos, and conversation starters.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Eligibility</h2>
            <p>
              You must be at least 18 years of age to use SwipeBetter.ai. By using our service, you represent and warrant that you are 18 years of age or older and have the legal capacity to enter into these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. User Responsibilities</h2>
            <p>By using SwipeBetter.ai, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Provide accurate information when creating your account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service only for lawful purposes</li>
              <li>Only upload content that you have the right to share</li>
              <li>Not share advice or results in ways that could harm others</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Prohibited Activities</h2>
            <p>You may not use SwipeBetter.ai to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Harass, abuse, or harm other individuals</li>
              <li>Upload illegal, offensive, or harmful content</li>
              <li>Attempt to reverse engineer, scrape, or manipulate the service</li>
              <li>Impersonate others or misrepresent your identity</li>
              <li>Violate the intellectual property rights of others</li>
              <li>Distribute malware or engage in any form of hacking</li>
              <li>Use automated systems to access the service without permission</li>
              <li>Resell, redistribute, or commercially exploit the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of SwipeBetter.ai, including but not limited to text, graphics, logos, and software, are owned by SwipeBetter.ai and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="mt-2">
              You retain ownership of any content you upload to the service. By uploading content, you grant SwipeBetter.ai a limited, non-exclusive license to process that content solely for the purpose of providing the service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. AI Limitations and Disclaimer</h2>
            <p>
              SwipeBetter.ai uses artificial intelligence to generate suggestions and advice. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>AI-generated content is provided for informational and educational purposes only</li>
              <li>AI suggestions may not be accurate, appropriate, or suitable for your specific situation</li>
              <li>You are solely responsible for reviewing and deciding whether to use any AI-generated suggestions</li>
              <li>SwipeBetter.ai does not provide professional dating, legal, or psychological advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. No Guarantees</h2>
            <p>
              SwipeBetter.ai does NOT guarantee matches, replies, dates, or relationship success. The effectiveness of any advice or suggestions depends on many factors beyond our control. Results may vary significantly between users, and we make no promises regarding specific outcomes from using our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Account Suspension and Termination</h2>
            <p>
              SwipeBetter.ai reserves the right to suspend or terminate your account at any time, with or without notice, for any reason, including but not limited to violation of these Terms of Service, suspected fraudulent activity, or conduct that we determine to be harmful to other users or the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SwipeBetter.ai and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses, resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless SwipeBetter.ai and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in connection with your use of the service, your violation of these Terms, or your violation of any rights of another party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Governing Law</h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the United States. Any disputes arising from these Terms or your use of the service shall be resolved in the appropriate courts within the United States.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
            <p>
              SwipeBetter.ai reserves the right to modify these Terms of Service at any time. We will notify users of significant changes by posting a notice on our website. Your continued use of the service after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
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

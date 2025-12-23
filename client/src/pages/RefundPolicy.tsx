import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Refund and Cancellation Policy</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Digital Product Policy</h2>
            <p>
              SwipeBetter.ai provides digital services in the form of AI-powered dating profile analysis and message reply suggestions. Due to the immediate delivery nature of our digital services, all sales are generally final once the service has been rendered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. One-Time Purchase Refunds</h2>
            <p>
              For one-time purchases (such as individual analysis credits):
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Refunds are generally not available after an analysis has been performed</li>
              <li>If you experience a technical issue that prevents you from receiving your analysis results, please contact us within 7 days of purchase</li>
              <li>We may issue refunds or credits at our discretion for documented technical failures</li>
              <li>Unused credits do not expire and are not refundable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Subscription Cancellation</h2>
            <p>
              For subscription plans (Monthly and Annual):
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>You may cancel your subscription at any time through your account settings or by contacting support</li>
              <li>Upon cancellation, you will retain access to your subscription benefits until the end of your current billing period</li>
              <li>No partial refunds are provided for unused portions of your subscription period</li>
              <li>Your subscription will not automatically renew after cancellation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Annual Subscription Refunds</h2>
            <p>
              For annual subscriptions:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>If you cancel within the first 14 days and have not used the service, you may be eligible for a full refund</li>
              <li>After 14 days or after using the service, annual subscriptions are non-refundable</li>
              <li>You will continue to have access until the end of your annual subscription period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. No Refunds After Service Delivery</h2>
            <p>
              Once an AI analysis has been performed and results have been delivered, we cannot offer refunds based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Dissatisfaction with the suggestions provided</li>
              <li>Expectations that were not met regarding dating outcomes</li>
              <li>Subjective opinions about the quality of advice</li>
              <li>Changes of mind after receiving the service</li>
            </ul>
            <p className="mt-2">
              SwipeBetter.ai does not guarantee matches, replies, dates, or relationship success. Our service provides suggestions and advice only.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. How to Request a Cancellation or Refund</h2>
            <p>
              To cancel your subscription:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>Log into your SwipeBetter.ai account</li>
              <li>Navigate to your account or subscription settings</li>
              <li>Click "Manage Subscription" to access the Stripe customer portal</li>
              <li>Follow the prompts to cancel your subscription</li>
            </ol>
            
            <p className="mt-4">
              To request a refund (for eligible cases):
            </p>
            <ol className="list-decimal pl-6 space-y-2 mt-2">
              <li>Email us at support@swipebetter.ai</li>
              <li>Include your account email address</li>
              <li>Describe the issue you experienced</li>
              <li>Include any relevant screenshots or details</li>
            </ol>
            <p className="mt-2">
              We aim to respond to all refund requests within 3 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Chargebacks</h2>
            <p>
              If you believe there has been an error with your payment, please contact us at support@swipebetter.ai before initiating a chargeback with your bank or credit card company. We are committed to resolving any billing issues promptly and fairly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about this Refund and Cancellation Policy, please contact us at:
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

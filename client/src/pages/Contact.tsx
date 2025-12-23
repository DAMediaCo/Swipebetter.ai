import { Link } from "wouter";
import { ArrowLeft, Mail, Clock, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">We are here to help with any questions or concerns</p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Support</h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    For all inquiries, feedback, and support requests
                  </p>
                  <a 
                    href="mailto:hello@swipebetter.ai" 
                    className="text-primary hover:underline font-medium"
                    data-testid="link-email"
                  >
                    hello@swipebetter.ai
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Response Time</h3>
                  <p className="text-muted-foreground text-sm">
                    We aim to respond to all inquiries within 1 to 2 business days. During busy periods, response times may be slightly longer.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">About SwipeBetter.ai</h2>
            <p>
              SwipeBetter.ai is an AI-powered service that helps users improve their dating app profiles and generate better message replies. We are committed to providing helpful, actionable suggestions to enhance your online dating experience.
            </p>
            <p className="mt-2">
              Please note that SwipeBetter.ai is an AI advice tool designed for educational and informational purposes. We do NOT guarantee matches, replies, dates, or relationship success. Our service provides suggestions only, and outcomes depend on many factors beyond our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">How Can We Help?</h2>
            <p>Feel free to reach out to us for:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Questions about our service</li>
              <li>Technical support and troubleshooting</li>
              <li>Billing and subscription inquiries</li>
              <li>Feedback and suggestions</li>
              <li>Privacy or data-related requests</li>
              <li>Partnership or business inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">Before Contacting Us</h2>
            <p>
              For faster resolution, please include the following information in your message when applicable:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>The email address associated with your account</li>
              <li>A clear description of your question or issue</li>
              <li>Any relevant screenshots or error messages</li>
              <li>Steps you have already taken to resolve the issue</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">Legal Policies</h2>
            <p>
              For information about how we operate and protect your data, please review our legal policies:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><Link href="/terms" className="text-primary hover:underline">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link></li>
              <li><Link href="/refund-policy" className="text-primary hover:underline">Refund and Cancellation Policy</Link></li>
              <li><Link href="/disclaimer" className="text-primary hover:underline">Disclaimer</Link></li>
              <li><Link href="/acceptable-use" className="text-primary hover:underline">Acceptable Use Policy</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

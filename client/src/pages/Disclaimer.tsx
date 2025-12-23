import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
        <p className="text-muted-foreground mb-8">Effective Date: January 1, 2025</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Educational and Informational Use Only</h2>
            <p>
              The content, suggestions, and advice provided by SwipeBetter.ai are for educational and informational purposes only. Our AI-powered service is designed to help you think about and improve your dating profile and messaging approach, but it should not be relied upon as the sole basis for any dating, relationship, or personal decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Not Professional Advice</h2>
            <p>
              SwipeBetter.ai does NOT provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Professional dating or relationship coaching:</strong> Our suggestions are AI-generated and not created by licensed relationship professionals</li>
              <li><strong>Legal advice:</strong> We do not provide legal guidance regarding dating, relationships, or any other matters</li>
              <li><strong>Psychological or mental health advice:</strong> Our service is not a substitute for professional counseling or therapy</li>
              <li><strong>Medical advice:</strong> We do not provide health or wellness recommendations</li>
            </ul>
            <p className="mt-2">
              If you are experiencing relationship difficulties, emotional distress, or other personal challenges, we encourage you to seek guidance from qualified professionals.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. No Guaranteed Outcomes</h2>
            <p>
              SwipeBetter.ai makes no guarantees, representations, or warranties regarding the outcomes you may experience from using our service. Specifically, we do NOT guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>More matches on dating apps</li>
              <li>More replies to your messages</li>
              <li>Dates or in-person meetings</li>
              <li>Relationship success or finding a partner</li>
              <li>Improved attractiveness or desirability</li>
              <li>Any specific results from implementing our suggestions</li>
            </ul>
            <p className="mt-2">
              Dating success depends on many factors beyond our control, including but not limited to your location, the dating platforms you use, timing, personal compatibility, and numerous other variables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. AI Limitations</h2>
            <p>
              SwipeBetter.ai uses artificial intelligence to analyze content and generate suggestions. You should be aware that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>AI-generated content may contain errors or inaccuracies</li>
              <li>AI may not fully understand nuance, context, or cultural differences</li>
              <li>Suggestions may not be appropriate for your specific situation</li>
              <li>AI technology has inherent limitations and is continuously evolving</li>
            </ul>
            <p className="mt-2">
              You are solely responsible for reviewing, evaluating, and deciding whether to use any suggestions provided by our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. User Assumes All Risk</h2>
            <p>
              By using SwipeBetter.ai, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>You use our service and implement any suggestions at your own risk</li>
              <li>You are responsible for your own actions and decisions in dating and relationships</li>
              <li>SwipeBetter.ai is not liable for any outcomes resulting from your use of our suggestions</li>
              <li>You should use your own judgment and discretion when applying any advice</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Third-Party Content</h2>
            <p>
              Our service may reference or interact with third-party dating platforms. SwipeBetter.ai is not affiliated with, endorsed by, or sponsored by any dating app or platform unless explicitly stated. The use of screenshots or content from dating apps is subject to those platforms' terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Accuracy of Information</h2>
            <p>
              While we strive to provide helpful and accurate suggestions, we make no warranties about the completeness, reliability, or accuracy of any information or advice provided. Any reliance you place on such information is strictly at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about this Disclaimer, please contact us at:
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

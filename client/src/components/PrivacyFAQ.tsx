import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Will this work for Hinge, Tinder, and Bumble?",
    answer: "Yes. SwipeBetter works with all major dating apps including Hinge, Tinder, Bumble, and others.",
  },
  {
    question: "Do you store my screenshots or conversations?",
    answer: "No. Screenshots and conversations are processed to generate feedback, then deleted. We do not permanently store your uploads.",
  },
  {
    question: "How long does it take?",
    answer: "Most results are generated in under a minute.",
  },
  {
    question: "Do I need to log in to my dating app?",
    answer: "No. We never ask for your dating app login or account access.",
  },
];

export function PrivacyFAQ() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Common Questions</h3>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger 
              className="text-left"
              data-testid={`faq-trigger-${index}`}
            >
              {faq.question}
            </AccordionTrigger>
            <AccordionContent data-testid={`faq-content-${index}`}>
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

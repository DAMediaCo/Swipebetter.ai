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
    question: "Does this work for Grindr and ENM/poly relationships?",
    answer: "Yes. SwipeBetter works with Grindr just like it does with Hinge, Tinder, and Bumble. It also understands ethical non-monogamy (ENM) profiles and can generate suggestions that respect poly dynamics.",
  },
  {
    question: "Do you store my screenshots or conversations?",
    answer: "Uploaded screenshots are sent for analysis and are not saved in your SwipeBetter history. We save the generated advice and a short conversation summary so you can reopen past results. Delete your account at any time to remove that saved history.",
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

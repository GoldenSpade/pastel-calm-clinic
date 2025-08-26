import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      question: "How do I know if therapy is right for me?",
      answer: "Therapy can benefit anyone looking to improve their mental health, work through challenges, or gain personal insight. If you're experiencing persistent stress, anxiety, depression, relationship difficulties, or simply want to better understand yourself, therapy can be very helpful. I offer free 15-minute consultations to discuss your needs."
    },
    {
      question: "What should I expect in my first session?",
      answer: "Your first session is about getting to know each other and understanding your goals. We'll discuss what brought you to therapy, your background, current challenges, and what you hope to achieve. This session helps me understand how best to support you, and gives you a chance to see if we're a good fit."
    },
    {
      question: "How long does therapy typically take?",
      answer: "The duration of therapy varies greatly depending on your individual needs and goals. Some people benefit from short-term focused work (8-12 sessions), while others prefer longer-term support. We'll regularly check in about your progress and adjust our timeline as needed."
    },
    {
      question: "Is everything I share in therapy confidential?",
      answer: "Yes, confidentiality is a cornerstone of therapy. What you share is protected by law and professional ethics. There are only a few exceptions, such as if there's imminent danger to yourself or others, suspected child abuse, or if records are subpoenaed by a court. I'll always discuss these limits with you."
    },
    {
      question: "Do you accept insurance?",
      answer: "Yes, I accept most major insurance plans. I recommend calling your insurance company to verify your mental health benefits, including copays and deductibles. I can also provide documentation for potential reimbursement if you have out-of-network benefits."
    },
    {
      question: "Can I contact you between sessions?",
      answer: "For non-urgent matters, you can leave a voicemail or send a secure message through my patient portal, and I'll respond within 24-48 hours. For crisis situations, please call 911, go to your nearest emergency room, or call the National Suicide Prevention Lifeline at 988."
    },
    {
      question: "What therapy approaches do you use?",
      answer: "I use an integrative approach tailored to your specific needs. This may include Cognitive Behavioral Therapy (CBT), Dialectical Behavior Therapy (DBT), mindfulness techniques, trauma-informed care, and solution-focused approaches. We'll work together to find what works best for you."
    },
    {
      question: "How do I schedule an appointment?",
      answer: "You can schedule an appointment by calling my office, sending a message through my secure patient portal, or using the contact form below. I typically respond to new client inquiries within 24 hours and can often schedule initial appointments within 1-2 weeks."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Common questions about therapy and my practice. Don't see your question here? 
            Feel free to reach out with any other concerns.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-sage/20 rounded-xl px-6 shadow-soft"
              >
                <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="text-center mt-12">
          <div className="bg-card p-8 rounded-2xl shadow-soft max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-4">
              Still Have Questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              I'm happy to address any other questions or concerns you may have about starting therapy.
            </p>
            <button 
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Contact Me
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
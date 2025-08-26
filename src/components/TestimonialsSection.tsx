import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria S.",
      role: "Individual Therapy Client",
      text: "Dr. Mitchell created such a safe and welcoming space for me to heal. Her compassionate approach helped me work through anxiety and find inner peace I didn't know was possible.",
      rating: 5
    },
    {
      name: "James & Lisa K.",
      role: "Couples Therapy",
      text: "Our marriage was struggling, but Dr. Mitchell's guidance helped us rebuild trust and communication. We're stronger now than we've ever been.",
      rating: 5
    },
    {
      name: "Anonymous",
      role: "Group Therapy Participant",
      text: "The group sessions provided me with a sense of community and understanding. It's amazing how healing happens when you realize you're not alone.",
      rating: 5
    },
    {
      name: "Robert M.",
      role: "Crisis Support Client",
      text: "During my darkest moments, Dr. Mitchell was there with immediate support. Her crisis intervention literally saved my life.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
            Client Testimonials
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real stories from clients who have found healing and growth through therapy. 
            Names have been changed to protect privacy.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-8 bg-gradient-card shadow-soft border-sage/20 hover:shadow-card transition-shadow"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-accent fill-current" />
                ))}
              </div>
              
              <blockquote className="text-foreground text-lg italic mb-6 leading-relaxed">
                "{testimonial.text}"
              </blockquote>
              
              <div className="border-t border-sage/20 pt-4">
                <cite className="font-semibold text-primary not-italic">
                  {testimonial.name}
                </cite>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="bg-sage/20 p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-4">
              Ready to Begin Your Healing Journey?
            </h3>
            <p className="text-muted-foreground mb-6">
              Take the first step towards mental wellness. Every journey begins with a single step.
            </p>
            <div className="flex justify-center">
              <button 
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Schedule Your First Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
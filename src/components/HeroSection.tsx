import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-therapy.jpg";
import { MessageCircle, Instagram, Calendar } from "lucide-react";

const HeroSection = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16">
      <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
      
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8 animate-fade-in">
          <h1 className="text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
            Compassionate
            <span className="text-primary block">Psychology Care</span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            Professional mental health services in a warm, supportive environment. 
            I'm here to help you navigate life's challenges and discover your inner strength.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={scrollToContact}
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Appointment
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <MessageCircle className="mr-2 h-5 w-5" />
                Telegram
              </Button>
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Instagram className="mr-2 h-5 w-5" />
                Instagram
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-8 pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Clients Helped</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10+</div>
              <div className="text-sm text-muted-foreground">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Crisis Support</div>
            </div>
          </div>
        </div>
        
        <div className="relative lg:h-[600px] animate-float">
          <img 
            src={heroImage} 
            alt="Peaceful therapy office with comfortable seating and calming atmosphere" 
            className="w-full h-full object-cover rounded-3xl shadow-card"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-3xl"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
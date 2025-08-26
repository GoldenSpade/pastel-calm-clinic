import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Users, Heart, Clock, Calendar } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      icon: <User className="h-8 w-8" />,
      title: "Individual Therapy",
      description: "One-on-one sessions focused on your personal growth and healing journey.",
      duration: "50 minutes",
      price: "$150",
      bgColor: "bg-lavender/20",
      borderColor: "border-lavender/40"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Couples Counseling",
      description: "Relationship therapy to strengthen communication and rebuild connection.",
      duration: "75 minutes", 
      price: "$200",
      bgColor: "bg-peach/20",
      borderColor: "border-peach/40"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Group Therapy",
      description: "Supportive group sessions for shared experiences and peer connection.",
      duration: "90 minutes",
      price: "$80",
      bgColor: "bg-sage/20", 
      borderColor: "border-sage/40"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "Crisis Support",
      description: "Emergency sessions and immediate support during difficult times.",
      duration: "Variable",
      price: "$100",
      bgColor: "bg-accent/20",
      borderColor: "border-accent/40"
    }
  ];

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
            Therapy Services & Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive mental health services tailored to your unique needs. 
            All sessions are conducted in a confidential, supportive environment.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`p-8 ${service.bgColor} border ${service.borderColor} hover:shadow-card transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="text-primary mb-4">
                {service.icon}
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              
              <p className="text-muted-foreground mb-6">
                {service.description}
              </p>
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-medium text-foreground">{service.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="text-2xl font-bold text-primary">{service.price}</span>
                </div>
              </div>
              
              <Button 
                onClick={scrollToContact}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book Session
              </Button>
            </Card>
          ))}
        </div>
        
        <div className="text-center bg-card p-8 rounded-2xl shadow-soft max-w-4xl mx-auto">
          <h3 className="text-2xl font-serif font-semibold text-foreground mb-4">
            Insurance & Payment Options
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-primary font-semibold mb-2">Insurance Accepted</div>
              <p className="text-sm text-muted-foreground">Most major insurance plans accepted. Contact us to verify coverage.</p>
            </div>
            <div>
              <div className="text-primary font-semibold mb-2">Sliding Scale</div>
              <p className="text-sm text-muted-foreground">Reduced rates available based on financial need and circumstances.</p>
            </div>
            <div>
              <div className="text-primary font-semibold mb-2">Flexible Payment</div>
              <p className="text-sm text-muted-foreground">Credit cards, HSA/FSA accounts, and payment plans accepted.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
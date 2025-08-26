import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Instagram,
  Calendar,
  Shield
} from "lucide-react";

const ContactSection = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Thank you for your message! I'll get back to you within 24 hours.");
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
            Ready to Take the First Step?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Reaching out for support takes courage. I'm here to help you start your healing journey 
            in a safe, confidential environment.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="p-8 bg-gradient-card shadow-soft">
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-6">
                Get in Touch
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Phone</div>
                    <div className="text-muted-foreground">(555) 123-4567</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Email</div>
                    <div className="text-muted-foreground">dr.sarah@therapycare.com</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Office</div>
                    <div className="text-muted-foreground">123 Wellness Ave, Suite 200<br />Peaceful City, PC 12345</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Hours</div>
                    <div className="text-muted-foreground">
                      Mon-Fri: 9:00 AM - 7:00 PM<br />
                      Sat: 10:00 AM - 4:00 PM<br />
                      Emergency: 24/7
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Social Media & Booking */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Connect With Me</h3>
              
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Telegram Channel
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  <Instagram className="mr-2 h-5 w-5" />
                  Instagram
                </Button>
              </div>
              
              <Button 
                size="lg" 
                className="w-full bg-sage hover:bg-sage/90 text-sage-foreground"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Online Appointment
              </Button>
            </div>
            
            {/* Privacy Notice */}
            <Card className="p-6 bg-lavender/20 border-lavender/40">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary mt-1" />
                <div>
                  <div className="font-medium text-foreground mb-1">Your Privacy is Protected</div>
                  <p className="text-sm text-muted-foreground">
                    All communication is confidential and secure. I follow HIPAA guidelines 
                    to protect your personal health information.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Contact Form */}
          <Card className="p-8 bg-gradient-card shadow-soft">
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-6">
              Send a Message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    First Name *
                  </label>
                  <Input 
                    required 
                    className="bg-background border-border focus:border-primary"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Name *
                  </label>
                  <Input 
                    required 
                    className="bg-background border-border focus:border-primary"
                    placeholder="Your last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address *
                </label>
                <Input 
                  type="email" 
                  required 
                  className="bg-background border-border focus:border-primary"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <Input 
                  type="tel" 
                  className="bg-background border-border focus:border-primary"
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preferred Contact Method
                </label>
                <select className="w-full p-3 rounded-md border border-border bg-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>Email</option>
                  <option>Phone</option>
                  <option>Text</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  How can I help you? *
                </label>
                <Textarea 
                  required 
                  rows={5}
                  className="bg-background border-border focus:border-primary resize-none"
                  placeholder="Please share what brings you to therapy or any questions you have..."
                />
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> This form is for scheduling and general inquiries only. 
                  Please do not share sensitive personal information. For crisis situations, 
                  call 911 or the National Suicide Prevention Lifeline at 988.
                </p>
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90"
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>
        
        <div className="text-center mt-16">
          <div className="bg-gradient-hero/10 p-8 rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-4">
              Crisis Resources
            </h3>
            <p className="text-muted-foreground mb-6">
              If you're experiencing a mental health emergency, please reach out immediately:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="font-semibold text-foreground">Emergency</div>
                <div className="text-primary font-bold text-xl">911</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">Crisis Hotline</div>
                <div className="text-primary font-bold text-xl">988</div>
              </div>
              <div>
                <div className="font-semibold text-foreground">Crisis Text Line</div>
                <div className="text-primary font-bold text-xl">Text HOME to 741741</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
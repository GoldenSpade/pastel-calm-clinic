import { Card } from "@/components/ui/card";
import { GraduationCap, Heart, Brain, Users } from "lucide-react";

const AboutSection = () => {
  const credentials = [
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "PhD in Clinical Psychology",
      description: "Stanford University, 2013"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Licensed Psychologist",
      description: "State Board Certified"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Specialized Training",
      description: "CBT, DBT, Trauma-Informed Care"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Group Therapy Certified",
      description: "Advanced Group Facilitation"
    }
  ];

  return (
    <section id="about" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
            About Dr. Sarah Mitchell
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            With over a decade of experience in clinical psychology, I believe in creating a safe, 
            non-judgmental space where healing and growth can flourish.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <p className="text-lg text-foreground leading-relaxed">
              My approach to therapy is deeply rooted in compassion and evidence-based practices. 
              I specialize in helping individuals navigate anxiety, depression, trauma, and relationship challenges 
              through personalized treatment plans that honor each client's unique journey.
            </p>
            
            <p className="text-lg text-foreground leading-relaxed">
              I believe that everyone has the capacity for healing and growth. My role is to provide you with 
              the tools, support, and safe space needed to unlock your inner resilience and create meaningful 
              change in your life.
            </p>
            
            <div className="bg-sage/30 p-6 rounded-xl border border-sage">
              <blockquote className="text-lg italic text-foreground">
                "Healing is not about becoming someone different, but about becoming who you truly are 
                when the layers of pain and protection are gently peeled away."
              </blockquote>
              <cite className="text-sm text-muted-foreground mt-2 block">- Dr. Sarah Mitchell</cite>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {credentials.map((credential, index) => (
              <Card key={index} className="p-6 bg-gradient-card shadow-soft border-sage/20 hover:shadow-card transition-shadow">
                <div className="text-primary mb-3">
                  {credential.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {credential.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {credential.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
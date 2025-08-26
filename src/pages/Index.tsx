import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MessageCircle, Instagram, Calendar, Clock, Package, Package2, Crown, MessageSquare, FileText, BookOpen, GraduationCap, Award, Users, Plus, User, FileSearch, Phone, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import headerLogo from "@/assets/header-logo.jpg";

const Index = () => {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-8">
      <div className="text-center space-y-10 max-w-6xl mx-auto">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <img src={headerLogo} alt="Психолог Майя Кондрук" className="w-48 h-48 rounded-full object-cover shadow-card" />
        </div>

        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">
            Психолог Майя Кондрук
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Професійна психологічна підтримка для вашого ментального здоров'я. Допомагаю знайти внутрішній спокій та гармонію.
          </p>
        </div>

        {/* Free 15-minute consultation */}
        <div className="animate-fade-in max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 backdrop-blur-sm rounded-xl p-8 transition-all duration-500 hover:shadow-lg hover:scale-[1.02] border border-primary/30 shadow-md">
            <div className="text-center space-y-6">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Безкоштовна 15‑хв консультація</h2>
              </div>
              
              <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
                Познайомимося, обговоримо ваші потреби та підберемо найкращий формат роботи саме для вас. 
                Це допоможе зрозуміти, чи підходить вам мій підхід і як ми можемо працювати разом.
              </p>
              
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-medium px-8 py-3" onClick={() => navigate("/booking?type=consultation")}>
                <Users className="mr-2 h-5 w-5" />
                Запис на знайомство
              </Button>
            </div>
          </div>
        </div>


        {/* Services Description */}
        

        {/* Pricing */}
        <div className="space-y-8 w-full">
          
          
          {/* Individual Sessions - Centered block */}
          <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="bg-gradient-premium backdrop-blur-sm rounded-xl p-8 transition-all duration-500 hover:shadow-premium hover:scale-[1.02] border border-primary/40 shadow-lg">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-4 bg-primary/25 rounded-xl shadow-lg">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-2xl text-foreground">Індивідуальні сесії</h3>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-primary/10 h-[70px]">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">60 хв</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary text-2xl">1 500 ₴</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-primary/10 h-[70px]">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">90 хв</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary text-2xl">2 000 ₴</div>
                  </div>
                </div>
              </div>
              
              {/* What's included section */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-foreground mb-4 text-center">Що включено в сесію:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">PDF-конспект після кожної сесії</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Індивідуальний підхід та конфіденційність</span>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Premium Support - Special block */}
          <div className="animate-scale-in max-w-2xl mx-auto" style={{
          animationDelay: '0.4s'
        }}>
            <div className="bg-gradient-premium border-2 border-primary/40 rounded-xl p-8 transition-all duration-500 hover:shadow-premium hover:scale-[1.02] hover:border-primary/60 shadow-[0_15px_35px_rgba(var(--primary-rgb),0.25)] relative overflow-hidden">
              {/* Highlight decoration */}
              <div className="absolute -top-2 -right-2 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/15 rounded-full blur-lg"></div>
              
              <div className="flex flex-col items-center text-center mb-10 relative z-10">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="p-4 bg-primary/25 rounded-xl shadow-lg">
                    <Crown className="h-10 w-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-2xl text-foreground">Преміум-супровід</h3>
                    <p className="text-sm text-muted-foreground font-medium mt-1">(1 місяць)</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center p-5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-primary/10 h-[70px]">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">4 сесії (60 хв)</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary text-2xl">6 000 ₴</div>
                  </div>
                </div>
                <div className="flex justify-between items-center p-5 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-primary/10 h-[70px]">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">4 сесії (90 хв)</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-primary text-2xl">8 000 ₴</div>
                  </div>
                </div>
              </div>

              {/* Improved description section */}
              <div className="mt-8 relative z-10">
                <h4 className="text-lg font-semibold text-foreground mb-4 text-center">Що включено в пакет:</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">PDF-конспект після кожної сесії</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-primary/10">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Підтримка між сесіями в месенджері</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-primary/10">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">Персональні рекомендації та вправи</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              Поширені запитання
            </h2>
          </div>
          
          <div className="w-full max-w-4xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4 w-full">
              <AccordionItem value="item-1" className="bg-card border border-primary/20 rounded-xl px-6 shadow-soft w-full">
                <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-primary [&[data-state=open]>svg]:rotate-180 flex justify-between items-center w-full min-h-[60px]">
                  <span className="text-left flex-1 pr-4">Як проходять онлайн-сесії?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4 text-left w-full">
                  Ми зустрічаємось через захищену відеоплатформу. Ви отримаєте посилання після бронювання.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-card border border-primary/20 rounded-xl px-6 shadow-soft w-full">
                <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-primary [&[data-state=open]>svg]:rotate-180 flex justify-between items-center w-full min-h-[60px]">
                  <span className="text-left flex-1 pr-4">Як здійснюється оплата?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4 text-left w-full">
                  Сесія оплачується не пізніше ніж за 24 години до консультації переказом на карту українського банку або на криптогаманець.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-card border border-primary/20 rounded-xl px-6 shadow-soft w-full">
                <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-primary [&[data-state=open]>svg]:rotate-180 flex justify-between items-center w-full min-h-[60px]">
                  <span className="text-left flex-1 pr-4">Яка політика скасування?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4 text-left w-full">
                  Скасування або перенесення менш ніж за 24 години передбачає оплату повної вартості сесії.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="bg-card border border-primary/20 rounded-xl px-6 shadow-soft w-full">
                <AccordionTrigger className="text-left text-lg font-medium text-foreground hover:text-primary [&[data-state=open]>svg]:rotate-180 flex justify-between items-center w-full min-h-[60px]">
                  <span className="text-left flex-1 pr-4">Чи є можливість особистих зустрічей?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4 text-left w-full">
                  Наразі зустрічі проводяться лише онлайн.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium w-full py-4 text-base" onClick={() => navigate("/booking")}>
            <Calendar className="mr-2 h-5 w-5" />
            Записатись на консультацію
          </Button>
          
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full py-4 text-base" onClick={() => window.open('http://t.me/maya_kondruk', '_blank')}>
            <Send className="mr-2 h-5 w-5" />
            Телеграм канал
          </Button>
          
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full py-4 text-base" onClick={() => window.open('https://www.instagram.com/maya_kondruk', '_blank')}>
            <Instagram className="mr-2 h-5 w-5" />
            Інстаграм
          </Button>
        </div>
      </div>
    </div>;
};
export default Index;
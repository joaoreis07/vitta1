import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Heart,
  Dumbbell,
  Apple,
  Activity,
  Users,
  Sparkles,
  MessageCircle,
  Instagram,
  Mail,
  MapPin,
  Check,
  Star,
  TrendingUp,
  Award,
  Clock,
  Target,
  Lock,
  Wallet
} from 'lucide-react';
import { Button } from './components/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/Card';
import {
  ADDRESS_LINE1,
  ADDRESS_LINE2,
  ADDRESS_NOTE,
  EMAIL,
  INSTAGRAM_URL,
  LOCATION_SHORT,
  PHONE_DISPLAY,
  WHATSAPP_DEFAULT_MESSAGE,
  WHATSAPP_NUMBER,
} from './lib/contact';
import naraHero from '../assets/nara-hero.png';
import naraSobre from '../assets/nara-sobre.png';

export default function App() {
  const whatsappNumber = WHATSAPP_NUMBER;
  const whatsappMessage = WHATSAPP_DEFAULT_MESSAGE;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
  };

  const handleAgendar = () => {
    window.location.hash = '#/agendar';
    window.scrollTo(0, 0);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* SEÇÃO 1 - HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Transforme sua alimentação e conquiste mais saúde
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Atendimento nutricional personalizado para ajudar você a alcançar seus objetivos de forma saudável e sustentável.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" onClick={handleAgendar} className="group">
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Agendar Consulta
                </Button>
                <Button size="lg" variant="secondary" onClick={handleWhatsApp}>
                  Falar no WhatsApp
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-8 border-t border-border">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">+300</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Pacientes atendidos</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">100%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Online ou presencial</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary">★ 5.0</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Avaliação média</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={naraHero}
                  alt="Nara Rossetto - Nutricionista"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Saúde em primeiro lugar</div>
                    <div className="text-sm text-muted-foreground">Resultados sustentáveis</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 - SOBRE */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">Prazer, sou <span className="whitespace-nowrap">Nara Rossetto</span></h2>
              <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={naraSobre}
                    alt="Nara Rossetto - Nutricionista"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground p-4 rounded-xl shadow-lg">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-lg text-foreground leading-relaxed">
                  Sou nutricionista e bacharel em Educação Física, pós-graduada em Nutrição Esportiva e Estética.
                  Além do acompanhamento nutricional, também ofereço treino personalizado, unindo alimentação e
                  exercício para transformar sua saúde de forma acolhedora e profissional.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground">Formação Acadêmica</div>
                      <div className="text-muted-foreground">Nutrição e Educação Física (Bacharelado)</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground">Especializações</div>
                      <div className="text-muted-foreground">Pós-graduação em Nutrição Esportiva e Estética</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-semibold text-foreground">Registros Profissionais</div>
                      <div className="text-muted-foreground">CRN-8 19896/P · CREF 038535-G/PR</div>
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground italic border-l-4 border-primary pl-4">
                  "Acredito que a alimentação saudável deve ser prazerosa e sustentável.
                  Meu objetivo é ajudar você a conquistar seus resultados respeitando sua individualidade."
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEÇÃO 3 - ÁREAS DE ATENDIMENTO */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Áreas de Atendimento</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Acompanhamento nutricional especializado para diferentes objetivos e necessidades
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: TrendingUp, title: "Emagrecimento", description: "Perda de peso saudável e sustentável com foco no seu bem-estar" },
              { icon: Dumbbell, title: "Ganho de massa muscular", description: "Plano alimentar estratégico para hipertrofia e performance" },
              { icon: Apple, title: "Reeducação alimentar", description: "Mude sua relação com a comida de forma definitiva" },
              { icon: Activity, title: "Nutrição esportiva", description: "Otimize seu desempenho atlético com nutrição adequada" },
              { icon: Heart, title: "Saúde da mulher", description: "Nutrição para as fases e necessidades do corpo feminino, com equilíbrio hormonal e bem-estar" },
              { icon: Dumbbell, title: "Treino personalizado", description: "Treinos elaborados por profissional formada em Educação Física (CREF ativo)" },
              { icon: Activity, title: "Avaliação física", description: "Realizada através da adipometria (dobras cutâneas), bioimpedância (InBody) e medidas de circunferências corporais" },
              { icon: Sparkles, title: "Qualidade de vida", description: "Mais energia, disposição e saúde no dia a dia" },
            ].map((area, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                      <area.icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{area.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{area.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 4 - COMO FUNCIONA */}
      <section className="py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Como funciona o acompanhamento</h2>
            <p className="text-xl text-muted-foreground">Um processo completo para sua transformação</p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: "01", icon: Users, title: "Avaliação inicial", description: "Conhecimento completo do seu histórico e objetivos" },
              { step: "02", icon: Target, title: "Plano personalizado", description: "Elaboração do plano alimentar adequado para você" },
              { step: "03", icon: Clock, title: "Acompanhamento contínuo", description: "Suporte regular para garantir seus resultados" },
              { step: "04", icon: TrendingUp, title: "Ajustes e evolução", description: "Adaptações conforme sua progressão" },
            ].map((item, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-center space-y-4">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <item.icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-primary">PASSO {item.step}</div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-primary/20" style={{ width: '100%', left: '60%' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 6 - DEPOIMENTOS */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">O que meus pacientes dizem</h2>
            <p className="text-xl text-muted-foreground">Avaliações reais de quem já transformou sua saúde</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                name: "Mariana Castro",
                text: "Adorei a consulta, me senti muito acolhida, você me escutou com empatia e paciência... e estou super feliz com o meu plano alimentar, que é super prazeroso de seguir e se encaixou perfeitamente bem na minha rotina e no meu paladar!",
                rating: 5
              },
              {
                name: "Fernanda Oliveira",
                text: "Apenas 30 dias e eu já me sinto tão melhor, tão mais disposta. A disposição me fez, depois de 7 anos dedicados à corrida, alcançar o tão sonhado pace sub 05. Um cardápio variado, sem complicações e personalizado. Você arrasa demais!",
                rating: 5
              },
              {
                name: "Patrícia Ramos",
                text: "Nestes 30 dias de acompanhamento nutricional, já obtive resultados que me deixaram muito feliz: reduzi 3,3% de gordura corporal e aumentei 1,3% de massa muscular. Mais do que números, esses resultados representam um novo estilo de vida.",
                rating: 5
              },
              {
                name: "Camila Duarte",
                text: "Nara como profissional é incrível, atende de uma maneira personalizada, muito atenciosa e comprometida. Me ajudou a melhorar minha alimentação sem restrições exageradas. Só agradecer o trabalho excelente, indico muito!",
                rating: 5
              },
              {
                name: "Renata Almeida",
                text: "Sempre me senti acolhida e confortável durante esse processo. Hoje estou encontrando mais equilíbrio, fazendo escolhas mais conscientes e, principalmente, fazendo as pazes com a alimentação saudável. Sou muito grata por todo o cuidado, apoio e profissionalismo.",
                rating: 5
              },
              {
                name: "Beatriz Nogueira",
                text: "Minha nutri maravilhosa, nunca imaginei que seria tão fácil cuidar da alimentação de forma leve e equilibrada. Você conduziu tudo de um jeito que se encaixou perfeitamente na minha rotina corrida, sem restrições exageradas e de forma muito natural.",
                rating: 5
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-foreground italic">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <div
                          className="font-semibold text-foreground blur-[5px] select-none"
                          aria-hidden="true"
                        >
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">Paciente</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 7 - DIFERENCIAIS */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div {...fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Por que escolher meu acompanhamento?</h2>
            <p className="text-xl text-muted-foreground">Diferenciais que fazem a diferença nos seus resultados</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Heart, title: "Atendimento humanizado", description: "Acolhimento e empatia em todas as etapas do processo" },
              { icon: Target, title: "Plano 100% personalizado", description: "Estratégia única baseada nas suas necessidades e objetivos" },
              { icon: MessageCircle, title: "Suporte contínuo", description: "Acompanhamento próximo via WhatsApp durante todo o processo" },
              { icon: Sparkles, title: "Estratégias práticas", description: "Orientações aplicáveis à sua rotina real" },
              { icon: Activity, title: "Consultas flexíveis", description: `Atendimento online e presencial em ${LOCATION_SHORT}` },
              { icon: Award, title: "Resultados comprovados", description: "Mais de 300 pacientes transformados" },
            ].map((differential, index) => (
              <motion.div
                key={index}
                {...fadeInUp}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-center space-y-4 p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                    <differential.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{differential.title}</h3>
                  <p className="text-muted-foreground">{differential.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 8 - CHAMADA FINAL */}
      <section className="py-32 bg-gradient-to-br from-primary via-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            {...fadeInUp}
            className="max-w-3xl mx-auto text-center space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Comece sua transformação hoje
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Agende sua consulta e dê o primeiro passo para uma vida mais saudável.
              Vamos juntos nessa jornada de transformação!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                onClick={handleWhatsApp}
                className="bg-white text-primary hover:bg-white/90 shadow-2xl text-lg h-16 px-10 animate-pulse"
              >
                <MessageCircle className="w-6 h-6" />
                Agendar pelo WhatsApp
              </Button>
            </div>
            <div className="pt-8 flex items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Resposta rápida</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>Sem compromisso</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">Nara Rossetto</h3>
              <p className="text-muted-foreground">
                Transformando vidas através da alimentação saudável e sustentável.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contato</h4>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>{PHONE_DISPLAY}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{EMAIL}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Localização</h4>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>{ADDRESS_LINE1}<br />{ADDRESS_LINE2}<br />{ADDRESS_NOTE}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Redes Sociais</h4>
              <div className="flex gap-4">
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2026 Nara Rossetto. Todos os direitos reservados. CRN-8 19896/P · CREF 038535-G/PR</p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href="#/admin"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Lock className="w-4 h-4" />
                Área da Nutricionista
              </a>
              <a
                href="#/financeiro"
                className="inline-flex items-center gap-2 px-6 h-12 rounded-lg border-2 border-border text-foreground font-medium hover:border-primary hover:text-primary transition-colors"
              >
                <Wallet className="w-4 h-4" />
                Área Financeira
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
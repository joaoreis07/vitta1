import { motion } from 'motion/react';
import { Instagram, Mail, MapPin, MessageCircle } from 'lucide-react';
import { BookingSection } from './components/BookingSection';
import {
  EMAIL,
  INSTAGRAM_URL,
  LOCATION_SHORT,
  WHATSAPP_NUMBER,
} from './lib/contact';

export default function BookingPage() {
  const whatsappNumber = WHATSAPP_NUMBER;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Cabeçalho */}
      <header className="bg-gradient-to-br from-primary/5 via-background to-accent/10 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Nara Rossetto</h1>
            <p className="text-lg text-muted-foreground">
              Nutricionista · Pós-graduada em Nutrição Esportiva e Estética
            </p>
            <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              Atendimento online e presencial em {LOCATION_SHORT}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Agendamento */}
      <main className="flex-1">
        <BookingSection />
      </main>

      {/* Rodapé */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col items-center gap-4">
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
          <p className="text-sm text-muted-foreground text-center">
            &copy; 2026 Nara Rossetto. Todos os direitos reservados. CRN-8 19896/P · CREF 038535-G/PR
          </p>
        </div>
      </footer>
    </div>
  );
}

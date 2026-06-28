import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, CheckCircle2, Clock, Loader2, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';
import { Calendar } from './Calendar';
import {
  ScheduleData,
  bookAppointment,
  dayHasFreeSlots,
  fetchPublicData,
  formatDateBR,
  formatPriceBR,
  getAvailableTimes,
} from '../lib/scheduling';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const inputClass =
  'w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';

export function BookingSection() {
  const [data, setData] = useState<ScheduleData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', whatsapp: '', email: '', objective: '' });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ date: string; time: string; service: string; price: number } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setData(await fetchPublicData());
      setRefreshKey((k) => k + 1);
    } catch {
      // mantém os dados anteriores em caso de falha de rede
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Atualiza disponibilidade se os dados mudarem em outra aba (modo local)
  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refresh]);

  const services = data?.config.services ?? [];
  const selectedService = services.find((s) => s.id === selectedServiceId) ?? null;
  const availableTimes = data && selectedDate ? getAvailableTimes(data, selectedDate) : [];

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setError(null);
  };

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const formValid =
    form.name.trim().length >= 3 &&
    form.whatsapp.replace(/\D/g, '').length >= 10 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.objective.trim().length > 0;

  const canConfirm =
    formValid && selectedDate !== null && selectedTime !== null && selectedService !== null && !submitting;

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedService) return;
    setError(null);
    setSubmitting(true);
    try {
      const result = await bookAppointment({
        ...form,
        service: selectedService.name,
        price: selectedService.price,
        date: selectedDate,
        time: selectedTime,
      });
      if (result.success) {
        setConfirmed({
          date: selectedDate,
          time: selectedTime,
          service: selectedService.name,
          price: selectedService.price,
        });
      } else {
        setError(result.error ?? 'Não foi possível agendar. Tente novamente.');
        setSelectedTime(null);
        await refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = async () => {
    setConfirmed(null);
    setForm({ name: '', whatsapp: '', email: '', objective: '' });
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedServiceId(null);
    setError(null);
    await refresh();
  };

  return (
    <section id="agendar" className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-foreground">Agendar Consulta</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha o melhor dia e horário para você. Rápido e fácil.
          </p>
        </motion.div>

        <motion.div {...fadeInUp} className="max-w-5xl mx-auto">
          <Card className="hover:translate-y-0">
            <CardContent className="p-6 md:p-10">
              {!data ? (
                <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  Carregando horários disponíveis...
                </div>
              ) : confirmed ? (
                <div className="text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground">
                    Consulta agendada com sucesso!
                  </h3>
                  <p className="text-lg text-muted-foreground">{confirmed.service}</p>
                  <p className="text-xl text-muted-foreground">
                    <span className="font-semibold text-foreground capitalize">
                      {formatDateBR(confirmed.date)}
                    </span>
                    {' '}às{' '}
                    <span className="font-semibold text-foreground">{confirmed.time}</span>
                    {' '}·{' '}
                    <span className="font-semibold text-primary">{formatPriceBR(confirmed.price)}</span>
                  </p>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Seu horário foi reservado. Qualquer dúvida, entre em contato pelo WhatsApp.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                    <Button variant="secondary" onClick={resetBooking}>
                      <CalendarDays className="w-5 h-5" />
                      Fazer novo agendamento
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-10">
                  {/* Coluna 1: serviço e dados do paciente */}
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        Escolha o serviço
                      </h3>
                      <div className="space-y-2">
                        {services.map((service) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => setSelectedServiceId(service.id)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg border text-left transition-colors ${
                              selectedServiceId === service.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <span className="text-sm font-medium text-foreground">{service.name}</span>
                            <span className={`text-sm font-bold whitespace-nowrap ${
                              selectedServiceId === service.id ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              {formatPriceBR(service.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Seus dados
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Nome completo
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => updateForm('name', e.target.value)}
                          placeholder="Seu nome completo"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          WhatsApp
                        </label>
                        <input
                          type="tel"
                          value={form.whatsapp}
                          onChange={(e) => updateForm('whatsapp', e.target.value)}
                          placeholder="(43) 99999-9999"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => updateForm('email', e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">
                          Objetivo da consulta
                        </label>
                        <textarea
                          value={form.objective}
                          onChange={(e) => updateForm('objective', e.target.value)}
                          placeholder="Ex.: emagrecimento, ganho de massa, reeducação alimentar..."
                          rows={3}
                          className={`${inputClass} h-auto py-3 resize-none`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: calendário e horários */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      Escolha a data e o horário
                    </h3>

                    <Calendar
                      key={refreshKey}
                      isDayEnabled={(d) => dayHasFreeSlots(data, d)}
                      selectedDate={selectedDate}
                      onSelectDate={handleSelectDate}
                    />

                    {selectedDate && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          Horários disponíveis para{' '}
                          <span className="capitalize">{formatDateBR(selectedDate)}</span>
                        </div>
                        {availableTimes.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {availableTimes.map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setSelectedTime(time)}
                                className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                                  selectedTime === time
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border text-foreground hover:border-primary hover:text-primary'
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">
                            Não há horários disponíveis neste dia.
                          </p>
                        )}
                      </div>
                    )}

                    {error && (
                      <p className="text-sm text-destructive font-medium">{error}</p>
                    )}

                    {selectedService && (
                      <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-primary/5 border border-primary/20">
                        <span className="text-sm text-foreground">{selectedService.name}</span>
                        <span className="font-bold text-primary whitespace-nowrap">
                          {formatPriceBR(selectedService.price)}
                        </span>
                      </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!canConfirm}
                      onClick={handleConfirm}
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5" />
                      )}
                      {submitting ? 'Confirmando...' : 'Confirmar Agendamento'}
                    </Button>
                    {!canConfirm && !submitting && (
                      <p className="text-xs text-muted-foreground text-center">
                        Escolha o serviço, preencha seus dados e selecione data e horário para confirmar.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

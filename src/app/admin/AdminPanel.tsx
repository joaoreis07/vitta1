import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  CalendarOff,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Pencil,
  Plus,
  Sparkles,
  Tag,
  Target,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { Calendar } from '../components/Calendar';
import {
  Appointment,
  ScheduleConfig,
  addService,
  addTimeSlot,
  blockDate,
  blockDateRange,
  cancelAppointment,
  checkLoggedIn,
  editTimeSlot,
  fetchAppointments,
  fetchConfig,
  formatDateBR,
  formatDateShortBR,
  formatPriceBR,
  isDayAvailable,
  login,
  logout,
  parseDateStr,
  removeService,
  removeTimeSlot,
  reserveSlot,
  setMinAdvanceHours,
  setWeekdays,
  toDateStr,
  unblockDate,
  unreserveSlot,
  updateService,
  usingSupabase,
} from '../lib/scheduling';

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const inputClass =
  'h-11 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';

type Tab = 'agendamentos' | 'horarios' | 'dias' | 'servicos';

export default function AdminPanel() {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    checkLoggedIn().then(setLogged);
  }, []);

  if (logged === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return logged ? (
    <Dashboard onLogout={async () => { await logout(); setLogged(false); }} />
  ) : (
    <LoginScreen onLogin={() => setLogged(true)} />
  );
}

// ---------- Tela de login ----------

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (await login(user, password)) {
        onLogin();
      } else {
        setError(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="hover:translate-y-0">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Área Administrativa</h1>
              <p className="text-muted-foreground">
                Acesso restrito à nutricionista
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {usingSupabase ? 'E-mail' : 'Login'}
                </label>
                <input
                  type={usingSupabase ? 'email' : 'text'}
                  value={user}
                  onChange={(e) => { setUser(e.target.value); setError(false); }}
                  placeholder={usingSupabase ? 'Seu e-mail' : 'Seu login'}
                  className={`${inputClass} w-full`}
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    placeholder="Sua senha"
                    className={`${inputClass} w-full pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-sm text-destructive font-medium">
                  {usingSupabase ? 'E-mail' : 'Login'} ou senha incorretos.
                </p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Entrar
              </Button>
            </form>

            {!usingSupabase && (
              <p className="text-center text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                Modo demonstração — use login <strong className="text-foreground">cliente</strong> e senha{' '}
                <strong className="text-foreground">vitta2026</strong>
              </p>
            )}

            <p className="text-center text-xs text-muted-foreground">
              <a href="#/" className="hover:text-primary transition-colors">← Voltar para o site</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ---------- Painel ----------

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('agendamentos');
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const refresh = useCallback(async () => {
    const [cfg, appts] = await Promise.all([fetchConfig(), fetchAppointments()]);
    setConfig(cfg);
    setAppointments(appts);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const tabs: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
    { id: 'agendamentos', label: 'Agendamentos', icon: CalendarDays },
    { id: 'horarios', label: 'Horários', icon: Clock },
    { id: 'dias', label: 'Dias', icon: CalendarOff },
    { id: 'servicos', label: 'Serviços e valores', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-foreground leading-tight">Nara Rossetto</div>
              <div className="text-xs text-muted-foreground leading-tight">Painel de Agendamentos</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 h-11 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {!config ? (
          <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            Carregando...
          </div>
        ) : (
          <>
            {tab === 'agendamentos' && (
              <AppointmentsTab appointments={appointments} onChange={refresh} />
            )}
            {tab === 'horarios' && <SlotsTab config={config} onChange={refresh} />}
            {tab === 'dias' && (
              <DaysTab config={config} appointments={appointments} onChange={refresh} />
            )}
            {tab === 'servicos' && <ServicesTab config={config} onChange={refresh} />}
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Aba: Agendamentos ----------

function AppointmentsTab({
  appointments,
  onChange,
}: {
  appointments: Appointment[];
  onChange: () => void;
}) {
  const today = toDateStr(new Date());

  const sorted = useMemo(
    () =>
      [...appointments].sort((a, b) =>
        a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
      ),
    [appointments]
  );
  const upcoming = sorted.filter((a) => a.date >= today);
  const past = sorted.filter((a) => a.date < today);

  const handleCancel = async (a: Appointment) => {
    const ok = window.confirm(
      `Cancelar a consulta de ${a.name} em ${formatDateShortBR(a.date)} às ${a.time}?\nO horário voltará a ficar disponível.`
    );
    if (ok) {
      await cancelAppointment(a.id);
      onChange();
    }
  };

  if (appointments.length === 0) {
    return (
      <Card className="hover:translate-y-0">
        <CardContent className="p-12 text-center space-y-3">
          <CalendarDays className="w-12 h-12 text-muted-foreground/40 mx-auto" />
          <p className="text-muted-foreground">Nenhum agendamento ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Próximas consultas ({upcoming.length})
        </h2>
        {upcoming.length === 0 && (
          <p className="text-muted-foreground text-sm">Nenhuma consulta futura agendada.</p>
        )}
        {upcoming.map((a) => (
          <AppointmentCard key={a.id} appointment={a} onCancel={() => handleCancel(a)} />
        ))}
      </div>

      {past.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Consultas passadas ({past.length})
          </h2>
          {past.map((a) => (
            <AppointmentCard key={a.id} appointment={a} onCancel={() => handleCancel(a)} past />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({
  appointment: a,
  onCancel,
  past = false,
}: {
  appointment: Appointment;
  onCancel: () => void;
  past?: boolean;
}) {
  return (
    <Card className={`hover:translate-y-0 ${past ? 'opacity-60' : ''}`}>
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 sm:w-44 flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-semibold text-foreground">{formatDateShortBR(a.date)}</div>
              <div className="text-sm text-primary font-medium">{a.time}</div>
            </div>
          </div>

          <div className="flex-1 grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <User className="w-4 h-4 text-primary flex-shrink-0" />
              {a.name}
            </div>
            {a.service && (
              <div className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                <span>
                  {a.service}
                  {typeof a.price === 'number' && (
                    <span className="font-semibold text-primary"> · {formatPriceBR(a.price)}</span>
                  )}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
              {a.whatsapp}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              {a.email}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="line-clamp-2">{a.objective}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive self-end sm:self-center flex-shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Aba: Horários ----------

const ADVANCE_PRESETS = [
  { hours: 0, label: 'Sem antecedência' },
  { hours: 6, label: '6 horas' },
  { hours: 12, label: '12 horas' },
  { hours: 24, label: '24 horas' },
  { hours: 48, label: '48 horas' },
  { hours: 72, label: '72 horas' },
];

function MinAdvanceCard({ config, onChange }: { config: ScheduleConfig; onChange: () => void }) {
  const [custom, setCustom] = useState('');

  const applyCustom = async () => {
    const hours = Number(custom);
    if (!isNaN(hours) && hours >= 0) {
      await setMinAdvanceHours(hours);
      setCustom('');
      onChange();
    }
  };

  return (
    <Card className="hover:translate-y-0">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Antecedência mínima para agendar
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Impede agendamentos de última hora. Com {config.minAdvanceHours}h de antecedência, um
          horário só aparece para o paciente se ainda faltarem pelo menos {config.minAdvanceHours}{' '}
          horas para ele.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {ADVANCE_PRESETS.map((preset) => {
            const active = config.minAdvanceHours === preset.hours;
            return (
              <button
                key={preset.hours}
                onClick={async () => { await setMinAdvanceHours(preset.hours); onChange(); }}
                className={`h-11 px-4 rounded-lg text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
        {!ADVANCE_PRESETS.some((p) => p.hours === config.minAdvanceHours) && (
          <p className="text-sm font-medium text-primary">
            Valor personalizado em uso: {config.minAdvanceHours} horas
          </p>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <input
            type="number"
            min="0"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Outro valor (horas)"
            className={`${inputClass} w-44`}
          />
          <Button onClick={applyCustom} disabled={custom === ''}>Aplicar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SlotsTab({ config, onChange }: { config: ScheduleConfig; onChange: () => void }) {
  const [newTime, setNewTime] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = async () => {
    if (!newTime) return;
    await addTimeSlot(newTime);
    setNewTime('');
    onChange();
  };

  const handleEdit = (time: string) => {
    setEditing(time);
    setEditValue(time);
  };

  const handleSaveEdit = async () => {
    if (editing && editValue) {
      await editTimeSlot(editing, editValue);
      setEditing(null);
      onChange();
    }
  };

  return (
    <div className="space-y-6">
    <MinAdvanceCard config={config} onChange={onChange} />
    <Card className="hover:translate-y-0">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Horários de atendimento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Estes horários valem para todos os dias liberados. Horários já reservados não aparecem
          para os pacientes.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {config.timeSlots.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum horário cadastrado.</p>
          )}
          {config.timeSlots.map((time) =>
            editing === time ? (
              <div key={time} className="flex items-center gap-1">
                <input
                  type="time"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className={inputClass}
                />
                <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div
                key={time}
                className="flex items-center gap-1 bg-primary/10 text-foreground rounded-lg pl-4 pr-1 h-11 font-medium"
              >
                {time}
                <button
                  onClick={() => handleEdit(time)}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Editar ${time}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={async () => { await removeTimeSlot(time); onChange(); }}
                  className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remover ${time}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          )}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <input
            type="time"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            className={inputClass}
          />
          <Button onClick={handleAdd} disabled={!newTime}>
            <Plus className="w-4 h-4" />
            Adicionar horário
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

// ---------- Aba: Serviços ----------

function ServicesTab({ config, onChange }: { config: ScheduleConfig; onChange: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const startEdit = (id: string, name: string, price: number) => {
    setEditingId(id);
    setEditName(name);
    setEditPrice(String(price));
  };

  const handleSaveEdit = async () => {
    const price = Number(editPrice.replace(',', '.'));
    if (editingId && editName.trim() && !isNaN(price) && price >= 0) {
      await updateService(editingId, editName, price);
      setEditingId(null);
      onChange();
    }
  };

  const handleAdd = async () => {
    const price = Number(newPrice.replace(',', '.'));
    if (newName.trim() && !isNaN(price) && price >= 0) {
      await addService(newName, price);
      setNewName('');
      setNewPrice('');
      onChange();
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (window.confirm(`Remover o serviço "${name}"?`)) {
      await removeService(id);
      onChange();
    }
  };

  return (
    <Card className="hover:translate-y-0">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          Serviços e valores
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Estes serviços aparecem para o paciente na hora de agendar. Você pode alterar os valores
          quando quiser.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {config.services.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado.</p>
          )}
          {config.services.map((service) =>
            editingId === service.id ? (
              <div
                key={service.id}
                className="flex flex-col sm:flex-row gap-2 p-4 rounded-lg border border-primary bg-primary/5"
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`${inputClass} flex-1`}
                  placeholder="Nome do serviço"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className={`${inputClass} w-32`}
                  placeholder="Valor (R$)"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>Salvar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key={service.id}
                className="flex items-center gap-3 p-4 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <div className="font-medium text-foreground">{service.name}</div>
                  <div className="text-lg font-bold text-primary">{formatPriceBR(service.price)}</div>
                </div>
                <button
                  onClick={() => startEdit(service.id, service.name, service.price)}
                  className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Editar ${service.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemove(service.id, service.name)}
                  className="w-9 h-9 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remover ${service.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          )}
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <div className="font-medium text-foreground">Adicionar novo serviço</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={`${inputClass} flex-1`}
              placeholder="Nome do serviço"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className={`${inputClass} w-32`}
              placeholder="Valor (R$)"
            />
            <Button onClick={handleAdd} disabled={!newName.trim() || !newPrice}>
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Aba: Dias ----------

function DaysTab({
  config,
  appointments,
  onChange,
}: {
  config: ScheduleConfig;
  appointments: Appointment[];
  onChange: () => void;
}) {
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [reserveDate, setReserveDate] = useState<string | null>(null);
  const today = toDateStr(new Date());

  const bookedTimes = new Set(
    reserveDate ? appointments.filter((a) => a.date === reserveDate).map((a) => a.time) : []
  );
  const reservedTimes = new Set(
    reserveDate
      ? config.reservedSlots.filter((r) => r.date === reserveDate).map((r) => r.time)
      : []
  );
  const futureReserved = config.reservedSlots
    .filter((r) => r.date >= today)
    .sort((a, b) => (a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)));

  const toggleWeekday = async (day: number) => {
    const next = config.weekdays.includes(day)
      ? config.weekdays.filter((d) => d !== day)
      : [...config.weekdays, day].sort();
    await setWeekdays(next);
    onChange();
  };

  const handleToggleDate = async (dateStr: string) => {
    if (config.blockedDates.includes(dateStr)) {
      await unblockDate(dateStr);
    } else {
      await blockDate(dateStr);
    }
    onChange();
  };

  const handleBlockRange = async () => {
    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) return;
    await blockDateRange(rangeStart, rangeEnd);
    setRangeStart('');
    setRangeEnd('');
    onChange();
  };

  const futureBlocked = config.blockedDates.filter((d) => d >= today);

  return (
    <div className="space-y-6">
      <Card className="hover:translate-y-0">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Dias da semana com atendimento
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Marque os dias da semana em que você atende.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_NAMES.map((name, day) => {
              const active = config.weekdays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleWeekday(day)}
                  className={`h-11 px-4 rounded-lg text-sm font-medium border transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="hover:translate-y-0">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CalendarOff className="w-5 h-5 text-primary" />
            Bloquear dias específicos
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Clique em um dia no calendário para bloquear ou desbloquear (feriados, compromissos
            etc.). Dias bloqueados aparecem riscados.
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="max-w-sm">
            <Calendar
              isDayEnabled={(d) => d >= today}
              dayClassName={(d) =>
                config.blockedDates.includes(d)
                  ? 'bg-destructive/15 text-destructive line-through hover:bg-destructive/25'
                  : ''
              }
              selectedDate={null}
              onSelectDate={handleToggleDate}
            />
          </div>

          <div className="pt-6 border-t border-border space-y-3">
            <div className="font-medium text-foreground">Bloquear período (férias)</div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                min={today}
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                className={inputClass}
              />
              <span className="text-muted-foreground">até</span>
              <input
                type="date"
                min={rangeStart || today}
                value={rangeEnd}
                onChange={(e) => setRangeEnd(e.target.value)}
                className={inputClass}
              />
              <Button
                onClick={handleBlockRange}
                disabled={!rangeStart || !rangeEnd || rangeStart > rangeEnd}
              >
                <CalendarOff className="w-4 h-4" />
                Bloquear período
              </Button>
            </div>
          </div>

          {futureBlocked.length > 0 && (
            <div className="pt-6 border-t border-border space-y-3">
              <div className="font-medium text-foreground">
                Dias bloqueados ({futureBlocked.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {futureBlocked.map((d) => (
                  <div
                    key={d}
                    className="flex items-center gap-1 bg-destructive/10 text-destructive rounded-lg pl-3 pr-1 h-9 text-sm font-medium"
                  >
                    {formatDateShortBR(d)}
                    <span className="text-xs font-normal opacity-70 ml-1">
                      ({WEEKDAY_NAMES[parseDateStr(d).getDay()].slice(0, 3)})
                    </span>
                    <button
                      onClick={async () => { await unblockDate(d); onChange(); }}
                      className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-destructive/20 transition-colors"
                      aria-label={`Desbloquear ${d}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="hover:translate-y-0">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Reservar horários para uso próprio
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Escolha um dia e clique nos horários que deseja reservar para você (compromissos
            pessoais, estudos etc.). Horários reservados não aparecem para os pacientes.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-sm">
            <Calendar
              isDayEnabled={(d) => isDayAvailable(d, config)}
              selectedDate={reserveDate}
              onSelectDate={(d) => setReserveDate(reserveDate === d ? null : d)}
            />
          </div>

          {reserveDate && (
            <div className="space-y-3">
              <div className="font-medium text-foreground capitalize">
                {formatDateBR(reserveDate)}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {config.timeSlots.map((time) => {
                  const booked = bookedTimes.has(time);
                  const reserved = reservedTimes.has(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={booked}
                      onClick={async () => {
                        if (reserved) {
                          await unreserveSlot(reserveDate, time);
                        } else {
                          await reserveSlot(reserveDate, time);
                        }
                        onChange();
                      }}
                      className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                        booked
                          ? 'border-border bg-muted text-muted-foreground/60 cursor-not-allowed'
                          : reserved
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-foreground hover:border-primary hover:text-primary'
                      }`}
                    >
                      {time}
                      {booked && <span className="block text-[10px] leading-tight">agendado</span>}
                      {reserved && <span className="block text-[10px] leading-tight">reservado</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Clique para reservar ou liberar. Horários marcados como "agendado" já têm consulta
                de paciente.
              </p>
            </div>
          )}

          {futureReserved.length > 0 && (
            <div className="pt-6 border-t border-border space-y-3">
              <div className="font-medium text-foreground">
                Horários reservados ({futureReserved.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {futureReserved.map((r) => (
                  <div
                    key={`${r.date}-${r.time}`}
                    className="flex items-center gap-1 bg-primary/10 text-foreground rounded-lg pl-3 pr-1 h-9 text-sm font-medium"
                  >
                    {formatDateShortBR(r.date)} às {r.time}
                    <button
                      onClick={async () => { await unreserveSlot(r.date, r.time); onChange(); }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                      aria-label={`Liberar ${r.date} ${r.time}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

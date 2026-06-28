import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  CalendarDays,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LogOut,
  PieChart,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import {
  checkFinanceLoggedIn,
  financeLogin,
  financeLogout,
  FINANCE_DEMO_PASSWORD,
  FINANCE_DEMO_USER,
} from '../lib/financeAuth';
import {
  Appointment,
  fetchAppointments,
  formatDateShortBR,
  formatPriceBR,
  toDateStr,
} from '../lib/scheduling';

const inputClass =
  'h-11 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';

export default function FinancePanel() {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    checkFinanceLoggedIn().then(setLogged);
  }, []);

  if (logged === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return logged ? (
    <Dashboard onLogout={async () => { await financeLogout(); setLogged(false); }} />
  ) : (
    <LoginScreen onLogin={() => setLogged(true)} />
  );
}

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
      if (await financeLogin(user, password)) {
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
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Área Financeira</h1>
              <p className="text-muted-foreground">Acesso restrito ao cliente</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Login</label>
                <input
                  type="text"
                  value={user}
                  onChange={(e) => { setUser(e.target.value); setError(false); }}
                  placeholder="Seu login"
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
                <p className="text-sm text-destructive font-medium">Login ou senha incorretos.</p>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Entrar
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              Modo demonstração — use login{' '}
              <strong className="text-foreground">{FINANCE_DEMO_USER}</strong> e senha{' '}
              <strong className="text-foreground">{FINANCE_DEMO_PASSWORD}</strong>
            </p>

            <p className="text-center text-xs text-muted-foreground">
              <a href="#/" className="hover:text-primary transition-colors">← Voltar para o site</a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);

  useEffect(() => {
    fetchAppointments().then(setAppointments);
  }, []);

  const today = toDateStr(new Date());
  const monthPrefix = today.slice(0, 7);

  const stats = useMemo(() => {
    if (!appointments) return null;

    const withPrice = appointments.filter((a) => typeof a.price === 'number');
    const total = withPrice.reduce((sum, a) => sum + (a.price ?? 0), 0);
    const monthTotal = withPrice
      .filter((a) => a.date.startsWith(monthPrefix))
      .reduce((sum, a) => sum + (a.price ?? 0), 0);
    const upcoming = appointments.filter((a) => a.date >= today);
    const upcomingValue = upcoming
      .filter((a) => typeof a.price === 'number')
      .reduce((sum, a) => sum + (a.price ?? 0), 0);

    const byService = new Map<string, { count: number; total: number }>();
    for (const a of withPrice) {
      const name = a.service ?? 'Sem serviço';
      const current = byService.get(name) ?? { count: 0, total: 0 };
      byService.set(name, {
        count: current.count + 1,
        total: current.total + (a.price ?? 0),
      });
    }

    const sorted = [...appointments].sort((a, b) =>
      a.date === b.date ? a.time.localeCompare(b.time) : b.date.localeCompare(a.date)
    );

    return { total, monthTotal, upcoming: upcoming.length, upcomingValue, byService, sorted };
  }, [appointments, monthPrefix, today]);

  return (
    <div className="min-h-screen bg-secondary">
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-semibold text-foreground leading-tight">Financeiro</div>
              <div className="text-xs text-muted-foreground leading-tight">Nara Rossetto</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {!stats ? (
          <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            Carregando...
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={TrendingUp}
                label="Faturamento total"
                value={formatPriceBR(stats.total)}
              />
              <StatCard
                icon={CalendarDays}
                label="Faturamento do mês"
                value={formatPriceBR(stats.monthTotal)}
              />
              <StatCard
                icon={Wallet}
                label="Consultas futuras"
                value={String(stats.upcoming)}
              />
              <StatCard
                icon={PieChart}
                label="Valor a receber"
                value={formatPriceBR(stats.upcomingValue)}
              />
            </div>

            <Card className="hover:translate-y-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Por serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.byService.size === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum agendamento com valor registrado.</p>
                ) : (
                  <div className="space-y-3">
                    {[...stats.byService.entries()]
                      .sort((a, b) => b[1].total - a[1].total)
                      .map(([name, data]) => (
                        <div
                          key={name}
                          className="flex items-center justify-between p-4 rounded-lg border border-border"
                        >
                          <div>
                            <div className="font-medium text-foreground">{name}</div>
                            <div className="text-sm text-muted-foreground">{data.count} consulta(s)</div>
                          </div>
                          <div className="text-lg font-bold text-primary">{formatPriceBR(data.total)}</div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:translate-y-0">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Histórico de consultas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.sorted.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum agendamento registrado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Data</th>
                          <th className="pb-3 pr-4 font-medium">Paciente</th>
                          <th className="pb-3 pr-4 font-medium">Serviço</th>
                          <th className="pb-3 font-medium text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.sorted.map((a) => (
                          <tr key={a.id} className="border-b border-border/60 last:border-0">
                            <td className="py-3 pr-4 text-foreground">
                              {formatDateShortBR(a.date)} · {a.time}
                            </td>
                            <td className="py-3 pr-4 text-foreground">{a.name}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{a.service ?? '—'}</td>
                            <td className="py-3 text-right font-semibold text-primary">
                              {typeof a.price === 'number' ? formatPriceBR(a.price) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
}) {
  return (
    <Card className="hover:translate-y-0">
      <CardContent className="p-5 space-y-2">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

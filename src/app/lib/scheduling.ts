// Camada de dados do sistema de agendamento.
//
// Funciona em dois modos:
// - Supabase configurado (src/app/lib/supabaseConfig.ts): dados online,
//   compartilhados entre todos os dispositivos.
// - Sem Supabase: fallback no localStorage do navegador (modo demonstração).

import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface Appointment {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  objective: string;
  /** Serviço escolhido e valor no momento do agendamento */
  service?: string;
  price?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
}

export interface ReservedSlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface ScheduleConfig {
  /** Dias da semana em que há atendimento (0 = domingo ... 6 = sábado) */
  weekdays: number[];
  /** Horários de atendimento (HH:mm) */
  timeSlots: string[];
  /** Datas específicas bloqueadas (feriados, férias etc.) - YYYY-MM-DD */
  blockedDates: string[];
  /** Serviços oferecidos, com valores */
  services: Service[];
  /** Antecedência mínima (em horas) exigida para um agendamento */
  minAdvanceHours: number;
  /** Horários reservados pela profissional para uso próprio */
  reservedSlots: ReservedSlot[];
}

export interface BookedSlot {
  date: string;
  time: string;
}

/** Dados necessários para calcular a disponibilidade pública */
export interface ScheduleData {
  config: ScheduleConfig;
  booked: BookedSlot[];
}

/** true quando o banco de dados online está em uso */
export const usingSupabase = isSupabaseConfigured;

const CONFIG_KEY = 'nara_schedule_config';
const APPOINTMENTS_KEY = 'nara_appointments';
const SESSION_KEY = 'nara_admin_session';

// Credenciais do painel no modo local (sem Supabase)
const LOCAL_ADMIN_USER = 'cliente';
const LOCAL_ADMIN_PASSWORD = 'vitta2026';

const DEFAULT_SERVICES: Service[] = [
  { id: 'consulta', name: 'Consulta nutricional com retorno', price: 250 },
  { id: 'consulta-treino', name: 'Consulta nutricional com retorno + treino personalizado', price: 300 },
  { id: 'avaliacao', name: 'Avaliação física', price: 100 },
];

const DEFAULT_CONFIG: ScheduleConfig = {
  weekdays: [1, 2, 3, 4, 5],
  timeSlots: ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00'],
  blockedDates: [],
  services: DEFAULT_SERVICES,
  minAdvanceHours: 24,
  reservedSlots: [],
};

// ---------- Utilitários de data ----------

export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDateBR(s: string): string {
  const d = parseDateStr(s);
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateShortBR(s: string): string {
  const d = parseDateStr(s);
  return d.toLocaleDateString('pt-BR');
}

export function formatPriceBR(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function todayStr(): string {
  return toDateStr(new Date());
}

function normalizeTime(t: unknown): string {
  return String(t).slice(0, 5);
}

function normalizeConfig(parsed: any): ScheduleConfig {
  if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_CONFIG };
  return {
    weekdays: Array.isArray(parsed.weekdays) ? parsed.weekdays : DEFAULT_CONFIG.weekdays,
    timeSlots: Array.isArray(parsed.timeSlots) ? parsed.timeSlots : DEFAULT_CONFIG.timeSlots,
    blockedDates: Array.isArray(parsed.blockedDates) ? parsed.blockedDates : [],
    services:
      Array.isArray(parsed.services) && parsed.services.length > 0
        ? parsed.services
        : DEFAULT_SERVICES,
    minAdvanceHours:
      typeof parsed.minAdvanceHours === 'number' && parsed.minAdvanceHours >= 0
        ? parsed.minAdvanceHours
        : DEFAULT_CONFIG.minAdvanceHours,
    reservedSlots: Array.isArray(parsed.reservedSlots) ? parsed.reservedSlots : [],
  };
}

// ---------- Persistência local (modo demonstração) ----------

function localLoadConfig(): ScheduleConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? normalizeConfig(JSON.parse(raw)) : { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function localSaveConfig(config: ScheduleConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

function localLoadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function localSaveAppointments(appointments: Appointment[]): void {
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
}

// ---------- Carregamento de dados ----------

export async function fetchConfig(): Promise<ScheduleConfig> {
  if (!supabase) return localLoadConfig();
  const { data, error } = await supabase
    .from('site_config')
    .select('data')
    .eq('id', 1)
    .single();
  if (error || !data) return { ...DEFAULT_CONFIG };
  return normalizeConfig(data.data);
}

async function saveConfigData(config: ScheduleConfig): Promise<void> {
  if (!supabase) {
    localSaveConfig(config);
    return;
  }
  const { error } = await supabase.from('site_config').update({ data: config }).eq('id', 1);
  if (error) throw new Error(error.message);
}

/** Dados públicos: configuração + horários já ocupados (sem dados pessoais). */
export async function fetchPublicData(): Promise<ScheduleData> {
  const config = await fetchConfig();
  let booked: BookedSlot[];
  if (!supabase) {
    booked = localLoadAppointments().map((a) => ({ date: a.date, time: a.time }));
  } else {
    const { data } = await supabase.rpc('get_booked_slots');
    booked = (data ?? []).map((r: any) => ({
      date: String(r.slot_date),
      time: normalizeTime(r.slot_time),
    }));
  }
  return { config, booked };
}

// ---------- Disponibilidade (cálculos puros, sem rede) ----------

/** O dia está habilitado para atendimento (sem considerar horários ocupados)? */
export function isDayAvailable(dateStr: string, config: ScheduleConfig): boolean {
  if (dateStr < todayStr()) return false;
  if (config.blockedDates.includes(dateStr)) return false;
  const weekday = parseDateStr(dateStr).getDay();
  return config.weekdays.includes(weekday);
}

/**
 * Horários livres de um dia, já removendo:
 * - horários agendados por pacientes
 * - horários reservados pela profissional para uso próprio
 * - horários que não respeitam a antecedência mínima configurada
 */
export function getAvailableTimes(data: ScheduleData, dateStr: string): string[] {
  const { config, booked } = data;
  if (!isDayAvailable(dateStr, config)) return [];

  const taken = new Set(booked.filter((b) => b.date === dateStr).map((b) => b.time));
  const reserved = new Set(
    config.reservedSlots.filter((r) => r.date === dateStr).map((r) => r.time)
  );

  // Momento mais cedo permitido para agendar (agora + antecedência mínima)
  const earliest = new Date(Date.now() + config.minAdvanceHours * 60 * 60 * 1000);

  const slots = config.timeSlots.filter((t) => {
    if (taken.has(t) || reserved.has(t)) return false;
    const [h, m] = t.split(':').map(Number);
    const slotDateTime = parseDateStr(dateStr);
    slotDateTime.setHours(h, m, 0, 0);
    return slotDateTime > earliest;
  });

  return slots.sort();
}

/** O dia tem pelo menos um horário livre? */
export function dayHasFreeSlots(data: ScheduleData, dateStr: string): boolean {
  return getAvailableTimes(data, dateStr).length > 0;
}

// ---------- Agendamentos ----------

const SLOT_TAKEN_ERROR =
  'Este horário acabou de ser reservado. Por favor, escolha outro horário.';

export async function bookAppointment(input: {
  name: string;
  whatsapp: string;
  email: string;
  objective: string;
  service: string;
  price: number;
  date: string;
  time: string;
}): Promise<{ success: boolean; error?: string }> {
  // Revalida disponibilidade no momento da confirmação
  const data = await fetchPublicData();
  if (!getAvailableTimes(data, input.date).includes(input.time)) {
    return { success: false, error: SLOT_TAKEN_ERROR };
  }

  if (!supabase) {
    const appointments = localLoadAppointments();
    appointments.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: input.name.trim(),
      whatsapp: input.whatsapp.trim(),
      email: input.email.trim(),
      objective: input.objective.trim(),
      service: input.service,
      price: input.price,
      date: input.date,
      time: input.time,
      createdAt: new Date().toISOString(),
    });
    localSaveAppointments(appointments);
    return { success: true };
  }

  const { error } = await supabase.from('appointments').insert({
    name: input.name.trim(),
    whatsapp: input.whatsapp.trim(),
    email: input.email.trim(),
    objective: input.objective.trim(),
    service: input.service,
    price: input.price,
    date: input.date,
    time: input.time,
  });

  if (error) {
    // 23505 = violação de chave única (duas pessoas tentaram o mesmo horário)
    if (error.code === '23505') return { success: false, error: SLOT_TAKEN_ERROR };
    return { success: false, error: 'Não foi possível agendar. Tente novamente.' };
  }
  return { success: true };
}

/** Lista completa de agendamentos (somente painel admin). */
export async function fetchAppointments(): Promise<Appointment[]> {
  if (!supabase) return localLoadAppointments();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true });
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: String(r.id),
    name: r.name,
    whatsapp: r.whatsapp,
    email: r.email,
    objective: r.objective,
    service: r.service ?? undefined,
    price: r.price != null ? Number(r.price) : undefined,
    date: String(r.date),
    time: normalizeTime(r.time),
    createdAt: r.created_at,
  }));
}

export async function cancelAppointment(id: string): Promise<void> {
  if (!supabase) {
    localSaveAppointments(localLoadAppointments().filter((a) => a.id !== id));
    return;
  }
  await supabase.from('appointments').delete().eq('id', id);
}

// ---------- Mutações de configuração (admin) ----------

async function mutateConfig(
  mutator: (cfg: ScheduleConfig) => ScheduleConfig
): Promise<ScheduleConfig> {
  const cfg = await fetchConfig();
  const next = mutator(cfg);
  await saveConfigData(next);
  return next;
}

export function addTimeSlot(time: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    timeSlots: cfg.timeSlots.includes(time) ? cfg.timeSlots : [...cfg.timeSlots, time].sort(),
  }));
}

export function removeTimeSlot(time: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    timeSlots: cfg.timeSlots.filter((t) => t !== time),
  }));
}

export function editTimeSlot(oldTime: string, newTime: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    timeSlots: cfg.timeSlots
      .map((t) => (t === oldTime ? newTime : t))
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .sort(),
  }));
}

export function setWeekdays(weekdays: number[]): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({ ...cfg, weekdays }));
}

export function blockDate(dateStr: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    blockedDates: cfg.blockedDates.includes(dateStr)
      ? cfg.blockedDates
      : [...cfg.blockedDates, dateStr].sort(),
  }));
}

export function unblockDate(dateStr: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    blockedDates: cfg.blockedDates.filter((d) => d !== dateStr),
  }));
}

/** Bloqueia um período inteiro (férias). */
export function blockDateRange(startStr: string, endStr: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => {
    const blocked = new Set(cfg.blockedDates);
    const end = parseDateStr(endStr);
    for (let d = parseDateStr(startStr); d <= end; d.setDate(d.getDate() + 1)) {
      blocked.add(toDateStr(d));
    }
    return { ...cfg, blockedDates: Array.from(blocked).sort() };
  });
}

export function setMinAdvanceHours(hours: number): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({ ...cfg, minAdvanceHours: Math.max(0, hours) }));
}

export function reserveSlot(date: string, time: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    reservedSlots: cfg.reservedSlots.some((r) => r.date === date && r.time === time)
      ? cfg.reservedSlots
      : [...cfg.reservedSlots, { date, time }],
  }));
}

export function unreserveSlot(date: string, time: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    reservedSlots: cfg.reservedSlots.filter((r) => !(r.date === date && r.time === time)),
  }));
}

export function addService(name: string, price: number): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    services: [
      ...cfg.services,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: name.trim(), price },
    ],
  }));
}

export function updateService(id: string, name: string, price: number): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    services: cfg.services.map((s) => (s.id === id ? { ...s, name: name.trim(), price } : s)),
  }));
}

export function removeService(id: string): Promise<ScheduleConfig> {
  return mutateConfig((cfg) => ({
    ...cfg,
    services: cfg.services.filter((s) => s.id !== id),
  }));
}

// ---------- Autenticação do painel ----------

export async function login(user: string, password: string): Promise<boolean> {
  if (!supabase) {
    const ok = user.trim().toLowerCase() === LOCAL_ADMIN_USER && password === LOCAL_ADMIN_PASSWORD;
    if (ok) sessionStorage.setItem(SESSION_KEY, 'ok');
    return ok;
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: user.trim(),
    password,
  });
  return !error;
}

export async function logout(): Promise<void> {
  if (!supabase) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }
  await supabase.auth.signOut();
}

export async function checkLoggedIn(): Promise<boolean> {
  if (!supabase) return sessionStorage.getItem(SESSION_KEY) === 'ok';
  const { data } = await supabase.auth.getSession();
  return data.session !== null;
}

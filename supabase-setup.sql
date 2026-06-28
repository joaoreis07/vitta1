-- ============================================================
-- Configuração do banco de dados do sistema de agendamento
-- Nara Rossetto - Nutricionista
--
-- Como usar:
-- 1. Crie um projeto gratuito em https://supabase.com
-- 2. No painel do projeto, abra "SQL Editor"
-- 3. Cole este script inteiro e clique em "Run"
-- ============================================================

-- Tabela de configuração (horários, dias, serviços, antecedência etc.)
create table if not exists site_config (
  id integer primary key,
  data jsonb not null
);

-- Configuração inicial padrão
insert into site_config (id, data) values (
  1,
  '{
    "weekdays": [1, 2, 3, 4, 5],
    "timeSlots": ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00"],
    "blockedDates": [],
    "services": [
      { "id": "consulta", "name": "Consulta nutricional com retorno", "price": 250 },
      { "id": "consulta-treino", "name": "Consulta nutricional com retorno + treino personalizado", "price": 300 },
      { "id": "avaliacao", "name": "Avaliação física", "price": 100 }
    ],
    "minAdvanceHours": 24,
    "reservedSlots": []
  }'::jsonb
) on conflict (id) do nothing;

-- Tabela de agendamentos
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp text not null,
  email text not null,
  objective text not null,
  service text,
  price numeric,
  date date not null,
  "time" text not null,
  created_at timestamptz not null default now(),
  -- Garante que duas pessoas nunca reservem o mesmo horário
  unique (date, "time")
);

-- ============================================================
-- Regras de segurança (RLS)
-- ============================================================

alter table site_config enable row level security;
alter table appointments enable row level security;

-- Configuração: qualquer pessoa pode ler (necessário para mostrar a agenda),
-- mas só a nutricionista logada pode alterar.
drop policy if exists "config_leitura_publica" on site_config;
create policy "config_leitura_publica"
  on site_config for select
  using (true);

drop policy if exists "config_update_admin" on site_config;
create policy "config_update_admin"
  on site_config for update
  to authenticated
  using (true)
  with check (true);

-- Agendamentos: qualquer pessoa pode criar (agendar),
-- mas só a nutricionista logada pode ver os dados e cancelar.
drop policy if exists "agendamento_insert_publico" on appointments;
create policy "agendamento_insert_publico"
  on appointments for insert
  to anon, authenticated
  with check (true);

drop policy if exists "agendamento_select_admin" on appointments;
create policy "agendamento_select_admin"
  on appointments for select
  to authenticated
  using (true);

drop policy if exists "agendamento_delete_admin" on appointments;
create policy "agendamento_delete_admin"
  on appointments for delete
  to authenticated
  using (true);

-- ============================================================
-- Função pública que retorna SOMENTE data e hora dos horários
-- ocupados (sem expor nome, telefone ou e-mail dos pacientes)
-- ============================================================

create or replace function get_booked_slots()
returns table(slot_date date, slot_time text)
language sql
security definer
set search_path = public
as $$
  select date, "time" from appointments where date >= current_date;
$$;

grant execute on function get_booked_slots() to anon, authenticated;

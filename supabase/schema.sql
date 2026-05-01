-- =====================================================
--  FINFLOW — Schema do Banco de Dados (Supabase)
--  Execute este script no SQL Editor do seu projeto:
--  Dashboard → SQL Editor → New Query → Cole e Execute
-- =====================================================

-- Tabela de transações (entradas e saídas)
CREATE TABLE IF NOT EXISTS transactions (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        text        NOT NULL CHECK (type IN ('income', 'expense')),
  name        text        NOT NULL,
  amount      numeric(12, 2) NOT NULL CHECK (amount > 0),
  date        date        NOT NULL,
  category    text        NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- Tabela de metas de reserva (uma por usuário)
CREATE TABLE IF NOT EXISTS goals (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  amount      numeric(12, 2) NOT NULL DEFAULT 0,
  updated_at  timestamptz DEFAULT now()
);

-- Tabela de categorias personalizadas (por usuário)
CREATE TABLE IF NOT EXISTS categories (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text        NOT NULL,
  emoji       text        NOT NULL,
  color       text        NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- =====================================================
--  Row Level Security (RLS)
--  Garante que cada usuário acesse APENAS seus dados
-- =====================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;

-- Políticas para transactions
CREATE POLICY "Usuário vê somente suas transações"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário cria somente suas transações"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário edita somente suas transações"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário exclui somente suas transações"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para goals
CREATE POLICY "Usuário vê somente sua meta"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário cria somente sua meta"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza somente sua meta"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para categories
CREATE POLICY "Usuário vê somente suas categorias"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário cria somente suas categorias"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário edita somente suas categorias"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário exclui somente suas categorias"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
--  Índices para performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_goals_user
  ON goals (user_id);

CREATE INDEX IF NOT EXISTS idx_categories_user
  ON categories (user_id);

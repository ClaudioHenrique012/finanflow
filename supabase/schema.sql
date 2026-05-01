-- =====================================================
--  FINFLOW — Schema do Banco de Dados (Supabase)
--  Execute este script PRIMEIRO no SQL Editor do seu projeto:
--  Dashboard → SQL Editor → New Query → Cole e Execute
--
--  Depois execute schema-rls.sql para as políticas RLS
-- =====================================================

-- PARTE 1: Criar tabelas (execute primeiro)
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
--  Índices para performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_date
  ON transactions (user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_goals_user
  ON goals (user_id);

CREATE INDEX IF NOT EXISTS idx_categories_user
  ON categories (user_id);

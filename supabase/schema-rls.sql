-- =====================================================
--  PARTE 2: RLS e Políticas (execute depois das tabelas)
-- =====================================================

-- Row Level Security (RLS)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories   ENABLE ROW LEVEL SECURITY;

-- Políticas para transactions
DROP POLICY IF EXISTS "Usuário vê somente suas transações" ON transactions;
CREATE POLICY "Usuário vê somente suas transações"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário cria somente suas transações" ON transactions;
CREATE POLICY "Usuário cria somente suas transações"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário edita somente suas transações" ON transactions;
CREATE POLICY "Usuário edita somente suas transações"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário exclui somente suas transações" ON transactions;
CREATE POLICY "Usuário exclui somente suas transações"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para goals
DROP POLICY IF EXISTS "Usuário vê somente sua meta" ON goals;
CREATE POLICY "Usuário vê somente sua meta"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário cria somente sua meta" ON goals;
CREATE POLICY "Usuário cria somente sua meta"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário atualiza somente sua meta" ON goals;
CREATE POLICY "Usuário atualiza somente sua meta"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para categories
DROP POLICY IF EXISTS "Usuário vê somente suas categorias" ON categories;
CREATE POLICY "Usuário vê somente suas categorias"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário cria somente suas categorias" ON categories;
CREATE POLICY "Usuário cria somente suas categorias"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário edita somente suas categorias" ON categories;
CREATE POLICY "Usuário edita somente suas categorias"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuário exclui somente suas categorias" ON categories;
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
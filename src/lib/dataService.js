/**
 * DataService — camada de dados do FinFlow
 *
 * Todos os métodos são async. Para trocar de banco futuramente,
 * substitua apenas este arquivo mantendo a mesma assinatura.
 */

import { supabase } from "./supabase";

// ── Transações ────────────────────────────────────────────────────

async function getAuthenticatedUserId() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const userId = data?.session?.user?.id;
  if (!userId) throw new Error('Usuário não autenticado. Faça login novamente.');
  return userId;
}

export async function getTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createTransaction(tx) {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...tx, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTransaction(tx) {
  const { id, user_id, created_at, ...fields } = tx;

  const { data, error } = await supabase
    .from("transactions")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTransaction(id) {
  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) throw error;
}

// ── Meta de Reserva ───────────────────────────────────────────────

export async function getGoal() {
  const { data, error } = await supabase
    .from("goals")
    .select("amount")
    .maybeSingle();

  if (error) throw error;
  return data?.amount ?? 0;
}

export async function saveGoal(amount) {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from('goals')
    .upsert(
      { user_id: userId, amount, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

  if (error) throw error;
}

// ── Auth ──────────────────────────────────────────────────────────

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPasswordForEmail(email) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
}

// ── Categorias ───────────────────────────────────────────────────────────────

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function createCategory(category) {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...category, user_id: userId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id, updates) {
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw error;
}

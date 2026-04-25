/**
 * DataService — camada de dados do FinFlow
 *
 * Todos os métodos são async. Para trocar de banco futuramente,
 * substitua apenas este arquivo mantendo a mesma assinatura.
 */

import { supabase } from './supabase'

// ── Transações ────────────────────────────────────────────────────

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createTransaction(tx) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...tx, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTransaction(tx) {
  const { id, user_id, created_at, ...fields } = tx

  const { data, error } = await supabase
    .from('transactions')
    .update(fields)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ── Meta de Reserva ───────────────────────────────────────────────

export async function getGoal() {
  const { data, error } = await supabase
    .from('goals')
    .select('amount')
    .maybeSingle()

  if (error) throw error
  return data?.amount ?? 0
}

export async function saveGoal(amount) {
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('goals')
    .upsert(
      { user_id: user.id, amount, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (error) throw error
}

// ── Auth ──────────────────────────────────────────────────────────

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

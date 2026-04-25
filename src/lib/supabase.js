import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('🔍 Debug - Variáveis de ambiente:', {
  supabaseUrl: supabaseUrl ? '✅ Presente' : '❌ Ausente',
  supabaseKey: supabaseKey ? '✅ Presente' : '❌ Ausente'
})

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas!')
  console.error('Verifique se as variáveis estão definidas no Netlify:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- VITE_SUPABASE_ANON_KEY')

  // Em desenvolvimento, tentar usar valores padrão ou alertar
  if (import.meta.env.DEV) {
    alert('Variáveis de ambiente não configuradas. Verifique o arquivo .env')
  }
}

// Criar cliente mesmo se as variáveis não estiverem presentes (para evitar crash)
export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

if (supabase) {
  console.log('✅ Cliente Supabase criado com sucesso')
} else {
  console.error('❌ Cliente Supabase não pôde ser criado')
}

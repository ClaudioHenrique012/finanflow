# FinFlow — Gestão Financeira Pessoal

App completo de finanças pessoais com Supabase como banco de dados e autenticação
via email/senha e Google OAuth.

---

## Pré-requisitos

- Node.js 18+ instalado
- Conta gratuita no [Supabase](https://supabase.com)
- Conta gratuita no [Netlify](https://netlify.com) (para deploy)

---

## 1. Configurar o Supabase

### 1.1 Criar o projeto
1. Acesse [supabase.com](https://supabase.com) → **New Project**
2. Escolha um nome (ex: `finflow`) e uma senha forte para o banco
3. Aguarde o projeto inicializar (~1 min)

### 1.2 Criar as tabelas
1. No painel do Supabase, vá em **SQL Editor → New Query**
2. Cole todo o conteúdo do arquivo `supabase/schema.sql`
3. Clique em **Run**

### 1.3 Ativar o login com Google (opcional)
1. Vá em **Authentication → Providers → Google**
2. Ative o toggle e siga as instruções para criar credenciais no Google Cloud Console
3. Cole o **Client ID** e **Client Secret**
4. Em **Redirect URLs**, adicione:
   - `http://localhost:5173` (desenvolvimento)
   - `https://seu-site.netlify.app` (produção — adicione depois do deploy)

### 1.4 Pegar as chaves da API
1. Vá em **Settings → API**
2. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

---

## 2. Configurar o projeto localmente

```bash
# Instalar dependências
npm install

# Criar o arquivo de variáveis de ambiente
cp .env.example .env
```

Abra `.env` e preencha com as suas chaves:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

```bash
# Rodar em desenvolvimento
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

---

## 3. Build para produção

```bash
npm run build
```

A pasta `dist/` gerada é o que será enviado para o Netlify.

---

## 4. Deploy no Netlify

### Opção A — Deploy pela interface (mais fácil)
1. Acesse [netlify.com](https://netlify.com) → **Add new site → Deploy manually**
2. Arraste a pasta `dist/` para a área de upload
3. Vá em **Site configuration → Environment variables** e adicione:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Em **Build settings**, configure:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Opção B — Deploy via GitHub (recomendado para atualizações automáticas)
1. Suba o projeto no GitHub
2. No Netlify: **Add new site → Import from Git**
3. Conecte o repositório
4. Configure as variáveis de ambiente (mesmo que a opção A)
5. Deploy automático a cada `git push`

### Configurar URL de redirecionamento no Supabase
Após o deploy, copie a URL do seu site no Netlify (ex: `https://finflow-claudio.netlify.app`)
e adicione em:
**Supabase → Authentication → URL Configuration → Redirect URLs**

---

## Estrutura do projeto

```
finflow/
├── supabase/
│   └── schema.sql          # SQL para criar as tabelas no Supabase
├── src/
│   ├── lib/
│   │   ├── supabase.js     # Cliente Supabase (singleton)
│   │   └── dataService.js  # Toda a lógica de dados (trocar aqui para mudar de banco)
│   ├── App.jsx             # App principal (dashboard, lançamentos, planejamento)
│   ├── Auth.jsx            # Tela de login/cadastro
│   └── main.jsx            # Entry point
├── .env.example            # Template das variáveis de ambiente
├── index.html
├── package.json
└── vite.config.js
```

---

## Dados seguros com Row Level Security (RLS)

O banco está configurado com RLS ativo — cada usuário acessa **apenas seus próprios dados**.
Isso é garantido a nível de banco de dados, não só no frontend.

---

## Funcionalidades

- ✅ Login com email/senha e Google OAuth
- ✅ Dados sincronizados entre dispositivos
- ✅ Dashboard com gráfico de 6 meses
- ✅ Gastos por categoria com barra de progresso
- ✅ Cadastro, edição e exclusão de lançamentos
- ✅ Planejamento de reserva mensal com análise de déficit/superávit
- ✅ Navegação por mês/ano
- ✅ Design responsivo (mobile e desktop)

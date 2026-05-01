import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  PlusCircle,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  List,
  PiggyBank,
  Target,
  LogOut,
  Loader2,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getGoal,
  saveGoal,
  signOut,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./lib/dataService";
import Auth from "./Auth";
import ResetPassword from "./ResetPassword";

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "cartao", name: "Cartão de Crédito", emoji: "💳", color: "#F59E0B" },
  { id: "casa", name: "Casa em Geral", emoji: "🏠", color: "#8B5CF6" },
  {
    id: "familia",
    name: "Recebidos Familiares",
    emoji: "👨‍👩‍👧",
    color: "#10B981",
  },
  { id: "alimentacao", name: "Alimentação", emoji: "🍽️", color: "#EF4444" },
  { id: "transporte", name: "Transporte", emoji: "🚗", color: "#3B82F6" },
  { id: "lazer", name: "Lazer", emoji: "🎭", color: "#EC4899" },
];

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const fmt = (val) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    val,
  );

const fmtShort = (v) =>
  v >= 1000 ? `R$${(v / 1000).toFixed(1)}k` : `R$${Math.round(v)}`;

const today = new Date();
const blankForm = () => ({
  type: "expense",
  name: "",
  amount: "",
  date: today.toISOString().split("T")[0],
  category: "cartao",
});

// ── Global CSS ────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:       #0A0D14;
    --bg-card:  #131720;
    --bg-card2: #1A1E2A;
    --bg-input: #1F2434;
    --text:     #F0F1F5;
    --muted:    #858AA3;
    --border:   rgba(255,255,255,0.07);
    --border2:  rgba(255,255,255,0.13);
    --green:    #22C55E;
    --red:      #F43F5E;
    --amber:    #F59E0B;
    --blue:     #3B82F6;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', system-ui, sans-serif; }

  .ff-input {
    width: 100%; background: var(--bg-input); color: var(--text);
    border: 1px solid var(--border2); border-radius: 8px;
    padding: 10px 12px; font-size: 14px; font-family: inherit; outline: none;
    transition: border-color .15s;
  }
  .ff-input:focus { border-color: var(--blue); }
  select.ff-input option { background: #1A1E2A; }

  .btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--blue); color: #fff; border: none;
    padding: 10px 18px; border-radius: 8px; font-size: 14px;
    font-weight: 500; cursor: pointer; transition: background .15s; font-family: inherit;
  }
  .btn-primary:hover { background: #2563EB; }
  .btn-primary:disabled { opacity: .6; cursor: default; }
  .btn-ghost {
    background: transparent; color: var(--muted);
    border: 1px solid var(--border2); padding: 10px 16px;
    border-radius: 8px; font-size: 14px; cursor: pointer;
    transition: all .15s; font-family: inherit;
  }
  .btn-ghost:hover { background: var(--bg-card2); color: var(--text); }
  .btn-icon {
    background: transparent; border: none; cursor: pointer;
    padding: 6px; border-radius: 6px; color: var(--muted);
    display: inline-flex; align-items: center; transition: all .15s;
  }
  .btn-icon:hover { background: var(--bg-card2); color: var(--text); }
  .btn-icon.del:hover { background: rgba(244,63,94,.15); color: var(--red); }

  .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; }

  .type-btn {
    flex: 1; padding: 10px; border: 1px solid var(--border2);
    border-radius: 8px; font-size: 14px; font-weight: 500;
    cursor: pointer; background: transparent; color: var(--muted);
    transition: all .15s; font-family: inherit;
  }
  .type-btn.on-income  { background: rgba(34,197,94,.15); color: var(--green); border-color: rgba(34,197,94,.4); }
  .type-btn.on-expense { background: rgba(244,63,94,.15); color: var(--red);   border-color: rgba(244,63,94,.4); }

  .nav-tab {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px; font-size: 13px;
    font-weight: 500; cursor: pointer; border: none;
    background: transparent; color: var(--muted); transition: all .15s;
    font-family: inherit; white-space: nowrap;
  }
  .nav-tab.on { background: var(--bg-card); color: var(--text); }

  .tx-row { transition: background .15s; border-radius: 10px; }
  .tx-row:hover { background: var(--bg-card2); }

  .overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,.72);
    z-index: 100; display: flex; align-items: center;
    justify-content: center; padding: 16px;
  }
  .modal {
    background: var(--bg-card); border: 1px solid var(--border2);
    border-radius: 18px; width: 100%; max-width: 440px; padding: 24px;
  }

  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: #1A1E2A; border: 1px solid var(--border2);
    border-radius: 10px; padding: 12px 20px; font-size: 14px;
    color: var(--text); z-index: 200; animation: slideUp .25s ease;
    display: flex; align-items: center; gap: 8px; box-shadow: 0 8px 32px rgba(0,0,0,.5);
  }
  @keyframes slideUp { from { opacity:0; transform: translateX(-50%) translateY(12px) } to { opacity:1; transform: translateX(-50%) translateY(0) } }
  @keyframes spin     { to { transform: rotate(360deg) } }

  @media (max-width: 620px) {
    .summary-grid { grid-template-columns: 1fr 1fr !important; }
    .hide-sm { display: none !important; }
    .nav-text { display: none !important; }
  }
  @media (max-width: 400px) {
    .summary-grid { grid-template-columns: 1fr !important; }
  }
`;

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  // Verificar se Supabase está disponível
  if (!supabase) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0A0D14",
          color: "#F0F1F5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "#131720",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "18px",
            padding: "32px",
            maxWidth: "500px",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#F43F5E", marginBottom: "16px" }}>
            ⚠️ Configuração Incompleta
          </h1>
          <p
            style={{
              color: "#858AA3",
              marginBottom: "20px",
              lineHeight: "1.5",
            }}
          >
            O Supabase não está configurado corretamente. Verifique se as
            variáveis de ambiente estão definidas.
          </p>
          <div
            style={{
              background: "#1A1E2A",
              padding: "16px",
              borderRadius: "8px",
              fontSize: "14px",
              textAlign: "left",
            }}
          >
            <strong>Variáveis necessárias no Netlify:</strong>
            <br />• <code style={{ color: "#3B82F6" }}>VITE_SUPABASE_URL</code>
            <br />•{" "}
            <code style={{ color: "#3B82F6" }}>VITE_SUPABASE_ANON_KEY</code>
          </div>
          <p style={{ color: "#858AA3", marginTop: "16px", fontSize: "14px" }}>
            Verifique o console do navegador (F12) para mais detalhes.
          </p>
        </div>
      </div>
    );
  }

  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Inject global CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Check for reset password page
  const pathname = window.location.pathname;
  if (pathname === '/reset-password') return <ResetPassword />;

  if (session === undefined) return <FullLoader />;
  if (!session) return <Auth />;
  return <FinFlow session={session} />;
}

// ── FinFlow ───────────────────────────────────────────────────────────────────

function FinFlow({ session }) {
  const [transactions, setTransactions] = useState([]);
  const [goal, setGoal] = useState(0);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState("dashboard");
  const [modal, setModal] = useState(null); // null | 'add' | tx | 'category'
  const [form, setForm] = useState(blankForm());
  const [categoryForm, setCategoryForm] = useState({ name: '', emoji: '', color: '#3B82F6' });
  const [goalInput, setGoalInput] = useState("");
  const [filterMonth, setFilterMonth] = useState(today.getMonth());
  const [filterYear, setFilterYear] = useState(today.getFullYear());
  const [toast, setToast] = useState(null);

  // Load data
  useEffect(() => {
    Promise.all([getTransactions(), getGoal(), getCategories()])
      .then(([txs, g, cats]) => {
        setTransactions(txs);
        setGoal(g);
        setGoalInput(g > 0 ? String(g) : "");
        setCustomCategories(cats);
      })
      .catch((e) => showToast("❌ " + e.message))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Derived values
  const filtered = useMemo(
    () =>
      transactions.filter((t) => {
        const d = new Date(t.date + "T00:00:00");
        return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
      }),
    [transactions, filterMonth, filterYear],
  );

  const income = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + +t.amount, 0),
    [filtered],
  );
  const expenses = useMemo(
    () =>
      filtered
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + +t.amount, 0),
    [filtered],
  );
  const balance = income - expenses;

  const allCategories = useMemo(() => [...CATEGORIES, ...customCategories], [customCategories]);

  const chartData = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => {
        let m = filterMonth - 5 + i,
          y = filterYear;
        while (m < 0) {
          m += 12;
          y--;
        }
        const txs = transactions.filter((t) => {
          const d = new Date(t.date + "T00:00:00");
          return d.getMonth() === m && d.getFullYear() === y;
        });
        return {
          month: MONTHS[m].slice(0, 3),
          receitas: txs
            .filter((t) => t.type === "income")
            .reduce((s, t) => s + +t.amount, 0),
          despesas: txs
            .filter((t) => t.type === "expense")
            .reduce((s, t) => s + +t.amount, 0),
        };
      }),
    [transactions, filterMonth, filterYear],
  );

  const getCat = (id) => allCategories.find((c) => c.id === id) || allCategories[0];

  // Handlers
  const openAdd = () => {
    setForm(blankForm());
    setModal("add");
  };
  const openEdit = (t) => {
    setForm({ ...t, amount: String(t.amount) });
    setModal(t);
  };
  const closeModal = () => setModal(null);

  const submitForm = async () => {
    const amt = parseFloat(form.amount);
    if (!form.name.trim() || !amt || isNaN(amt)) return;
    setSaving(true);
    try {
      if (modal === "add") {
        const tx = await createTransaction({
          type: form.type,
          name: form.name,
          amount: amt,
          date: form.date,
          category: form.category,
        });
        setTransactions((prev) => [tx, ...prev]);
        showToast("✅ Lançamento adicionado!");
      } else {
        const tx = await updateTransaction({ ...form, amount: amt });
        setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));
        showToast("✅ Lançamento atualizado!");
      }
      closeModal();
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const submitCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.emoji.trim()) return;
    setSaving(true);
    try {
      const cat = await createCategory(categoryForm);
      setCustomCategories((prev) => [cat, ...prev]);
      showToast("✅ Categoria criada!");
      setCategoryForm({ name: '', emoji: '', color: '#3B82F6' });
      closeModal();
    } catch (e) {
      showToast("❌ " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTx = async (id) => {
    try {
      await deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast("🗑️ Lançamento excluído.");
    } catch (e) {
      showToast("❌ " + e.message);
    }
  };

  const handleSaveGoal = async () => {
    const v = parseFloat(goalInput) || 0;
    try {
      await saveGoal(v);
      setGoal(v);
      showToast("✅ Meta salva!");
    } catch (e) {
      showToast("❌ " + e.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      showToast("❌ " + e.message);
    }
  };

  const prevMonth = () => {
    if (filterMonth === 0) {
      setFilterMonth(11);
      setFilterYear((y) => y - 1);
    } else setFilterMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (filterMonth === 11) {
      setFilterMonth(0);
      setFilterYear((y) => y + 1);
    } else setFilterMonth((m) => m + 1);
  };

  const userEmail =
    session.user.email || session.user.user_metadata?.full_name || "";

  if (loading) return <FullLoader />;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(10,13,20,.92)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              flexShrink: 0,
              background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Wallet size={17} color="#fff" />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: 19,
                letterSpacing: "-.4px",
              }}
            >
              FinFlow
            </h1>
            <p
              style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}
              className="hide-sm"
            >
              {userEmail}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="btn-icon" onClick={prevMonth}>
            <ChevronLeft size={16} />
          </button>
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              minWidth: 120,
              textAlign: "center",
            }}
          >
            {MONTHS[filterMonth]} {filterYear}
          </span>
          <button className="btn-icon" onClick={nextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn-primary"
            onClick={openAdd}
            style={{ padding: "9px 14px" }}
          >
            <PlusCircle size={15} />{" "}
            <span className="hide-sm">Novo Lançamento</span>
          </button>
          <button className="btn-icon" onClick={handleSignOut} title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Nav */}
      <div
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "10px 20px",
        }}
      >
        <nav
          style={{
            display: "inline-flex",
            gap: 2,
            background: "#0A0D14",
            borderRadius: 10,
            padding: 4,
            border: "1px solid var(--border)",
          }}
        >
          {[
            ["dashboard", <LayoutDashboard size={14} />, "Resumo"],
            ["transactions", <List size={14} />, "Lançamentos"],
            ["planning", <PiggyBank size={14} />, "Planejamento"],
          ].map(([v, icon, label]) => (
            <button
              key={v}
              className={`nav-tab ${view === v ? "on" : ""}`}
              onClick={() => setView(v)}
            >
              {icon} <span className="nav-text">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <main style={{ padding: "20px", maxWidth: 960, margin: "0 auto" }}>
        {/* Summary cards */}
        <div
          className="summary-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Saldo do Mês",
              value: balance,
              color: balance >= 0 ? "var(--green)" : "var(--red)",
              icon: <Wallet size={17} />,
            },
            {
              label: "Total Receitas",
              value: income,
              color: "var(--green)",
              icon: <TrendingUp size={17} />,
            },
            {
              label: "Total Despesas",
              value: expenses,
              color: "var(--red)",
              icon: <TrendingDown size={17} />,
            },
          ].map((c) => (
            <div
              key={c.label}
              className="card"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  {c.label}
                </span>
                <span style={{ color: c.color, opacity: 0.65 }}>{c.icon}</span>
              </div>
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 600,
                  color: c.color,
                  letterSpacing: "-.5px",
                }}
              >
                {fmt(c.value)}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -22,
                  right: -8,
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: c.color,
                  opacity: 0.05,
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Dashboard ── */}
        {view === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="card">
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 18,
                  color: "var(--muted)",
                }}
              >
                EVOLUÇÃO — ÚLTIMOS 6 MESES
              </h3>
              <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
                {[
                  ["var(--green)", "Receitas"],
                  ["var(--red)", "Despesas"],
                ].map(([col, lbl]) => (
                  <div
                    key={lbl}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 3,
                        background: col,
                      }}
                    />
                    {lbl}
                  </div>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={chartData} barSize={16} barGap={3}>
                  <CartesianGrid
                    strokeDasharray="2 4"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#858AA3", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#858AA3", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={fmtShort}
                    width={52}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1A1E2A",
                      border: "1px solid rgba(255,255,255,.12)",
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                    formatter={(v) => [fmt(v)]}
                    labelStyle={{
                      color: "#F0F1F5",
                      fontWeight: 500,
                      marginBottom: 4,
                    }}
                    cursor={{ fill: "rgba(255,255,255,.03)" }}
                  />
                  <Bar
                    dataKey="receitas"
                    fill="#22C55E"
                    radius={[5, 5, 0, 0]}
                    name="Receitas"
                  />
                  <Bar
                    dataKey="despesas"
                    fill="#F43F5E"
                    radius={[5, 5, 0, 0]}
                    name="Despesas"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 16,
                  color: "var(--muted)",
                }}
              >
                GASTOS POR CATEGORIA
              </h3>
              {allCategories.map((cat) => {
                const total = filtered
                  .filter((t) => t.type === "expense" && t.category === cat.id)
                  .reduce((s, t) => s + +t.amount, 0);
                if (total === 0) return null;
                const pct = expenses > 0 ? (total / expenses) * 100 : 0;
                return (
                  <div key={cat.id} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 7,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>
                        {cat.emoji} {cat.name}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>
                        {fmt(total)}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: "rgba(255,255,255,.07)",
                        borderRadius: 5,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: cat.color,
                          borderRadius: 5,
                          transition: "width .6s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <button
                className="btn-ghost"
                style={{ width: '100%', marginTop: 16 }}
                onClick={() => setModal('category')}
              >
                + Criar categoria personalizada
              </button>
              {expenses === 0 && (
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: 14,
                    textAlign: "center",
                    padding: "28px 0",
                  }}
                >
                  Nenhuma despesa registrada.
                </p>
              )}
            </div>

            <div className="card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "var(--muted)",
                  }}
                >
                  LANÇAMENTOS RECENTES
                </h3>
                <button
                  className="btn-ghost"
                  style={{ fontSize: 12, padding: "6px 12px" }}
                  onClick={() => setView("transactions")}
                >
                  Ver todos →
                </button>
              </div>
              {[...filtered]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 5)
                .map((t) => (
                  <TxRow
                    key={t.id}
                    t={t}
                    getCat={getCat}
                    onEdit={openEdit}
                    onDelete={deleteTx}
                  />
                ))}
              {filtered.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "32px 0",
                    color: "var(--muted)",
                  }}
                >
                  <p style={{ fontSize: 14, marginBottom: 14 }}>
                    Nenhum lançamento em {MONTHS[filterMonth]}.
                  </p>
                  <button className="btn-primary" onClick={openAdd}>
                    + Adicionar primeiro lançamento
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Transactions ── */}
        {view === "transactions" && (
          <div className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <h3
                style={{ fontSize: 14, fontWeight: 500, color: "var(--muted)" }}
              >
                LANÇAMENTOS — {MONTHS[filterMonth].toUpperCase()} {filterYear}
              </h3>
              <span
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  background: "var(--bg-card2)",
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "1px solid var(--border2)",
                }}
              >
                {filtered.length} registros
              </span>
            </div>
            {filtered.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "52px 0",
                  color: "var(--muted)",
                }}
              >
                <p style={{ fontSize: 15, marginBottom: 16 }}>
                  Nenhum lançamento neste período.
                </p>
                <button className="btn-primary" onClick={openAdd}>
                  + Adicionar lançamento
                </button>
              </div>
            ) : (
              [...filtered]
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((t, i, arr) => (
                  <TxRow
                    key={t.id}
                    t={t}
                    getCat={getCat}
                    onEdit={openEdit}
                    onDelete={deleteTx}
                    bordered={i < arr.length - 1}
                  />
                ))
            )}
          </div>
        )}

        {/* ── Planning ── */}
        {view === "planning" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                }}
              >
                <Target size={18} color="var(--amber)" />
                <h3 style={{ fontSize: 15, fontWeight: 500 }}>
                  Meta de Reserva Mensal
                </h3>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: 18,
                }}
              >
                Defina quanto deseja guardar todo mês para atingir seus
                objetivos financeiros.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  className="ff-input"
                  type="number"
                  placeholder="Ex: 500,00"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  style={{ maxWidth: 220 }}
                />
                <button className="btn-primary" onClick={handleSaveGoal}>
                  Salvar Meta
                </button>
              </div>
            </div>

            {goal > 0 && (
              <div className="card">
                <h3
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 18,
                    color: "var(--muted)",
                  }}
                >
                  ANÁLISE DE {MONTHS[filterMonth].toUpperCase()} {filterYear}
                </h3>
                {[
                  {
                    label: "Receitas do mês",
                    value: income,
                    color: "var(--green)",
                  },
                  {
                    label: "Despesas do mês",
                    value: expenses,
                    color: "var(--red)",
                  },
                  {
                    label: "Saldo disponível",
                    value: balance,
                    color: balance >= 0 ? "var(--green)" : "var(--red)",
                  },
                  {
                    label: "Meta de reserva",
                    value: goal,
                    color: "var(--amber)",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "13px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span style={{ fontSize: 14, color: "var(--muted)" }}>
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: row.color,
                      }}
                    >
                      {fmt(row.value)}
                    </span>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: 18,
                    padding: 16,
                    borderRadius: 10,
                    background:
                      balance >= goal
                        ? "rgba(34,197,94,.08)"
                        : "rgba(244,63,94,.08)",
                    border: `1px solid ${balance >= goal ? "rgba(34,197,94,.2)" : "rgba(244,63,94,.2)"}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: balance >= goal ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {balance >= goal
                      ? "✅ Sobra após a reserva"
                      : "⚠️ Déficit para atingir a meta"}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: balance >= goal ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {fmt(Math.abs(balance - goal))}
                  </span>
                </div>

                <div style={{ marginTop: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      Progresso em direção à meta
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>
                      {Math.min(
                        100,
                        Math.max(0, Math.round((balance / goal) * 100)),
                      )}
                      %
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "rgba(255,255,255,.07)",
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, Math.max(0, (balance / goal) * 100))}%`,
                        background:
                          balance >= goal ? "var(--green)" : "var(--amber)",
                        borderRadius: 8,
                        transition: "width .7s ease",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 17, fontWeight: 600 }}>
                {modal === "add" ? "Novo Lançamento" : modal === "category" ? "Nova Categoria" : "Editar Lançamento"}
              </h2>
              <button className="btn-icon" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {modal === 'category' ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Nome da categoria">
                    <input
                      className="ff-input"
                      type="text"
                      placeholder="Ex: Viagens"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </Field>

                  <Field label="Emoji">
                    <input
                      className="ff-input"
                      type="text"
                      placeholder="Ex: ✈️"
                      value={categoryForm.emoji}
                      onChange={(e) => setCategoryForm((f) => ({ ...f, emoji: e.target.value }))}
                    />
                  </Field>

                  <Field label="Cor">
                    <input
                      className="ff-input"
                      type="color"
                      value={categoryForm.color}
                      onChange={(e) => setCategoryForm((f) => ({ ...f, color: e.target.value }))}
                      style={{ padding: 4, height: 42 }}
                    />
                  </Field>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                  <button
                    className="btn-ghost"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-primary"
                    onClick={submitCategory}
                    disabled={saving || !categoryForm.name.trim() || !categoryForm.emoji.trim()}
                  >
                    {saving ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    Criar Categoria
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                  <button
                    className={`type-btn ${form.type === "income" ? "on-income" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, type: "income" }))}
                  >
                    ↑ Receita
                  </button>
                  <button
                    className={`type-btn ${form.type === "expense" ? "on-expense" : ""}`}
                    onClick={() => setForm((f) => ({ ...f, type: "expense" }))}
                  >
                    ↓ Despesa
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <Field label="Nome / Descrição">
                    <input
                      className="ff-input"
                      type="text"
                      placeholder="Ex: Salário, Supermercado..."
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Valor (R$)">
                    <input
                      className="ff-input"
                      type="number"
                      placeholder="0,00"
                      step="0.01"
                      min="0"
                      value={form.amount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, amount: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Data">
                    <input
                      className="ff-input"
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Categoria">
                    <select
                      className="ff-input"
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                    >
                      {allCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
                  <button
                    className="btn-ghost"
                    style={{ flex: 1 }}
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-primary"
                    style={{ flex: 2, justifyContent: "center" }}
                    onClick={submitForm}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2
                        size={15}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : null}
                    {saving
                      ? "Salvando..."
                      : modal === "add"
                        ? "Adicionar"
                        : "Salvar alterações"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TxRow({ t, getCat, onEdit, onDelete, bordered = false }) {
  const cat = getCat(t.category);
  return (
    <div
      className="tx-row"
      style={{
        display: "flex",
        alignItems: "center",
        padding: "11px 8px",
        gap: 12,
        cursor: "pointer",
        borderBottom: bordered ? "1px solid var(--border)" : "none",
      }}
      onClick={() => onEdit(t)}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          flexShrink: 0,
          background: `${cat.color}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 17,
        }}
      >
        {cat.emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {t.name}
        </p>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          {cat.name} ·{" "}
          {new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR")}
        </p>
      </div>
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          flexShrink: 0,
          marginRight: 4,
          color: t.type === "income" ? "var(--green)" : "var(--red)",
        }}
      >
        {t.type === "income" ? "+" : "-"}
        {fmt(t.amount)}
      </span>
      <button
        className="btn-icon"
        title="Editar"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(t);
        }}
      >
        <Edit2 size={14} />
      </button>
      <button
        className="btn-icon del"
        title="Excluir"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(t.id);
        }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          color: "var(--muted)",
          display: "block",
          marginBottom: 7,
          textTransform: "uppercase",
          letterSpacing: ".5px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function FullLoader() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0D14",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loader2
        size={32}
        color="#3B82F6"
        style={{ animation: "spin 1s linear infinite" }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

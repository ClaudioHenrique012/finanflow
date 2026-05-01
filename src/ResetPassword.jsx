import { useState, useEffect } from "react";
import { Wallet, Lock, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "./lib/supabase";

const CSS_RESET = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0D14; color: #F0F1F5; font-family: 'DM Sans', system-ui, sans-serif; }
`;

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have the recovery token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const type = hashParams.get("type");

    if (type === "recovery" && accessToken) {
      // Set the session with the token
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get("refresh_token") || "",
      });
    } else {
      setError("Link de redefinição inválido ou expirado.");
    }
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!password) {
      setError("Preencha a nova senha.");
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const s = {
    page: {
      minHeight: "100vh",
      background: "#0A0D14",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },
    card: {
      background: "#131720",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 18,
      padding: "36px 32px",
      width: "100%",
      maxWidth: 400,
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 28,
      justifyContent: "center",
    },
    logoIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      background: "linear-gradient(135deg,#3B82F6,#8B5CF6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      fontFamily: "'DM Serif Display', Georgia, serif",
      fontSize: 22,
      color: "#F0F1F5",
      letterSpacing: "-.4px",
    },
    subtitle: {
      fontSize: 13,
      color: "#858AA3",
      marginBottom: 28,
      textAlign: "center",
    },
    label: {
      fontSize: 12,
      color: "#858AA3",
      display: "block",
      marginBottom: 7,
      textTransform: "uppercase",
      letterSpacing: ".5px",
    },
    input: {
      width: "100%",
      background: "#1F2434",
      color: "#F0F1F5",
      border: "1px solid rgba(255,255,255,0.13)",
      borderRadius: 8,
      padding: "11px 12px 11px 38px",
      fontSize: 14,
      outline: "none",
      fontFamily: "inherit",
      transition: "border-color .15s",
    },
    inputWrap: { position: "relative", marginBottom: 14 },
    icon: {
      position: "absolute",
      left: 11,
      top: "50%",
      transform: "translateY(-50%)",
      color: "#858AA3",
      pointerEvents: "none",
    },
    btnPrimary: {
      width: "100%",
      background: "#3B82F6",
      color: "#fff",
      border: "none",
      borderRadius: 9,
      padding: "12px",
      fontSize: 15,
      fontWeight: 600,
      cursor: "pointer",
      marginTop: 4,
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "background .15s",
    },
    error: {
      background: "rgba(244,63,94,.12)",
      border: "1px solid rgba(244,63,94,.25)",
      borderRadius: 8,
      padding: "10px 12px",
      fontSize: 13,
      color: "#F87171",
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 14,
    },
    successBox: {
      background: "rgba(34,197,94,.1)",
      border: "1px solid rgba(34,197,94,.25)",
      borderRadius: 8,
      padding: "10px 12px",
      fontSize: 13,
      color: "#4ADE80",
      marginBottom: 14,
      textAlign: "center",
    },
  };

  if (success) {
    return (
      <>
        <style>{CSS_RESET}</style>
        <div style={s.page}>
          <div style={s.card}>
            <div style={s.logo}>
              <div style={s.logoIcon}>
                <CheckCircle size={20} color="#4ADE80" />
              </div>
              <span style={s.title}>FinFlow</span>
            </div>
            <div style={s.successBox}>
              <CheckCircle size={16} /> Senha redefinida com sucesso! Você pode
              fazer login agora.
            </div>
            <button
              style={s.btnPrimary}
              onClick={() => (window.location.href = "/")}
            >
              Ir para Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{CSS_RESET}</style>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <Wallet size={20} color="#fff" />
            </div>
            <span style={s.title}>FinFlow</span>
          </div>

          <p style={s.subtitle}>Digite sua nova senha</p>

          {error && (
            <div style={s.error}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <label style={s.label}>Nova Senha</label>
          <div style={s.inputWrap}>
            <Lock size={15} style={s.icon} />
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete="new-password"
            />
          </div>

          <label style={s.label}>Confirmar Senha</label>
          <div style={s.inputWrap}>
            <Lock size={15} style={s.icon} />
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete="new-password"
            />
          </div>

          <button
            style={s.btnPrimary}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Loader2
                size={16}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : null}
            {loading ? "Aguarde..." : "Redefinir Senha"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  );
}

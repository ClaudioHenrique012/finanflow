import { useState } from "react";
import { Wallet, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  resetPasswordForEmail,
} from "./lib/dataService";

const CSS_AUTH = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Serif+Display&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0A0D14; color: #F0F1F5; font-family: 'DM Sans', system-ui, sans-serif; }
`;

export default function Auth() {
  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!email) {
      setError("Preencha o email.");
      return;
    }
    if (mode === "forgot") {
      setLoading(true);
      try {
        await resetPasswordForEmail(email);
        setSuccess(
          "Email de redefinição enviado! Verifique sua caixa de entrada.",
        );
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    if (!password) {
      setError("Preencha a senha.");
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter ao menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setSuccess(
          "Conta criada! Verifique seu e-mail para confirmar o cadastro.",
        );
      }
    } catch (e) {
      const msgs = {
        "Invalid login credentials": "Email ou senha incorretos.",
        "Email not confirmed": "Confirme seu e-mail antes de entrar.",
        "User already registered":
          "Este e-mail já está cadastrado. Faça login.",
      };
      setError(msgs[e.message] || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoad(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message);
      setGoogleLoad(false);
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
    btnGoogle: {
      width: "100%",
      background: "transparent",
      color: "#F0F1F5",
      border: "1px solid rgba(255,255,255,0.13)",
      borderRadius: 9,
      padding: "11px",
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      marginTop: 10,
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "background .15s",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "18px 0",
      color: "#858AA3",
      fontSize: 12,
    },
    line: { flex: 1, height: 1, background: "rgba(255,255,255,0.07)" },
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
    },
    toggle: {
      textAlign: "center",
      marginTop: 22,
      fontSize: 13,
      color: "#858AA3",
    },
    toggleBtn: {
      color: "#3B82F6",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: 13,
    },
  };

  return (
    <>
      <style>{CSS_AUTH}</style>
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logo}>
            <div style={s.logoIcon}>
              <Wallet size={20} color="#fff" />
            </div>
            <span style={s.title}>FinFlow</span>
          </div>

          <p style={s.subtitle}>
            {mode === "login"
              ? "Bem-vindo de volta! Entre na sua conta."
              : mode === "register"
                ? "Crie sua conta gratuita."
                : "Digite seu email para redefinir a senha."}
          </p>

          {error && (
            <div style={s.error}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {success && <div style={s.successBox}>{success}</div>}

          {/* Email */}
          <label style={s.label}>Email</label>
          <div style={s.inputWrap}>
            <Mail size={15} style={s.icon} />
            <input
              style={s.input}
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoComplete="email"
            />
          </div>

          {/* Password - only for login/register */}
          {mode !== "forgot" && (
            <>
              <label style={s.label}>Senha</label>
              <div style={s.inputWrap}>
                <Lock size={15} style={s.icon} />
                <input
                  style={s.input}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />
              </div>
            </>
          )}

          {/* Forgot Password link - only for login */}
          {mode === "login" && (
            <p style={{ textAlign: "right", marginTop: -8, marginBottom: 14 }}>
              <button
                style={{
                  color: "#3B82F6",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  textDecoration: "underline",
                }}
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setSuccess("");
                }}
              >
                Esqueci minha senha
              </button>
            </p>
          )}

          {/* Submit */}
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
            {loading
              ? "Aguarde..."
              : mode === "login"
                ? "Entrar"
                : mode === "register"
                  ? "Criar conta"
                  : "Enviar email de redefinição"}
          </button>

          {/* Divider */}
          <div style={s.divider}>
            <div style={s.line} /> ou <div style={s.line} />
          </div>

          {/* Google */}
          <button
            style={s.btnGoogle}
            onClick={handleGoogle}
            disabled={googleLoad}
          >
            {googleLoad ? (
              <Loader2
                size={15}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <svg width="17" height="17" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.7 1.1 7.8 2.9l5.7-5.7C33.8 6.5 29.2 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.2 0-9.6-3-11.3-7.2l-6.6 5.1C9.8 39.8 16.4 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.7 5.8l6.2 5.2C40.5 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"
                />
              </svg>
            )}
            Continuar com Google
          </button>

          {/* Toggle */}
          <p style={s.toggle}>
            {mode === "forgot" ? (
              <button
                style={s.toggleBtn}
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >
                Voltar ao login
              </button>
            ) : (
              <>
                {mode === "login" ? "Não tem uma conta? " : "Já tem conta? "}
                <button
                  style={s.toggleBtn}
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setError("");
                    setSuccess("");
                  }}
                >
                  {mode === "login" ? "Criar conta" : "Entrar"}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </>
  );
}

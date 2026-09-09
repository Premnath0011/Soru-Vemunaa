import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLogIn, FiUserPlus } from "react-icons/fi";
import { login, register } from "../../services/authService";
import { useAuth } from "../../context";
import Decor from "../../components/Decor";
export default function Auth({ mode }) {
  const isLogin = mode === "login",
    nav = useNavigate(),
    { save } = useAuth();
  const [f, setF] = useState({
      name: "",
      email: "",
      password: "",
      channelName: "Soru_Venumaa",
    }),
    [err, setErr] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = isLogin
        ? await login({ email: f.email, password: f.password })
        : await register(f);
      localStorage.setItem("soru_token", r.token);
      save(r.user);
      nav("/");
    } catch (e) {
      setErr(e.response?.data?.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-screen">
      <Decor />
      <div className="auth-card glass">
        <div className="auth-logo-wrap">
          <img className="auth-logo-image" src="/soru-venumaa-logo.jpeg" alt="Soru_Venumaa" />
          <div className="auth-brand-name">Soru_Venumaa</div>
        </div>
        <p className="subtle">Create • Track • Grow</p>
        <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
        <p className="subtle">
          {isLogin
            ? "Sign in to manage your food review business."
            : "Set up your creator workspace in a minute."}
        </p>
        {err && <div className="error-box">{err}</div>}
        <form onSubmit={submit}>
          {!isLogin && (
            <>
              <div className="field">
                <label>Your Name</label>
                <input
                  required
                  value={f.name}
                  onChange={(e) => setF({ ...f, name: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Channel Name</label>
                <input
                  value={f.channelName}
                  onChange={(e) => setF({ ...f, channelName: e.target.value })}
                />
              </div>
            </>
          )}
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              required
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              minLength="6"
              required
              value={f.password}
              onChange={(e) => setF({ ...f, password: e.target.value })}
            />
          </div>
          <button className="primary-btn" disabled={busy}>
            {isLogin ? <FiLogIn /> : <FiUserPlus />}{" "}
            {busy ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>
        <p className="auth-switch">
          {isLogin ? "New creator? " : "Already have an account? "}
          <Link to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Create account" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

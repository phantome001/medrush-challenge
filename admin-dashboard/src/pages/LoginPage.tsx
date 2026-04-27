import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { endpoints } from "../services/api";
import { saveSession } from "../utils/auth";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@medrush.com");
  const [password, setPassword] = useState("Admin123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await endpoints.login({ email, password });
      saveSession(session);
      navigate("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black text-medblue">MedRush Challenge</h1>
          <p className="mt-2 text-sm text-slate-500">Admin dashboard login</p>
        </div>
        {error ? <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium">Email</span>
          <input className="input" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium">Password</span>
          <input className="input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button className="btn w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
        <Link to="/landing" className="mt-4 block text-center text-sm font-semibold text-medblue">View public landing page</Link>
      </form>
    </div>
  );
};

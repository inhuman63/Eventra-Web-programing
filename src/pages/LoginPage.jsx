import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);
    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
      return;
    }

    if (result.role === "admin") navigate("/admin");
    else navigate("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-background">
      <div className="w-full max-w-[440px] relative z-10">
        <div className="mb-12 text-center">
          <h1 className="font-headline font-black text-3xl tracking-tighter text-primary">Eventra</h1>
          <p className="text-on-surface-variant mt-2">Enter your credentials to access your dashboard</p>
        </div>
        <div className="surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block uppercase tracking-widest font-bold text-on-surface-variant mb-2">Email Address</label>
              <input
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg"
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div>
              <label className="block uppercase tracking-widest font-bold text-on-surface-variant mb-2">Password</label>
              <input
                className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg"
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                value={password}
              />
            </div>
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <button className="w-full bg-signature-gradient text-white font-headline font-bold py-4 rounded-full" disabled={submitting} type="submit">
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
          <div className="mt-4 text-xs text-on-surface-variant bg-surface-container-low rounded-lg p-3">
            Demo hint: in local mode, an email containing "admin" logs into the admin flow.
          </div>
          <p className="text-on-surface-variant mt-6 text-center">
            Don&apos;t have an account? <Link className="text-primary font-bold" to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

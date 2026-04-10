import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (fullName.trim().length < 3) {
      setError("Please enter your full name (at least 3 characters).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    const result = await signup({ fullName, email, password, role });
    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
      return;
    }

    if (role === "admin") {
      navigate("/admin", { state: { message: "Account created. Welcome to the admin dashboard." } });
    } else {
      navigate("/events", { state: { message: "Account created. Explore events and register for your first ticket." } });
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] p-8">
        <h1 className="text-3xl font-headline font-bold mb-2">Create your Eventra account</h1>
        <p className="text-on-surface-variant mb-8">Create your account to browse events, register quickly, and use QR check-in.</p>
        <form className="grid md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <input className="px-4 py-3 bg-surface-container-highest rounded-lg" onChange={(e) => setFullName(e.target.value)} placeholder="Full name" required value={fullName} />
          <input className="px-4 py-3 bg-surface-container-highest rounded-lg" onChange={(e) => setEmail(e.target.value)} placeholder="Email" required type="email" value={email} />
          <input className="px-4 py-3 bg-surface-container-highest rounded-lg" onChange={(e) => setPassword(e.target.value)} placeholder="Password" required type="password" value={password} />
          <select className="px-4 py-3 bg-surface-container-highest rounded-lg" onChange={(e) => setRole(e.target.value)} value={role}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <p className="md:col-span-2 text-xs text-on-surface-variant bg-surface-container-low px-3 py-2 rounded-lg">
            Select Admin only for presentation or testing flows.
          </p>
          {error ? <p className="text-error md:col-span-2">{error}</p> : null}
          <button className="md:col-span-2 bg-signature-gradient text-white py-4 rounded-full font-bold" disabled={submitting} type="submit">
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <p className="mt-6 text-on-surface-variant">Already have an account? <Link className="text-primary font-bold" to="/login">Login</Link></p>
      </div>
    </main>
  );
}

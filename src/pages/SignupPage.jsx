import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const result = await signup({ fullName, email, password });
    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
      return;
    }

    navigate("/check-email", { state: { email } });
  }

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Global Header */}
      <header className="w-full px-6 py-8 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" data-icon="event_seat">event_seat</span>
          <span className="font-headline text-2xl font-black tracking-tighter text-primary">Eventra</span>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center px-4 pb-12">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] bg-white">
          {/* Left Side: Visual / Brand Content */}
          <div className="hidden lg:block relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/20 z-10"></div>
            <img alt="Grand conference hall" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBctiRg0A0eCrbbbo6-kOWKgluqKtF7lVnNuMC-7oaBnNhzM6a8mHgddQYlmYqyheYDKgvgZujhlcn4Rab6n8YISNJesURrG1I5zTndJIcZa6X6F3KOULkhDA2rWrE2Xo2jjxMEcR3WBjgyCHRjKoSa6jPSQHnKwNrQYC0nrYuq6bFfau4JyMPjqwtTm-oaw6_aNxjJjcxlK-r_9NmFO3REYkSb9NUy1z7WI1lZsc0GmWIyxWMiqrSD20QYBmB8eS9-Yk9_2Z-RFso" />
            <div className="relative z-20 h-full p-12 flex flex-col justify-end text-white">
              <div className="bg-primary-container/30 backdrop-blur-md p-8 rounded-xl border-white/10 border">
                <p className="font-label text-xs uppercase tracking-widest font-bold mb-4 text-primary-fixed">The Academic Curator</p>
                <h2 className="font-headline text-4xl font-extrabold tracking-tight mb-4 text-white">Precision in Every Connection.</h2>
                <p className="text-primary-fixed/80 text-body-md leading-relaxed">Join a community of professional curators managing world-class events with sophisticated digital tools.</p>
              </div>
            </div>
          </div>
          {/* Right Side: Sign Up Form */}
          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="mb-10">
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight mb-2">Create your account</h1>
              <p className="text-on-surface-variant font-body">Begin your journey into high-stakes event management.</p>
            </div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant px-1" htmlFor="name">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl" data-icon="person">person</span>
                  <input
                    className="w-full bg-surface-container-highest border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/60 input-focus-ring transition-all"
                    id="name"
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alexander Hamilton"
                    required
                    type="text"
                    value={fullName}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl" data-icon="alternate_email">alternate_email</span>
                  <input
                    className="w-full bg-surface-container-highest border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/60 input-focus-ring transition-all"
                    id="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="curator@eventra.io"
                    required
                    type="email"
                    value={email}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant px-1" htmlFor="password">Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl" data-icon="lock">lock</span>
                    <input
                      className="w-full bg-surface-container-highest border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/60 input-focus-ring transition-all"
                      id="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      type="password"
                      value={password}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-label text-xs uppercase tracking-widest font-bold text-on-surface-variant px-1" htmlFor="confirm_password">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl" data-icon="lock_reset">lock_reset</span>
                    <input
                      className="w-full bg-surface-container-highest border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-outline/60 input-focus-ring transition-all"
                      id="confirm_password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      type="password"
                      value={confirmPassword}
                    />
                  </div>
                </div>
              </div>
              {error ? <p className="text-sm text-error md:col-span-2">{error}</p> : null}
              <div className="pt-4">
                <button
                  className="w-full editorial-gradient text-white font-headline font-bold py-4 px-8 rounded-full shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  disabled={submitting}
                  type="submit"
                >
                  <span>{submitting ? "Creating account..." : "Primary Sign Up"}</span>
                  <span className="material-symbols-outlined text-xl" data-icon="arrow_forward">arrow_forward</span>
                </button>
              </div>
            </form>
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-on-surface-variant text-sm">
                Already have an account? <Link className="text-primary font-bold hover:underline underline-offset-4 decoration-2 decoration-primary/30 ml-1" to="/login">Login</Link>
              </p>
              <div className="flex items-center w-full gap-4 py-2">
                <div className="h-[1px] flex-grow bg-surface-container-high"></div>
                <span className="text-xs font-label uppercase tracking-widest text-outline">Social Access</span>
                <div className="h-[1px] flex-grow bg-surface-container-high"></div>
              </div>
              <div className="flex gap-4 w-full">
                <button className="flex-1 flex items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container-high py-3 rounded-lg transition-colors group" type="button">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" data-icon="google">google</span>
                  <span className="text-xs font-bold font-label uppercase tracking-wider">Google</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-surface-container-low hover:bg-surface-container-high py-3 rounded-lg transition-colors group" type="button">
                  <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors" data-icon="apple">ios</span>
                  <span className="text-xs font-bold font-label uppercase tracking-wider">Apple</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Simple Footer */}
      <footer className="w-full py-8 px-6 text-center">
        <p className="text-outline text-xs font-label uppercase tracking-[0.2em]">© 2024 Eventra Ecosystem. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

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
    <main className="flex-grow flex items-center justify-center p-6 relative overflow-hidden bg-background font-body text-on-surface min-h-screen selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-secondary-fixed blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary-fixed blur-[120px]"></div>
      </div>
      <div className="w-full max-w-[440px] relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-primary" data-icon="event_seat">event_seat</span>
            <span className="ml-2 font-headline font-black text-3xl tracking-tighter text-primary">Eventra</span>
          </div>
          <h1 className="font-headline headline-sm font-bold text-on-surface mb-2">Welcome back</h1>
          <p className="text-on-surface-variant body-md">Enter your credentials to access your dashboard</p>
        </div>
        <div className="surface-container-lowest p-8 rounded-xl shadow-[0_12px_32px_-4px_rgba(25,28,29,0.06)] bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block font-label label-md uppercase tracking-widest font-bold text-on-surface-variant mb-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all text-body-md text-on-surface placeholder:text-outline/60"
                  id="email"
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-label label-md uppercase tracking-widest font-bold text-on-surface-variant" htmlFor="password">Password</label>
                <a className="text-primary body-md font-medium hover:underline" href="#">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-surface-container-highest border-none rounded-lg focus:ring-2 focus:ring-primary/40 transition-all text-body-md text-on-surface placeholder:text-outline/60"
                  id="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                className="h-5 w-5 rounded border-none bg-surface-container-highest text-primary focus:ring-primary/40 focus:ring-offset-0 transition-all cursor-pointer"
                id="remember"
                name="remember"
                type="checkbox"
              />
              <label className="ml-3 text-body-md text-on-surface-variant cursor-pointer" htmlFor="remember">Remember me for 30 days</label>
            </div>
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <button
              className="w-full bg-signature-gradient text-white font-headline font-bold py-4 rounded-full shadow-lg hover:shadow-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Logging in..." : "Login"}
              <span className="material-symbols-outlined text-xl" data-icon="arrow_forward">arrow_forward</span>
            </button>
          </form>
          <div className="mt-4 text-xs text-on-surface-variant bg-surface-container-low rounded-lg p-3">
            Demo hint: in local mode, an email containing "admin" logs into the admin flow.
          </div>
          <div className="mt-8 pt-8 border-t border-surface-container flex flex-col items-center gap-4">
            <p className="text-body-md text-on-surface-variant">
              Don't have an account? <Link className="text-primary font-bold hover:underline" to="/signup">Sign Up</Link>
            </p>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <img alt="Trusted Partner 1" className="h-6 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFYZe856qua05VtRZRjmAlD9rnA9VoyA8JHwertwM3D8YV7MxdntKCoIdm_h0nGHJF6KMibUmA0UFvv8ooSph1nmsNGLrqjRIKKNMTFbYKEdb2RsPEDLz0zv-6vMZRsMCH3c9LT0yovfR39hmCFzgiecbezA5QLft_X_XI9lutfP1nUxuG7ns_mDol-RN_76si_UBPSFo_TRYQZnmhGuRNB3n9n-lJ7WztuFidNrgWOTKgk_RvwEtx2vLyzvdF22PQV6HcoSlkVMg" />
          <img alt="Trusted Partner 2" className="h-6 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrWZtHxzQP7CPhJHDweZAATMHpZyJfcIfukzbsRa5XzN3Xc66o8RyqQd0MYKZ2-UutJHtMOk2x2SZDm2EnZOWjbhl8v07GWkeZ7Q9bx3e_XwpfUs45IzQM6Pr6DVShh93flwWnrwoi925UYAg9HOExmBP6hgWcw1KLZN-wrkuz9mly_vT0PYxVoIZ5jqcanC-Ti72eA1CF4Zb1WtiNKtPILbYG5Y8MfWwfG7CQ9FvupqLdNg9C1MPg3K6snD5agfDUXBGfwHBhruw" />
          <img alt="Trusted Partner 3" className="h-6 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4OPr4H1YYOgIOWP9UW-eFBy1ujuQ2TywxBBv9-g7RmK4Bj1nwUqih_zukwOy-_4myjl3Ddca8TcGZ9JimFZB4cdB9DQYiDZ6E8c_4yknGcBJi3MUxOlYldRXTDKIQy4VCEMbABbgTCHbY-f-oG--sNKD6FH5a1ivHiqRdwULF6_9WL6Zdh0kMrRcoexRPDnocMEKLZbpx4h8WzODYa05TP0MRsZz0qTVskYpUgjgwMUuB2trXixxc9ALkRbng7FyQlvbFcbzKbss" />
        </div>
      </div>
      <div className="absolute bottom-8 right-8 hidden lg:block max-w-sm">
        <div className="bg-white/40 backdrop-blur-md p-6 rounded-xl border border-white/20">
          <div className="flex gap-4 items-start">
            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
              <img alt="Curator Quote" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_a13Wv304JhHjKOiFl9lY1ZSYegSJUb9Qyly_vGvGOFAkl2ZXdYUG3zgAiH-0Ph1oQ9sD7vJKa_2g1PmV8HQP8cxFu9s8O2H7GKO-_BbxdK4CeUUqkdt8T-bb6l3ulbKfOMguu7nVo558tfqdYoWvjdvNQDHXgwcer5xUlcDeN86HBtAXdtx3FfNRdOsyvmSDTPdQ68VUW9DZx5Nr0vJqsNjS61Yk4XiiPY6lPTVi2ZcBY0_mxnBxGIWNp7EYzWFKl9Xd30mzoa4" />
            </div>
            <div>
              <p className="text-body-md italic text-on-surface mb-2">"Eventra has transformed how we handle our high-stakes academic conferences. The precision is unmatched."</p>
              <p className="font-label label-md font-bold text-primary">Dr. Julian Vance, Global Curator</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicNav from "../components/PublicNav";
import { listBackendEvents } from "../lib/eventService";

export default function LandingPage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadFeaturedEvents() {
      try {
        const rows = await listBackendEvents();
        if (!isActive) return;
        setFeaturedEvents((rows || []).slice(0, 3));
      } catch (loadError) {
        if (!isActive) return;
        setError(loadError?.message || "Failed to load featured events.");
        setFeaturedEvents([]);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    loadFeaturedEvents();

    return () => {
      isActive = false;
    };
  }, []);

  function formatDate(dateValue) {
    if (!dateValue) return "Date TBD";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function formatPrice(priceValue) {
    const numericPrice = Number(priceValue);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return "Free";
    return `$${numericPrice.toFixed(2)}`;
  }

  return (
    <div className="bg-surface scroll-smooth">
      {/* TopNavBar */}
      <PublicNav />
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-surface py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <span className="font-label label-md uppercase tracking-widest font-bold text-primary mb-6 block">The Future of Event Entry</span>
              <h1 className="font-headline text-5xl lg:text-7xl font-extrabold tracking-tight text-on-surface mb-8 leading-[1.1]">
                Register for Events <span className="text-primary italic">in Minutes</span>
              </h1>
              <p className="font-body body-md text-lg text-on-surface-variant mb-12 leading-relaxed">
                Discover events, reserve your seat, and use your QR code for fast check-in. Experience seamless entry with our curated management platform.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/events" className="premium-gradient text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2">
                  Explore Events
                  <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                </Link>
                <Link to="/signup" className="bg-secondary-fixed text-on-secondary-fixed px-8 py-4 rounded-full font-semibold hover:bg-secondary-container transition-all active:scale-95">
                  Get Started
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-surface-container-low rounded-[2rem] p-4 aspect-[4/3] relative overflow-hidden shadow-2xl">
                <img alt="Event registration interface" className="w-full h-full object-cover rounded-[1.5rem]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDW1Q8VHuQovXyFvwb2DsCBLcgsxYBXTLLRCgmBmMEYijOJkkpxrmlYJjQ-Yv_nTvKJBY2E6VSTVRywej0dUH5CVEEgugZWxHFcrDE1xmtH2vs0V-v1lIvNFZLc0rKlUpvo4_8fIpbO-J_JC56UNBkVQnavbC1xmOohPptsfxhTA3slavILi4N4EBrduJvLWx3-KGHaFEKDzX-W5VAgU4JgskPgmJCTU9WIghUbkysx-QhB6AUg4is-QEERYJLH94jDVBsRGLTXYHw" />
                <div className="absolute bottom-8 left-8 bg-surface-container-lowest/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/20 max-w-xs">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-primary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary" data-icon="qr_code_2" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Instant Ticket</p>
                      <p className="text-sm font-bold">Tech Summit 2024</p>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="font-headline headline-sm text-4xl font-bold mb-4">Featured Events</h2>
                <p className="font-body text-on-surface-variant max-w-md">Hand-picked premium experiences curated just for you.</p>
              </div>
              <Link className="font-label label-md uppercase tracking-widest font-bold text-primary flex items-center gap-2 hover:gap-4 transition-all" to="/events">
                View All Events <span className="material-symbols-outlined">trending_flat</span>
              </Link>
            </div>

            {error ? <div className="mb-6 text-sm text-error text-center">{error}</div> : null}

            {loading ? (
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-on-surface-variant">
                Loading featured events...
              </div>
            ) : featuredEvents.length === 0 ? (
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center text-on-surface-variant">
                No featured events available right now.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {featuredEvents.map((event) => (
                  <div key={event.id} className="bg-surface-container-lowest rounded-xl overflow-hidden hover:translate-y-[-8px] transition-all duration-300">
                    <div className="aspect-video relative overflow-hidden bg-surface-container">
                      {event.image_url ? (
                        <img className="w-full h-full object-cover" src={event.image_url} alt={event.title || "Featured event"} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                          <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary">
                        {event.category || "General"}
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                        <span className="material-symbols-outlined text-sm" data-icon="calendar_today">calendar_today</span>
                        {formatDate(event.date)}
                      </div>
                      <h3 className="text-xl font-bold mb-4">{event.title}</h3>
                      <div className="flex items-center justify-between mt-auto pt-4">
                        <span className="text-on-surface-variant font-medium">{formatPrice(event.price)}</span>
                        <Link to={`/events/${event.id}`} className="text-primary font-bold flex items-center gap-1 hover:text-primary-container">
                          Book Now <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 bg-surface">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="font-headline headline-sm text-4xl font-bold mb-20">Seamless in Three Steps</h2>
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Path Line (Desktop) */}
              <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-px border-t border-dashed border-outline-variant -z-0"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-primary" data-icon="explore">explore</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Browse</h4>
                <p className="text-on-surface-variant font-body">Find the perfect event from our curated global list of high-profile gatherings.</p>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-on-primary-fixed" data-icon="how_to_reg">how_to_reg</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Register</h4>
                <p className="text-on-surface-variant font-body">Secure your spot instantly with our simplified, one-click registration process.</p>
              </div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-secondary-fixed rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <span className="material-symbols-outlined text-3xl text-on-secondary-fixed" data-icon="qr_code_scanner">qr_code_scanner</span>
                </div>
                <h4 className="text-xl font-bold mb-4">Scan</h4>
                <p className="text-on-surface-variant font-body">Walk in like a VIP. Show your digital QR code at the entrance for instant entry.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-headline headline-sm text-4xl font-bold mb-4">Designed for Precision</h2>
              <p className="text-on-surface-variant max-w-xl mx-auto">Every detail of the Eventra ecosystem is engineered to remove friction from your event experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-8 bg-surface-container-lowest rounded-xl hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-primary mb-6 block text-4xl" data-icon="bolt">bolt</span>
                <h5 className="text-lg font-bold mb-3">Instant Confirmation</h5>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">No waiting in line. Your tickets are issued immediately upon successful registration.</p>
              </div>
              {/* Feature 2 */}
              <div className="p-8 bg-surface-container-lowest rounded-xl hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-primary mb-6 block text-4xl" data-icon="shield_person">shield_person</span>
                <h5 className="text-lg font-bold mb-3">Secure Identity</h5>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">Your data is protected with enterprise-grade encryption and secure QR tokenization.</p>
              </div>
              {/* Feature 3 */}
              <div className="p-8 bg-surface-container-lowest rounded-xl hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-primary mb-6 block text-4xl" data-icon="notifications_active">notifications_active</span>
                <h5 className="text-lg font-bold mb-3">Live Updates</h5>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">Stay informed with real-time schedule changes and speaker announcements.</p>
              </div>
              {/* Feature 4 */}
              <div className="p-8 bg-surface-container-lowest rounded-xl hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-primary mb-6 block text-4xl" data-icon="account_balance_wallet">account_balance_wallet</span>
                <h5 className="text-lg font-bold mb-3">Digital Wallet</h5>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">Keep all your event history and upcoming passes in one centralized mobile wallet.</p>
              </div>
              {/* Feature 5 */}
              <div className="p-8 bg-surface-container-lowest rounded-xl hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-primary mb-6 block text-4xl" data-icon="groups">groups</span>
                <h5 className="text-lg font-bold mb-3">Networking Hub</h5>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">Connect with other attendees and speakers before the main event starts.</p>
              </div>
              {/* Feature 6 */}
              <div className="p-8 bg-surface-container-lowest rounded-xl hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-primary mb-6 block text-4xl" data-icon="analytics">analytics</span>
                <h5 className="text-lg font-bold mb-3">Smart Insights</h5>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed">Personalized recommendations based on your professional interests and history.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="py-24 bg-surface">
          <div className="max-w-5xl mx-auto px-6">
            <div className="premium-gradient rounded-[2.5rem] p-12 lg:p-20 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <circle cx="10" cy="10" fill="white" r="50"></circle>
                  <circle cx="90" cy="90" fill="white" r="40"></circle>
                </svg>
              </div>
              <h2 className="font-headline text-4xl lg:text-5xl font-extrabold mb-8 relative z-10">Ready for your next event?</h2>
              <p className="text-lg opacity-90 mb-12 max-w-2xl mx-auto relative z-10 font-body">Join over 50,000 curators and attendees who choose Eventra for high-fidelity event management.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                <input className="w-full sm:w-80 px-6 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 focus:outline-none transition-all" placeholder="Enter your email" type="email" />
                <button className="bg-white text-primary px-8 py-4 rounded-full font-bold hover:bg-on-primary-fixed transition-all active:scale-95" type="button">Subscribe Now</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="text-3xl font-black tracking-tighter text-white mb-6">Eventra</div>
              <p className="text-sm opacity-70 leading-relaxed font-body">Curation meets precision. The premier platform for high-stakes event management and attendance.</p>
            </div>
            <div>
              <h6 className="font-headline font-bold mb-6 text-white uppercase text-xs tracking-widest">Platform</h6>
              <ul className="space-y-4 text-sm opacity-70">
                <li><Link className="hover:text-white hover:opacity-100 transition-all" to="/events">Browse Events</Link></li>
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">Pricing Plans</a></li>
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">Help Center</a></li>
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-headline font-bold mb-6 text-white uppercase text-xs tracking-widest">Company</h6>
              <ul className="space-y-4 text-sm opacity-70">
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">About Us</a></li>
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">Careers</a></li>
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">Blog</a></li>
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h6 className="font-headline font-bold mb-6 text-white uppercase text-xs tracking-widest">Legal</h6>
              <ul className="space-y-4 text-sm opacity-70">
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">Terms of Service</a></li>
                <li><a className="hover:text-white hover:opacity-100 transition-all" href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50 text-xs">
            <p>© 2024 Eventra Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <a className="hover:text-white transition-colors" href="#">Twitter</a>
              <a className="hover:text-white transition-colors" href="#">LinkedIn</a>
              <a className="hover:text-white transition-colors" href="#">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

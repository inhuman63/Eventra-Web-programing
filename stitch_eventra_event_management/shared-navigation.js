(function () {
  const current = window.location.pathname.replace(/\\/g, "/").toLowerCase();

  function go(path) {
    if (current.endsWith(path)) return;
    window.location.href = path;
  }

  const routes = {
    home: "../landing_page/code.html",
    events: "../event_listing/code.html",
    eventDetails: "../event_details/code.html",
    login: "../login_page/code.html",
    signup: "../sign_up_page/code.html",
    userDashboard: "../user_dashboard/code.html",
    ticket: "../qr_ticket/code.html",
    adminDashboard: "../admin_dashboard/code.html",
    addEvent: "../add_event_admin/code.html",
    manageEvents: "../manage_events_admin/code.html",
    participants: "../participants_admin/code.html",
    report: "../attendance_report_admin/code.html",
    scanner: "../qr_scanner_admin/code.html"
  };

  function routeElement(el, target) {
    if (!el) return;
    if (el.tagName === "A") el.setAttribute("href", target);
    el.addEventListener("click", function (e) {
      e.preventDefault();
      go(target);
    });
  }

  function clickByText(selector, textMatchers, target) {
    document.querySelectorAll(selector).forEach((el) => {
      const text = (el.textContent || "").trim().toLowerCase();
      const matches = textMatchers.some((matcher) => text.includes(matcher));
      if (!matches) return;
      routeElement(el, target);
    });
  }

  function wireGlobalIdentity() {
    const brandCandidates = [
      ...Array.from(document.querySelectorAll("nav .text-2xl, nav .font-black, header .text-2xl, header .font-black")),
      ...Array.from(document.querySelectorAll("header .font-headline, header .font-bold"))
    ];

    brandCandidates.forEach((el) => {
      const text = (el.textContent || "").trim().toLowerCase();
      if (text.includes("eventra")) {
        el.style.cursor = "pointer";
        routeElement(el, routes.home);
      }
    });
  }

  function linkAdminSidebar() {
    const items = [
      { key: "dashboard", target: routes.adminDashboard },
      { key: "events", target: routes.manageEvents },
      { key: "add event", target: routes.addEvent },
      { key: "participants", target: routes.participants },
      { key: "attendance scanner", target: routes.scanner },
      { key: "attendance report", target: routes.report },
      { key: "logout", target: routes.login }
    ];

    document.querySelectorAll("aside a").forEach((a) => {
      const text = (a.textContent || "").trim().toLowerCase();
      const hit = items.find((it) => text.includes(it.key));
      if (!hit) return;
      routeElement(a, hit.target);
    });
  }

  function wireTopNav() {
    document.querySelectorAll("nav").forEach((nav) => {
      const links = nav.querySelectorAll("a");
      links.forEach((a) => {
        const text = (a.textContent || "").trim().toLowerCase();
        if (text.includes("home")) routeElement(a, routes.home);
        if (text.includes("events")) routeElement(a, routes.events);
        if (text.includes("login")) routeElement(a, routes.login);
        if (text.includes("register") || text.includes("sign up")) routeElement(a, routes.signup);
      });
    });
  }

  function wirePublicButtons() {
    clickByText("button, a", ["explore events", "view all events", "book now", "load more events"], routes.events);
    clickByText("button, a", ["get started"], routes.signup);
    clickByText("button, a", ["register & get qr", "view my qr", "view qr", "download ticket"], routes.ticket);
    clickByText("button, a", ["add to calendar"], routes.userDashboard);
    clickByText("button, a", ["subscribe now"], routes.signup);
  }

  function wireEventListingGrid() {
    if (!current.includes("/event_listing/")) return;

    const cards = document.querySelectorAll("main section .group, main section > div");
    cards.forEach((card) => {
      const buttons = card.querySelectorAll("button, a");
      buttons.forEach((btn) => {
        const text = (btn.textContent || "").trim().toLowerCase();
        if (text.includes("register") || text.includes("waitlist") || text.includes("arrow_forward")) {
          routeElement(btn, routes.eventDetails);
        }
      });
    });
  }

  function wireAdminButtons() {
    clickByText("button, a", ["create new event", "new event", "add participant"], routes.addEvent);
    clickByText("button, a", ["publish event", "save changes"], routes.manageEvents);
    clickByText("button, a", ["export reports", "export csv", "export data"], routes.report);
    clickByText("button, a", ["manual code"], routes.scanner);
    clickByText("button, a", ["mark present", "check in"], routes.participants);
    clickByText("button, a", ["view participants", "participants"], routes.participants);
    clickByText("button, a", ["attendance report"], routes.report);
    clickByText("button, a", ["open scanner", "attendance scanner"], routes.scanner);
  }

  function wireAuthForms() {
    const loginForm = document.querySelector("form[action='#'], form");
    if (current.includes("/login_page/") && loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const emailInput = document.querySelector("input[type='email']");
        const email = (emailInput && emailInput.value ? emailInput.value : "").toLowerCase();
        if (email.includes("admin")) go(routes.adminDashboard);
        else go(routes.userDashboard);
      });
    }

    if (current.includes("/sign_up_page/")) {
      document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          go(routes.events);
        });
      });
    }

    clickByText("a, button", ["sign up"], routes.signup);
    clickByText("a, button", ["login"], routes.login);
  }

  function wireSpecificScreens() {
    if (current.includes("/event_listing/")) {
      clickByText("button, a", ["register", "waitlist only"], routes.eventDetails);
    }

    if (current.includes("/event_details/")) {
      clickByText("button, a", ["view my qr"], routes.ticket);
      clickByText("button, a", ["invite your team"], routes.userDashboard);
      clickByText("button, a", ["register", "book now"], routes.ticket);
    }

    if (current.includes("/qr_ticket/")) {
      clickByText("a, button", ["contact support team"], routes.userDashboard);
      clickByText("a, button", ["print"], routes.ticket);
    }

    if (current.includes("/user_dashboard/")) {
      clickByText("a, button", ["explore events"], routes.events);
      clickByText("a, button", ["unregister", "cancel waitlist"], routes.userDashboard);
      clickByText("a, button", ["view qr"], routes.ticket);
    }

    if (current.includes("/manage_events_admin/") || current.includes("/participants_admin/") || current.includes("/attendance_report_admin/") || current.includes("/qr_scanner_admin/") || current.includes("/add_event_admin/") || current.includes("/admin_dashboard/")) {
      clickByText("button, a", ["new event", "create new event", "add event"], routes.addEvent);
      clickByText("button, a", ["events"], routes.manageEvents);
      clickByText("button, a", ["participants"], routes.participants);
      clickByText("button, a", ["attendance report", "analytics"], routes.report);
      clickByText("button, a", ["scanner"], routes.scanner);
    }
  }

  function normalizeBrokenHrefs() {
    document.querySelectorAll("a[href='#']").forEach((a) => {
      const text = (a.textContent || "").trim().toLowerCase();
      if (!text) return;
      if (text.includes("support") || text.includes("privacy") || text.includes("terms") || text.includes("documentation")) {
        return;
      }
      a.setAttribute("href", "javascript:void(0)");
    });
  }

  normalizeBrokenHrefs();
  wireGlobalIdentity();
  wireTopNav();
  wirePublicButtons();
  wireEventListingGrid();
  linkAdminSidebar();
  wireAdminButtons();
  wireAuthForms();
  wireSpecificScreens();
})();

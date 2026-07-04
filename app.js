document.addEventListener("DOMContentLoaded", () => {

  /* LOADER */
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => loader.classList.add("hidden"), 800);
    setTimeout(() => loader.style.display = "none", 1400);
  }

  /* RTL / LANGUAGE */
  const LANG_KEY = "prestige-lang";
  let currentLang = localStorage.getItem(LANG_KEY) || "en";

  const translations = { en: {}, ar: {} };

  function collectTranslations() {
    translations.en = {};
    translations.ar = {};
    document.querySelectorAll("[data-en][data-ar]").forEach(el => {
      const key = el.tagName + "-" + (el.id || Math.random().toString(36).slice(2, 6));
      translations.en[key] = el.getAttribute("data-en");
      translations.ar[key] = el.getAttribute("data-ar");
      el.dataset.transKey = key;
    });
    document.querySelectorAll("[data-en-placeholder]").forEach(el => {
      const key = "ph-" + (el.id || Math.random().toString(36).slice(2, 6));
      translations.en[key] = el.getAttribute("data-en-placeholder");
      translations.ar[key] = el.getAttribute("data-ar-placeholder");
      el.dataset.placeholderKey = key;
    });
  }

  function applyLang(lang) {
    const html = document.documentElement;
    const isRtl = lang === "ar";
    html.setAttribute("dir", isRtl ? "rtl" : "ltr");
    html.setAttribute("lang", lang);
    document.body.setAttribute("dir", isRtl ? "rtl" : "ltr");

    document.querySelectorAll("[data-en][data-ar]").forEach(el => {
      if (translations.en[el.dataset.transKey]) {
        const text = lang === "ar" ? translations.ar[el.dataset.transKey] : translations.en[el.dataset.transKey];
        el.childNodes.forEach((node, i) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            node.textContent = node.textContent.replace(/\S[\s\S]*\S|\S/g, text);
          }
        });
        if (el.children.length === 0) el.textContent = text;
      }
    });

    document.querySelectorAll("[data-en-placeholder]").forEach(el => {
      if (translations.en[el.dataset.placeholderKey]) {
        el.placeholder = lang === "ar"
          ? translations.ar[el.dataset.placeholderKey]
          : translations.en[el.dataset.placeholderKey];
      }
    });

    const langBtn = document.getElementById("langToggle");
    if (langBtn) langBtn.textContent = lang === "ar" ? "English" : "عربي";

    localStorage.setItem(LANG_KEY, lang);
    currentLang = lang;
  }

  collectTranslations();
  applyLang(currentLang);

  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      applyLang(currentLang === "en" ? "ar" : "en");
    });
  }

  /* NAVBAR */
  const navbar = document.getElementById("navbar");
  let lastScroll = 0;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 60);

    if (y > 120 && y > lastScroll) {
      navbar.style.transform = "translateY(-100%)";
    } else {
      navbar.style.transform = "translateY(0)";
    }
    lastScroll = y;
  }, { passive: true });

  /* HAMBURGER */
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const navOverlay = document.getElementById("navOverlay");

  function closeMenu() {
    navLinks.classList.remove("open");
    hamburger.classList.remove("open");
    if (navOverlay) navOverlay.classList.remove("active");
    document.body.style.overflow = "";
    if (hamburger) hamburger.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    navLinks.classList.add("open");
    hamburger.classList.add("open");
    if (navOverlay) navOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    if (hamburger) hamburger.setAttribute("aria-expanded", "true");
  }

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      if (navLinks.classList.contains("open")) closeMenu();
      else openMenu();
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", closeMenu);
  }

  document.querySelectorAll(".nav-links a:not(.nav-dropdown > a)").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.querySelectorAll(".nav-dropdown > a").forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        toggle.parentElement.classList.toggle("open");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) closeMenu();
  });

  /* ACTIVE NAV LINK */
  const sections = document.querySelectorAll("section[id]");
  const navLinkItems = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const top = section.offsetTop - 200;
      if (window.scrollY >= top) current = section.getAttribute("id");
    });
    navLinkItems.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) link.classList.add("active");
    });
  }, { passive: true });

  /* SCROLL REVEAL */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute("data-delay")) || 0;
          setTimeout(() => el.classList.add("visible"), delay);
          revealObserver.unobserve(el);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

  /* HERO CANVAS PARTICLES */
  const canvas = document.getElementById("heroCanvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let particles = [];
    let animId;

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function createParticles() {
      const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
      }));
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${p.alpha})`;
        ctx.fill();
      });

      particles.forEach((a, i) => {
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(201, 169, 110, ${0.05 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animId = requestAnimationFrame(drawParticles);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        createParticles();
      }, 200);
    });

    resizeCanvas();
    createParticles();
    drawParticles();
  }

  /* HERO STAT COUNTERS */
  function animateHeroStats() {
    document.querySelectorAll(".hero-stat-num").forEach(stat => {
      const target = parseInt(stat.getAttribute("data-target"));
      if (!target || stat.textContent !== "0") return;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target;
          clearInterval(timer);
        } else {
          stat.textContent = Math.round(current);
        }
      }, duration / steps);
    });
  }

  const heroSection = document.getElementById("hero");
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateHeroStats();
          heroObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    heroObserver.observe(heroSection);
  }

  /* STATS COUNTERS */
  const statNumbers = document.querySelectorAll(".stat-item .stat-number");
  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute("data-target"));
      if (!target) return;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target;
          clearInterval(timer);
        } else {
          stat.textContent = Math.round(current);
        }
      }, duration / steps);
    });
  }

  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    statsObserver.observe(statsSection);
  }

  /* TESTIMONIALS */
  const testimonialCards = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".dot");
  let currentTestimonial = 0;
  let testimonialInterval;

  function showTestimonial(index) {
    testimonialCards.forEach(t => t.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));
    if (testimonialCards[index]) testimonialCards[index].classList.add("active");
    if (dots[index]) dots[index].classList.add("active");
    currentTestimonial = index;
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.getAttribute("data-index"));
      clearInterval(testimonialInterval);
      showTestimonial(idx);
      startTestimonialInterval();
    });

    dot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        dot.click();
      }
    });
  });

  function startTestimonialInterval() {
    if (testimonialCards.length < 2) return;
    testimonialInterval = setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
      showTestimonial(currentTestimonial);
    }, 5000);
  }

  startTestimonialInterval();

  /* TOUCH SWIPE FOR TESTIMONIALS */
  const slider = document.querySelector(".testimonial-slider");
  if (slider) {
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    slider.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      const isRtl = document.documentElement.getAttribute("dir") === "rtl";
      if (Math.abs(diff) > 50) {
        clearInterval(testimonialInterval);
        if (diff > 0 && !isRtl) {
          currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
        } else if (diff < 0 && !isRtl) {
          currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
        } else if (diff > 0 && isRtl) {
          currentTestimonial = (currentTestimonial - 1 + testimonialCards.length) % testimonialCards.length;
        } else {
          currentTestimonial = (currentTestimonial + 1) % testimonialCards.length;
        }
        showTestimonial(currentTestimonial);
        startTestimonialInterval();
      }
    }, { passive: true });
  }

  /* FAQ */
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");
      item.closest(".faq-list").querySelectorAll(".faq-item.open").forEach(other => {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", !isOpen);
    });
  });

  /* CONTACT FORM */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("name");
      const email = document.getElementById("email");
      const message = document.getElementById("message");
      let hasError = false;

      [name, email, message].forEach(field => {
        const errorEl = field.closest(".form-group").querySelector(".form-error");
        if (errorEl) {
          errorEl.textContent = "";
          errorEl.classList.remove("visible");
        }
      });

      if (!name.value.trim()) {
        const errorEl = name.closest(".form-group").querySelector(".form-error");
        if (errorEl) {
          errorEl.textContent = currentLang === "ar" ? "يرجى إدخال الاسم" : "Please enter your name";
          errorEl.classList.add("visible");
        }
        hasError = true;
      }

      if (!email.value.trim() || !email.value.includes("@")) {
        const errorEl = email.closest(".form-group").querySelector(".form-error");
        if (errorEl) {
          errorEl.textContent = currentLang === "ar" ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email";
          errorEl.classList.add("visible");
        }
        hasError = true;
      }

      if (!message.value.trim()) {
        const errorEl = message.closest(".form-group").querySelector(".form-error");
        if (errorEl) {
          errorEl.textContent = currentLang === "ar" ? "يرجى إدخال رسالتك" : "Please enter your message";
          errorEl.classList.add("visible");
        }
        hasError = true;
      }

      if (hasError) return;

      const data = {
        name: name.value,
        email: email.value,
        phone: document.getElementById("phone")?.value || "",
        vehicle: document.getElementById("vehicle")?.value || "",
        service: document.getElementById("serviceInterest")?.value || "",
        message: message.value,
      };

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalHtml = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (currentLang === "ar" ? "جاري الإرسال..." : "Sending...");
      submitBtn.disabled = true;

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> ' + (currentLang === "ar" ? "تم الإرسال!" : "Message Sent!");
          submitBtn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
          contactForm.reset();
          setTimeout(() => {
            submitBtn.innerHTML = originalHtml;
            submitBtn.style.background = "";
            submitBtn.disabled = false;
          }, 3000);
        } else throw new Error("Failed");
      } catch {
        submitBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> ' + (currentLang === "ar" ? "حاول مرة أخرى" : "Try Again");
        submitBtn.disabled = false;
      }
    });
  }

  /* BUTTON RIPPLE */
  document.querySelectorAll(".btn:not(.btn-block)").forEach(btn => {
    btn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const r = document.createElement("span");
      r.className = "ripple";
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + "px";
      r.style.left = (e.clientX - rect.left - size / 2) + "px";
      r.style.top = (e.clientY - rect.top - size / 2) + "px";
      this.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  });

  if (!document.querySelector("style.ripple-style")) {
    const rippleStyle = document.createElement("style");
    rippleStyle.className = "ripple-style";
    rippleStyle.textContent = `
      .btn { position: relative; overflow: hidden; }
      .ripple {
        position: absolute; border-radius: 50%;
        background: rgba(255,255,255,0.3);
        transform: scale(0);
        animation: rippleAnim 0.6s ease-out;
        pointer-events: none; z-index: 5;
      }
      @keyframes rippleAnim { to { transform: scale(4); opacity: 0; } }
    `;
    document.head.appendChild(rippleStyle);
  }

  /* SMOOTH SCROLL */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        e.preventDefault();
        const offset = (navbar ? navbar.offsetHeight : 80) + 20;
        window.scrollTo({
          top: target.offsetTop - offset,
          behavior: "smooth",
        });
      }
    });
  });

  /* BACK TO TOP */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", window.scrollY > 500);
    }, { passive: true });

    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
});

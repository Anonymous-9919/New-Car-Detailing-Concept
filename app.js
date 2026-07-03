let currentLang = localStorage.getItem("nvm-lang") || "en";

function toggleLang() {
  currentLang = currentLang === "en" ? "ar" : "en";
  applyLang(currentLang);
}

function applyLang(lang) {
  const html = document.documentElement;
  html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  html.setAttribute("lang", lang);
  document.body.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  const btn = document.getElementById("langToggle");
  if (btn) btn.textContent = lang === "ar" ? "English" : "عربي";
  localStorage.setItem("nvm-lang", lang);
  currentLang = lang;
}

document.addEventListener("DOMContentLoaded", () => {
  applyLang(currentLang);

  // Mobile Menu
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (hamburger) hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    hamburger.classList.toggle("open");
  });

  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 768 && link.closest(".dropdown")) {
        return;
      }
      navLinks.classList.remove("open");
      hamburger.classList.remove("open");
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll("section[id]");
  const navLinkItems = document.querySelectorAll(".nav-links > li > a");

  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute("id");
      }
    });
    navLinkItems.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === "#" + current) {
        link.classList.add("active");
      }
    });
  });

  // Dropdown toggle on mobile
  document.querySelectorAll(".dropdown > a").forEach(link => {
    link.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        link.parentElement.classList.toggle("open");
      }
    });
  });

  // Testimonials Slider
  const testimonials = document.querySelectorAll(".testimonial-card");
  const dots = document.querySelectorAll(".dot");
  let currentTestimonial = 0;

  function showTestimonial(index) {
    testimonials.forEach(t => t.classList.remove("active"));
    dots.forEach(d => d.classList.remove("active"));
    testimonials[index].classList.add("active");
    dots[index].classList.add("active");
    currentTestimonial = index;
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showTestimonial(index));
  });

  setInterval(() => {
    currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    showTestimonial(currentTestimonial);
  }, 5000);

  // Stats Counter
  const statNumbers = document.querySelectorAll(".stat-number");
  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;

    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute("data-target"));
      let current = 0;
      const increment = Math.ceil(target / 60);
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) {
          stat.textContent = target;
          clearInterval(interval);
        } else {
          stat.textContent = current;
        }
      }, 30);
    });
  }

  const statsSection = document.querySelector(".stats-section");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  if (statsSection) observer.observe(statsSection);

  // Scroll reveal animation
  const revealElements = document.querySelectorAll(
    ".service-card, .why-card, .gallery-item, .about-grid, .contact-grid"
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    revealObserver.observe(el);
  });

  // Contact Form
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = {
        name: formData.get("name") || contactForm.querySelector('input[type="text"]').value,
        email: formData.get("email") || contactForm.querySelector('input[type="email"]').value,
        phone: contactForm.querySelector('input[type="tel"]')?.value || "",
        service: contactForm.querySelector("select")?.value || "",
        message: contactForm.querySelector("textarea").value,
      };

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          submitBtn.textContent = "Message Sent!";
          submitBtn.style.background = "linear-gradient(135deg, #22c55e, #16a34a)";
          contactForm.reset();
          setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.style.background = "";
            submitBtn.disabled = false;
          }, 3000);
        } else {
          throw new Error("Failed to send");
        }
      } catch (err) {
        submitBtn.textContent = "Try Again";
        submitBtn.disabled = false;
        alert("Something went wrong. Please WhatsApp us directly.");
      }
    });
  }

  // FAQ Accordion
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");

      item.parentElement.querySelectorAll(".faq-item.open").forEach(other => {
        if (other !== item) other.classList.remove("open");
      });

      item.classList.toggle("open", !isOpen);
    });
  });

  // Hero video parallax effect
  const heroVideo = document.querySelector(".hero-video video");
  if (heroVideo) {
    window.addEventListener("mousemove", (e) => {
      if (window.innerWidth > 768) {
        const x = ((e.clientX / window.innerWidth) - 0.5) * 8;
        const y = ((e.clientY / window.innerHeight) - 0.5) * 8;
        heroVideo.style.transform = `scale(1.1) translate(${x}px, ${y}px)`;
      }
    });
  }
});

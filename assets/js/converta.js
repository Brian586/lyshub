/* =========================================================================
   Lyshub Technologies — UI behaviour for the Converta-style front end.
   Vanilla JS, no dependencies.
   ========================================================================= */
(function () {
   "use strict";

   /* ---- Sticky header ---- */
   var header = document.querySelector(".site-header");

   function onScroll() {
      if (header) {
         header.classList.toggle("is-stuck", window.scrollY > 40);
      }
      var top = document.querySelector(".to-top");
      if (top) {
         top.classList.toggle("show", window.scrollY > 500);
      }
   }

   window.addEventListener("scroll", onScroll, { passive: true });
   onScroll();

   /* ---- Mobile navigation ---- */
   var drawer = document.querySelector(".mobile-nav");
   var overlay = document.querySelector(".nav-overlay");

   function closeNav() {
      if (drawer) drawer.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
      document.body.classList.remove("body-lock");
   }

   function openNav() {
      if (drawer) drawer.classList.add("open");
      if (overlay) overlay.classList.add("open");
      document.body.classList.add("body-lock");
   }

   var toggle = document.querySelector(".nav-toggle");
   if (toggle) toggle.addEventListener("click", openNav);

   var closeBtn = document.querySelector(".mobile-nav-close");
   if (closeBtn) closeBtn.addEventListener("click", closeNav);
   if (overlay) overlay.addEventListener("click", closeNav);

   document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
   });

   /* ---- Accordion ---- */
   document.querySelectorAll(".accordion").forEach(function (group) {
      group.addEventListener("click", function (e) {
         var trigger = e.target.closest(".accordion-trigger");
         if (!trigger || !group.contains(trigger)) return;

         var item = trigger.closest(".accordion-item");
         var isOpen = item.classList.contains("open");

         group.querySelectorAll(".accordion-item").forEach(function (other) {
            other.classList.remove("open");
            var t = other.querySelector(".accordion-trigger");
            if (t) t.setAttribute("aria-expanded", "false");
         });

         if (!isOpen) {
            item.classList.add("open");
            trigger.setAttribute("aria-expanded", "true");
         }
      });
   });

   /* ---- Scroll reveal ----
      Cards injected later by the data modules call refreshReveal() through the
      "lyshub:rendered" event, so they animate in the same way as static markup. */
   var revealObserver = null;

   if ("IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver(function (entries) {
         entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
            setTimeout(function () {
               el.classList.add("in");
            }, delay);
            revealObserver.unobserve(el);
         });
      }, { rootMargin: "0px 0px -80px 0px", threshold: 0.08 });
   }

   function refreshReveal(root) {
      var scope = root || document;
      scope.querySelectorAll("[data-reveal]:not(.in)").forEach(function (el) {
         if (revealObserver) {
            revealObserver.observe(el);
         } else {
            el.classList.add("in");
         }
      });
   }

   refreshReveal();
   window.refreshReveal = refreshReveal;
   document.addEventListener("lyshub:rendered", function (e) {
      refreshReveal(e.detail && e.detail.list ? e.detail.list : document);
   });

   /* ---- Counters ---- */
   var counters = document.querySelectorAll("[data-count-to]");
   if ("IntersectionObserver" in window && counters.length) {
      var co = new IntersectionObserver(function (entries) {
         entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            countUp(entry.target);
            co.unobserve(entry.target);
         });
      }, { threshold: 0.4 });

      counters.forEach(function (el) {
         co.observe(el);
      });
   } else {
      counters.forEach(countUp);
   }

   function countUp(el) {
      var target = parseFloat(el.getAttribute("data-count-to")) || 0;
      var suffix = el.getAttribute("data-count-suffix") || "";
      var duration = 1400;
      var start = null;

      function tick(ts) {
         if (start === null) start = ts;
         var progress = Math.min((ts - start) / duration, 1);
         var eased = 1 - Math.pow(1 - progress, 3);
         el.textContent = Math.round(target * eased) + suffix;
         if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
   }

   /* ---- Hero slide rotation ---- */
   var slideWrap = document.querySelector(".hero-slides");
   if (slideWrap) {
      var slides = Array.prototype.slice.call(slideWrap.querySelectorAll(".hero-slide"));
      var dotsWrap = document.querySelector(".hero-dots");
      var index = 0;
      var timer;

      if (slides.length > 1 && dotsWrap) {
         slides.forEach(function (_, i) {
            var dot = document.createElement("button");
            dot.type = "button";
            dot.setAttribute("aria-label", "Show slide " + (i + 1));
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", function () {
               show(i);
               restart();
            });
            dotsWrap.appendChild(dot);
         });

         var dots = Array.prototype.slice.call(dotsWrap.children);

         var show = function (i) {
            index = i;
            slides.forEach(function (s, n) {
               s.classList.toggle("active", n === i);
            });
            dots.forEach(function (d, n) {
               d.classList.toggle("active", n === i);
            });
         };

         var restart = function () {
            clearInterval(timer);
            timer = setInterval(function () {
               show((index + 1) % slides.length);
            }, 6500);
         };

         restart();
      } else if (dotsWrap) {
         dotsWrap.remove();
      }
   }

   /* ---- Project / portfolio filters ---- */
   document.querySelectorAll("[data-filter-group]").forEach(function (group) {
      var targetSel = group.getAttribute("data-filter-group");
      var list = document.querySelector(targetSel);
      if (!list) return;

      group.addEventListener("click", function (e) {
         var btn = e.target.closest("button[data-filter]");
         if (!btn) return;

         group.querySelectorAll("button").forEach(function (b) {
            b.classList.remove("active");
         });
         btn.classList.add("active");

         var key = btn.getAttribute("data-filter");
         list.querySelectorAll("[data-category]").forEach(function (item) {
            var cats = (item.getAttribute("data-category") || "").split(/\s+/);
            item.style.display = key === "all" || cats.indexOf(key) !== -1 ? "" : "none";
         });
      });
   });

   /* ---- Share buttons ---- */
   document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-share]");
      if (!btn) return;
      e.preventDefault();

      var network = btn.getAttribute("data-share");
      var url = btn.getAttribute("data-url") || window.location.href;
      var title = btn.getAttribute("data-title") || document.title;
      var abs = new URL(url, window.location.href).href;
      var map = {
         facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(abs),
         twitter: "https://twitter.com/intent/tweet?url=" + encodeURIComponent(abs) + "&text=" + encodeURIComponent(title),
         linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(abs),
         whatsapp: "https://api.whatsapp.com/send?text=" + encodeURIComponent(title + " " + abs)
      };

      if (map[network]) window.open(map[network], "_blank", "noopener,width=620,height=560");
   });

   /* ---- Current year ---- */
   document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
   });

   /* ---- Simple form validation + status feedback ---- */
   document.querySelectorAll("form[data-validate]").forEach(function (form) {
      var status = form.querySelector(".form-status");

      form.addEventListener("submit", function (e) {
         var invalid = false;

         form.querySelectorAll("[required]").forEach(function (input) {
            var value = (input.value || "").trim();
            var ok = value !== "";
            if (ok && input.type === "email") {
               ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
            }
            input.style.borderColor = ok ? "" : "#d24b4b";
            if (!ok) invalid = true;
         });

         if (invalid) {
            e.preventDefault();
            if (status) {
               status.textContent = "Please fill in all required fields with valid details.";
               status.className = "form-status show err";
            }
         }
      });
   });

   /* ---- Back to top ---- */
   var topBtn = document.querySelector(".to-top");
   if (topBtn) {
      topBtn.addEventListener("click", function () {
         window.scrollTo({ top: 0, behavior: "smooth" });
      });
   }
})();

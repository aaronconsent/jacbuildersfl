/* tighten.js — runtime half of the UX cleanup overlay.
   Surgically removes the broken OC widget + its auto-popup, the mobile social
   bar, and redundant repeat CTAs — WITHOUT touching the legitimate booking
   form popup (Elementor popup id 3011) that Book Now / Get My Free Roof Report
   open on click. */
(function () {
  "use strict";

  function removeWidget(el) {
    var w = el.closest(".elementor-widget") || el;
    w.remove();
  }

  function clean() {
    // 1. Broken Owens Corning roof-designer widgets (iframe never loads).
    document.querySelectorAll(".oc_shingle_view").forEach(removeWidget);

    // 2. Remove the OC "Get Your Free Online Quote" auto-popup (Elementor popup
    //    template id 6576). The booking-form popup (id 3011) is left untouched
    //    so Book Now / Get My Free Roof Report still open it on click. Also
    //    close any *visible* (auto-opened) popup that has no form, but never the
    //    booking popup — guards against the OC popup opening before removal.
    document.querySelectorAll('[data-elementor-id="6576"]').forEach(function (n) {
      (n.closest(".elementor-popup-modal") || n).remove();
    });
    document.querySelectorAll(".elementor-popup-modal").forEach(function (m) {
      var visible = getComputedStyle(m).display !== "none" && m.offsetParent !== null;
      if (visible && !m.querySelector('[data-elementor-id="3011"]') && !m.querySelector("form")) {
        m.remove();
      }
    });
    document.body.classList.remove("elementor-popup-modal-open");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    // 3. Mobile bottom social bar: a fixed/sticky element (not the header)
    //    anchored near the bottom that holds social links.
    var vh = window.innerHeight;
    document.querySelectorAll("body *").forEach(function (el) {
      if (el.closest(".fusion-header-wrapper")) return;
      var cs = getComputedStyle(el);
      if (cs.position !== "fixed" && cs.position !== "sticky") return;
      if (cs.display === "none") return;
      var r = el.getBoundingClientRect();
      var nearBottom = r.bottom >= vh - 5 && r.height < vh * 0.4;
      var hasSocial = el.querySelector(
        'a[href*="facebook"],a[href*="instagram"],a[href*="youtube"],a[href*="tiktok"],a[href*="linkedin"]'
      );
      if (nearBottom && hasSocial) el.style.setProperty("display", "none", "important");
    });

    trimCtas();
  }

  // Reduce repeat/redundant calls-to-action in the page body (never nav/footer).
  // Keeps the nav Book Now, the hero CTA, the service-card "Learn More" links
  // (distinct destinations), and one consultation CTA.
  function trimCtas() {
    var seen = {};
    document.querySelectorAll("a.elementor-button").forEach(function (a) {
      if (a.closest("header, .fusion-header-wrapper, nav, footer")) return;
      var t = a.textContent.trim().toLowerCase().replace(/\s+/g, " ");
      // Redundant "call now" sitting beside another CTA — phone is in the header.
      if (t === "call now") { removeWidget(a); return; }
      // De-duplicate identical repeated conversion CTAs (keep the first/hero).
      if (t === "get my free roof report" || t === "book now") {
        seen[t] = (seen[t] || 0) + 1;
        if (seen[t] > 1) removeWidget(a);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clean);
  } else {
    clean();
  }
  window.addEventListener("load", function () { setTimeout(clean, 400); });
})();

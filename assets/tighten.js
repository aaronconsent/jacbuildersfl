/* tighten.js — runtime half of the UX cleanup overlay.
   Handles what CSS can't target reliably: the auto-opening popup, the
   broken-widget node removal (fallback for browsers without :has), and the
   mobile bottom social bar (a fixed element identified by its content). */
(function () {
  "use strict";

  function clean() {
    // Remove the broken Owens Corning roof-designer widget + its wrappers.
    document.querySelectorAll(".oc_shingle_view").forEach(function (n) {
      var w = n.closest(".elementor-widget-html") || n;
      w.remove();
    });

    // Close/remove any auto-opening popup (OC quote box / Elementor modal).
    document.querySelectorAll(
      ".elementor-popup-modal, .popup-form-new, .dialog-type-lightbox"
    ).forEach(function (n) { n.remove(); });
    document.body.classList.remove("elementor-popup-modal-open");
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";

    // Remove the mobile sticky social bar: a fixed/sticky element (not the
    // header) anchored near the bottom that holds social links.
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clean);
  } else {
    clean();
  }
  // Re-run shortly after load in case a popup is injected late by its script.
  window.addEventListener("load", function () { setTimeout(clean, 400); });
})();

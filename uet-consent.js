(function () {
  "use strict";

  var STORAGE_KEY = "quietsafe_ad_consent_v2";
  var UET_TAG_ID = "187262760";

  window.uetq = window.uetq || [];
  window.uetq.push("consent", "default", { ad_storage: "denied" });

  (function (w, d, t, u, o) {
    w[u] = w[u] || [];
    o.ts = new Date().getTime();
    var n = d.createElement(t);
    n.src = "https://bat.bing.net/bat.js?ti=" + o.ti + ("uetq" !== u ? "&q=" + u : "");
    n.async = 1;
    n.onload = n.onreadystatechange = function () {
      var s = this.readyState;
      if (!s || s === "loaded" || s === "complete") {
        o.q = w[u];
        w[u] = new UET(o);
        w[u].push("pageLoad");
        n.onload = n.onreadystatechange = null;
      }
    };
    var i = d.getElementsByTagName(t)[0];
    i.parentNode.insertBefore(n, i);
  })(window, document, "script", "uetq", {
    ti: UET_TAG_ID,
    enableAutoSpaTracking: true
  });

  function savedChoice() {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }

  function updateConsent(choice) {
    var granted = choice === "granted";
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        ad_storage: granted ? "granted" : "denied",
        analytics_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied"
      });
    }
    window.uetq = window.uetq || [];
    window.uetq.push("consent", "update", {
      ad_storage: granted ? "granted" : "denied"
    });
    try {
      window.localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
    } catch (error) {
      // Consent still applies to the current page if storage is unavailable.
    }
  }

  if (savedChoice() === "granted") {
    updateConsent("granted");
  }

  function createConsentControls() {
    var banner = document.createElement("section");
    banner.className = "privacy-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-modal", "false");
    banner.setAttribute("aria-labelledby", "privacy-consent-title");
    banner.hidden = true;
    banner.innerHTML =
      '<div class="privacy-consent__content">' +
        '<div class="privacy-consent__copy">' +
          '<strong id="privacy-consent-title">Nastavení soukromí a cookies</strong>' +
          '<p>Používáme nezbytné technologie pro provoz webu. S vaším souhlasem také používáme Microsoft UET a Google Ads k přesnějšímu měření návštěvnosti a účinnosti reklamy. Bez souhlasu zůstávají reklamní značky v omezeném režimu bez reklamních cookies.</p>' +
          '<a href="/privacy-policy.html#website-measurement">Více informací</a>' +
        '</div>' +
        '<div class="privacy-consent__actions">' +
          '<button type="button" class="privacy-consent__button privacy-consent__button--secondary" data-consent="denied">Pouze nezbytné</button>' +
          '<button type="button" class="privacy-consent__button privacy-consent__button--primary" data-consent="granted">Povolit vše</button>' +
        '</div>' +
      '</div>';

    var settingsButton = document.createElement("button");
    settingsButton.type = "button";
    settingsButton.className = "privacy-settings-button";
    settingsButton.textContent = "Nastavení soukromí";
    settingsButton.setAttribute("aria-haspopup", "dialog");

    function showBanner() {
      banner.hidden = false;
      settingsButton.hidden = true;
    }

    function hideBanner() {
      banner.hidden = true;
      settingsButton.hidden = false;
    }

    banner.addEventListener("click", function (event) {
      var button = event.target.closest("[data-consent]");
      if (!button) return;
      updateConsent(button.getAttribute("data-consent"));
      hideBanner();
    });

    settingsButton.addEventListener("click", showBanner);
    document.body.appendChild(banner);
    document.body.appendChild(settingsButton);

    if (savedChoice() === null) showBanner();

    document.addEventListener("click", function (event) {
      var storeLink = event.target.closest('a[href*="apps.microsoft.com"]');
      if (!storeLink) return;
      var shouldDelayNavigation =
        event.button === 0 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        !event.altKey &&
        storeLink.target !== "_blank";
      var navigationCompleted = false;

      function continueNavigation() {
        if (!shouldDelayNavigation || navigationCompleted) return;
        navigationCompleted = true;
        window.location.href = storeLink.href;
      }

      if (shouldDelayNavigation) event.preventDefault();
      window.uetq = window.uetq || [];
      window.uetq.push("event", "store_click", {
        event_category: "engagement",
        event_label: "Microsoft Store",
        event_value: 1
      });
      if (typeof window.gtag === "function") {
        window.gtag("event", "store_click", {
          event_category: "engagement",
          event_label: "Microsoft Store",
          value: 1,
          transport_type: "beacon"
        });
        var conversionParameters = {
          send_to: "AW-18332590954/2wZECO756dIcEOrG1KVE"
        };
        if (shouldDelayNavigation) {
          conversionParameters.event_callback = continueNavigation;
        }
        window.gtag("event", "conversion", conversionParameters);
      }
      if (shouldDelayNavigation) window.setTimeout(continueNavigation, 800);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createConsentControls);
  } else {
    createConsentControls();
  }
})();

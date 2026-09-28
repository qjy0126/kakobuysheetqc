/* kakobuysheetqc — GA4 / Firebase Analytics (G-48MV974LBV on kakobuywebsite) */
(function () {
  var MEASUREMENT_ID = "G-48MV974LBV";
  window.KF = window.KF || {};
  window.KF.analyticsId = MEASUREMENT_ID;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID, {
    send_page_view: true,
    cookie_flags: "SameSite=None;Secure",
  });

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + MEASUREMENT_ID;
  document.head.appendChild(s);
})();

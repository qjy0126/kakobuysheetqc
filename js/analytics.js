/* kakobuysheetqc — GA4 / Firebase Analytics (kakobuywebsite2) */
(function () {
  var MEASUREMENT_ID = "G-8199QNWH6R";
  window.KF = window.KF || {};
  window.KF.analyticsId = MEASUREMENT_ID;
  window.KF.firebaseConfig = {
    apiKey: "AIzaSyDKQ5x1dCohEIeppElYY0PsyF7b2hu5hDc",
    authDomain: "kakobuywebsite2.firebaseapp.com",
    projectId: "kakobuywebsite2",
    storageBucket: "kakobuywebsite2.firebasestorage.app",
    messagingSenderId: "433406177038",
    appId: "1:433406177038:web:97956759a26d650ab0315f",
    measurementId: MEASUREMENT_ID,
  };

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

"use strict";
(() => {
  const paths = {
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    clipboard: '<rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="m8 13 2 2 5-5M8 18h8"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    people: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5"/>',
    book: '<path d="M12 5C9 2 5 2 2 3v17c3-1 7-1 10 2 3-3 7-3 10-2V3c-3-1-7-1-10 2Zm0 0v17"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7h.01"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
    briefcase: '<rect x="2" y="7" width="20" height="15" rx="2"/><path d="M8 7V3h8v4M2 12a24 24 0 0 0 20 0M12 12v4"/>',
    home: '<path d="m3 10 9-8 9 8v11H3ZM9 21v-8h6v8"/>'
  };
  document.querySelectorAll("[data-icon]").forEach(el => {
    const p = paths[el.dataset.icon];
    if (p) el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>';
  });
  const sizeButton = document.getElementById("text-size");
  function setLarge(large) {
    document.documentElement.classList.toggle("large-text", large);
    sizeButton.setAttribute("aria-pressed", String(large));
    sizeButton.innerHTML = '<span aria-hidden="true">' + (large ? "가−" : "가+") + '</span> ' + (large ? "기본 글씨" : "글씨 크게");
  }
  try { setLarge(localStorage.getItem("hangeoreum-large-text") === "true"); } catch (_) { setLarge(false); }
  sizeButton.addEventListener("click", () => {
    const large = !document.documentElement.classList.contains("large-text");
    setLarge(large);
    try { localStorage.setItem("hangeoreum-large-text", String(large)); } catch (_) {}
  });
  const dialog = document.getElementById("application-dialog");
  let lastTrigger = null;
  const configured = [];
  document.querySelectorAll("[data-program]").forEach(button => {
    const name = button.dataset.program;
    const settings = (window.SITE_CONFIG || {})[name] || {};
    let url = null;
    try { const parsed = new URL(settings.url); if (parsed.protocol === "https:") url = parsed.href; } catch (_) {}
    if (url) {
      configured.push(name);
      button.href = url;
      button.target = "_blank";
      button.rel = "noopener noreferrer";
      button.append(Object.assign(document.createElement("span"), {className:"sr-only",textContent:" (새 창)"}));
      const badge = document.querySelector('[data-status="' + name + '"]');
      badge.textContent = "신청 페이지 연결"; badge.classList.add("open");
    } else {
      button.setAttribute("aria-haspopup", "dialog");
      button.addEventListener("click", event => {
        if (typeof dialog.showModal !== "function") return;
        event.preventDefault();
        lastTrigger = button;
        document.getElementById("dialog-title").textContent = (name === "diagnosis" ? "진단검사" : "자립교육") + " 신청을 준비하고 있어요.";
        dialog.showModal();
        document.getElementById("dialog-close").focus();
      });
    }
  });
  if (configured.length) {
    const help = document.querySelector(".application-help div");
    help.querySelector("strong").textContent = configured.length === 2 ? "신청 버튼을 누르면 신청 페이지가 열려요." : "연결된 프로그램은 신청 페이지에서 확인해 주세요.";
    help.querySelector("p").textContent = "참여 대상, 신청 기간, 준비할 서류를 확인해 주세요. 신청 페이지가 없는 프로그램은 준비 중이에요.";
  }
  document.getElementById("dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { if (lastTrigger) lastTrigger.focus(); });
  dialog.addEventListener("click", event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  if ("IntersectionObserver" in window) {
    const links = [...document.querySelectorAll(".header nav a")];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(link => {
            if (link.hash === "#" + entry.target.id) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }
      });
    }, {rootMargin:"-20% 0px -55% 0px",threshold:0});
    document.querySelectorAll("main section[id]").forEach(section => observer.observe(section));
  }
})();

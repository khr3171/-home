"use strict";
(() => {
  const paths = {
    coffee: '<path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM17 8h2a3 3 0 0 1 0 6h-2M7 2v3M12 2v3"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 1-3.7 2 2 0 0 1 1-3.7h2a4 4 0 0 0 4-4c0-4-4-6.6-9-6.6Z"/><circle cx="7" cy="9" r="1"/><circle cx="11" cy="6" r="1"/><circle cx="16" cy="8" r="1"/><circle cx="6" cy="14" r="1"/>',
    suitcase: '<rect x="4" y="6" width="16" height="15" rx="2"/><path d="M9 6V3h6v3M8 6v15M16 6v15M7 21v1M17 21v1"/>',
    roller: '<rect x="3" y="3" width="14" height="6" rx="1"/><path d="M17 6h4v7H11v3"/><rect x="9" y="16" width="4" height="6" rx="1"/>',
    sprout: '<path d="M12 22V12M12 15C5 15 3 11 3 6c7 0 9 4 9 9ZM12 11c0-6 3-9 9-9 0 6-3 9-9 9Z"/>',
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
  // 상담 번호는 site-config.js에서 관리합니다. 임시 번호에는 전화 연결을 만들지 않습니다.
  const contactDialog = document.getElementById("contact-dialog");
  const contactOpen = document.getElementById("contact-open");
  const contactClose = document.getElementById("contact-close");
  const contactCall = document.getElementById("contact-call");
  const contact = (window.SITE_CONFIG || {}).contact || {};
  const phoneNumber = String(contact.number || "051-000-0000").trim();
  const callable = contact.isTemporary === false && /^0[0-9-]{8,15}$/.test(phoneNumber) && phoneNumber !== "051-000-0000";
  document.querySelectorAll("[data-contact-number]").forEach(el => { el.textContent = phoneNumber; });
  if (callable) {
    contactCall.href = "tel:" + phoneNumber.replace(/-/g, "");
    contactCall.hidden = false;
    document.getElementById("contact-temporary").hidden = true;
    document.querySelector("[data-contact-temporary]").textContent = "눌러서 상담 안내 보기";
  }
  contactOpen.addEventListener("click", () => {
    if (typeof contactDialog.showModal !== "function") {
      window.alert("궁금한 점은 " + phoneNumber + "로 문의해 주세요." + (callable ? "" : " 현재는 임시 번호예요."));
      return;
    }
    contactDialog.showModal();
    contactClose.focus();
  });
  contactClose.addEventListener("click", () => contactDialog.close());
  contactDialog.addEventListener("close", () => contactOpen.focus());
  contactDialog.addEventListener("click", event => {
    const rect = contactDialog.getBoundingClientRect();
    if (event.target === contactDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) contactDialog.close();
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

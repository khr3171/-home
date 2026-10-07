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

  const config = window.SITE_CONFIG || {};
  const navigation = document.getElementById("main-navigation");
  const menuToggle = document.getElementById("menu-toggle");
  const mobileQuery = window.matchMedia("(max-width:800px)");
  function syncHeaderOffset() {
    document.documentElement.style.setProperty("--header-offset", (Math.ceil(document.querySelector(".header").getBoundingClientRect().height) + 16) + "px");
  }
  function closeMenu() {
    navigation.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "메뉴 보기";
    syncHeaderOffset();
  }
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    navigation.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "메뉴 닫기" : "메뉴 보기";
    syncHeaderOffset();
  });
  navigation.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu(); menuToggle.focus();
    }
  });
  if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", closeMenu);
  window.addEventListener("resize", syncHeaderOffset);
  if ("ResizeObserver" in window) new ResizeObserver(syncHeaderOffset).observe(document.querySelector(".header"));
  syncHeaderOffset();

  document.querySelectorAll("[data-program-field]").forEach(el => {
    const [program, field] = el.dataset.programField.split(".");
    const value = config[program] && config[program].fields && config[program].fields[field];
    if (typeof value === "string" && value.trim()) el.textContent = value;
  });
  document.querySelectorAll("[data-faq]").forEach(el => {
    const answer = config.faq && config.faq[el.dataset.faq];
    if (typeof answer === "string" && answer.trim()) el.textContent = answer;
  });
  function bindDialog(dialog, closeButton, getTrigger) {
    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("close", () => { const trigger = getTrigger(); if (trigger) trigger.focus(); });
    dialog.addEventListener("click", event => {
      const rect = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
    });
  }
  const applicationDialog = document.getElementById("application-dialog");
  let applicationTrigger = null;
  let openPrograms = 0;
  document.querySelectorAll("[data-program]").forEach(button => {
    const name = button.dataset.program;
    const settings = config[name] || {};
    const title = name === "diagnosis" ? "진단검사" : "자립교육";
    const badge = document.querySelector('[data-status="' + name + '"]');
    let url = null;
    try { const parsed = new URL(settings.url); if (parsed.protocol === "https:") url = parsed.href; } catch (_) {}
    const isClosed = settings.status === "closed";
    const isOpen = !isClosed && url && settings.status === "open";
    if (isOpen) {
      openPrograms += 1;
      button.href = url; button.target = "_blank"; button.rel = "noopener noreferrer";
      button.classList.remove("outlined"); button.classList.add("primary");
      button.textContent = title + " 신청하기";
      button.append(Object.assign(document.createElement("span"), {className:"sr-only",textContent:" (다른 홈페이지, 새 창)"}));
      badge.textContent = "모집 중"; badge.classList.add("open");
    } else {
      badge.textContent = isClosed ? "모집 마감" : "모집 준비 중";
      button.textContent = (isClosed ? "모집 마감" : "모집 준비 중") + " · 안내 보기";
      button.setAttribute("aria-haspopup", "dialog");
      button.addEventListener("click", event => {
        if (typeof applicationDialog.showModal !== "function") return;
        event.preventDefault(); applicationTrigger = button;
        document.getElementById("dialog-title").textContent = title + (isClosed ? " 모집이 끝났어요." : " 모집을 준비하고 있어요.");
        document.getElementById("dialog-description").textContent = isClosed ?
          "현재는 신청을 받지 않아요. 다음 모집 소식은 부산사회서비스원 홈페이지에서 확인해 주세요." :
          "현재는 홈페이지에서 신청을 받지 않아요. 참여 조건과 신청 일정은 모집 안내에서 알려드릴게요.";
        applicationDialog.showModal();
        document.getElementById("dialog-close").focus();
      });
    }
  });
  if (openPrograms) {
    const help = document.querySelector(".application-help div");
    help.querySelector("strong").textContent = "모집 중인 프로그램은 신청서로 바로 연결돼요.";
    help.querySelector("p").textContent = "참여 조건과 서류를 확인한 뒤 신청해 주세요. 준비 중이거나 마감된 프로그램은 안내만 볼 수 있어요.";
  }
  bindDialog(applicationDialog, document.getElementById("dialog-close"), () => applicationTrigger);
  const contactDialog = document.getElementById("contact-dialog");
  const contactClose = document.getElementById("contact-close");
  const contactCall = document.getElementById("contact-call");
  const contact = config.contact || {};
  const phoneNumber = String(contact.number || "").trim();
  const callable = contact.isTemporary === false && /^0[0-9-]{8,15}$/.test(phoneNumber) && phoneNumber !== "051-000-0000";
  const contactTriggers = [...document.querySelectorAll("[data-contact-open]")];
  let contactTrigger = null;
  document.querySelectorAll("[data-contact-number]").forEach(el => {
    el.textContent = callable ? phoneNumber : (el.closest("dialog") ? "상담 번호 준비 중" : "문의 방법 알아보기");
  });
  if (callable) {
    contactCall.href = "tel:" + phoneNumber.replace(/-/g, "");
    contactCall.hidden = false;
    document.getElementById("contact-temporary").hidden = true;
    document.querySelector("[data-contact-temporary]").textContent = contact.hours || "누르면 전화로 연결돼요";
    if (contact.hours) {
      const hours = document.getElementById("contact-hours"); hours.hidden = false; hours.textContent = "상담 시간: " + contact.hours;
    }
    document.querySelector("#mobile-contact>span:last-child").textContent = "전화 문의";
    [document.getElementById("contact-open"), document.getElementById("mobile-contact")].forEach(el => {
      el.removeAttribute("aria-haspopup"); el.removeAttribute("aria-controls");
      el.setAttribute("aria-label", "전화 문의 " + phoneNumber + (contact.hours ? ", 상담 시간 " + contact.hours : ""));
    });
  }
  contactTriggers.forEach(trigger => trigger.addEventListener("click", () => {
    if (callable && ["contact-open","mobile-contact"].includes(trigger.id)) {
      window.location.href = contactCall.href; return;
    }
    if (typeof contactDialog.showModal !== "function") { window.location.href = document.getElementById("contact-official").href; return; }
    contactTrigger = trigger; contactDialog.showModal(); contactClose.focus();
  }));
  bindDialog(contactDialog, contactClose, () => contactTrigger);
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

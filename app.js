/* ==========================================================================
   Zhixia Chinese — shared interactions
   --------------------------------------------------------------------------
   DEMO_MODE keeps the site safe to preview: inquiries are stored locally and
   checkout shows a sample confirmation. Connect the endpoints below, then set
   demoMode to false for launch. See README.md for the full checklist.
   ========================================================================== */

const CONFIG = {
  demoMode: true,

  // Example: "https://formspree.io/f/your-form-id"
  // Receives a JSON POST of the inquiry payload.
  inquiryEndpoint: "",

  // Example: "/api/create-checkout-session" (Stripe / PayPal server route).
  // For a production build, return { url: "https://checkout.provider.com/..." }
  // and the browser will be redirected there.
  checkoutEndpoint: ""
};

const IS_ZH = (document.documentElement.lang || "en").toLowerCase().startsWith("zh");

const STORAGE_KEYS = {
  inquiry: "zhixia_inquiry",
  selectedPackage: "zhixia_selected_package",
  lastOrder: "zhixia_last_order",
  checkout: "zhixia_checkout"
};

function safeStorage(name) {
  try {
    return window[name] || null;
  } catch (error) {
    return null;
  }
}

const localStore = safeStorage("localStorage");
const sessionStore = safeStorage("sessionStorage");

const PACKAGES = {
  single: {
    name: "Single lesson",
    nameZh: "单节课",
    mark: "单",
    price: 45,
    lessons: 1,
    meta: "1 × 55-minute lesson",
    metaZh: "1 节 × 55 分钟",
    lessonsLabel: "1 × 55 min",
    lessonsLabelZh: "1 × 55 分钟",
    savings: 0
  },
  ten: {
    name: "10-lesson pack",
    nameZh: "10 节课程包",
    mark: "十",
    price: 420,
    lessons: 10,
    meta: "10 × 55-minute lessons",
    metaZh: "10 节 × 55 分钟",
    lessonsLabel: "10 × 55 min",
    lessonsLabelZh: "10 × 55 分钟",
    savings: 30
  },
  twenty: {
    name: "20-lesson pack",
    nameZh: "20 节课程包",
    mark: "廿",
    price: 780,
    lessons: 20,
    meta: "20 × 55-minute lessons",
    metaZh: "20 节 × 55 分钟",
    lessonsLabel: "20 × 55 min",
    lessonsLabelZh: "20 × 55 分钟",
    savings: 120
  }
};

const STRINGS = IS_ZH
  ? {
      sending: "发送中…",
      processing: "正在安全处理…",
      preferredPlan: "意向课程：",
      recommend: "由老师推荐",
      payButton: (amount) => `支付 ${amount}`,
      methodSelected: (label) => `已选择${label}。`,
      methods: {
        Card: "信用卡 / 借记卡",
        PayPal: "PayPal",
        "WeChat Pay": "微信支付",
        Alipay: "支付宝"
      },
      openNav: "打开导航",
      closeNav: "关闭导航",
      friend: "朋友",
      dateLocale: "zh-CN",
      placeholders: {
        wechat: "你的微信号",
        whatsapp: "你的 WhatsApp 号码",
        chat: "如偏好微信或 WhatsApp，请填写"
      },
      errors: {
        inquiryService: "咨询提交失败，请稍后再试。",
        inquiryMissing: "咨询接收服务尚未配置。",
        inquiryGeneric: "提交时出现错误，请发邮件至 hello@zhixiachinese.com。",
        checkoutStart: "无法启动安全付款，请重试。",
        checkoutUrl: "支付服务未返回付款链接。",
        checkoutMissing: "付款尚未配置，请发邮件至 hello@zhixiachinese.com。",
        checkoutGeneric: "出现错误，请重试。"
      }
    }
  : {
      sending: "Sending…",
      processing: "Processing securely…",
      preferredPlan: "Preferred plan: ",
      recommend: "I’ll recommend one",
      payButton: (amount) => `Pay ${amount} securely`,
      methodSelected: (label) => `${label} selected.`,
      methods: {
        Card: "Card",
        PayPal: "PayPal",
        "WeChat Pay": "WeChat Pay",
        Alipay: "Alipay"
      },
      openNav: "Open navigation",
      closeNav: "Close navigation",
      friend: "friend",
      dateLocale: "en",
      placeholders: {
        wechat: "Your WeChat ID",
        whatsapp: "Your WhatsApp number",
        chat: "Only if you prefer chat"
      },
      errors: {
        inquiryService: "The inquiry service did not accept the request.",
        inquiryMissing: "The inquiry endpoint is not configured yet.",
        inquiryGeneric: "Something went wrong while sending your note. Please email hello@zhixiachinese.com.",
        checkoutStart: "We couldn’t start the secure checkout. Please try again.",
        checkoutUrl: "The payment provider did not return a checkout URL.",
        checkoutMissing: "Payments are not configured yet. Please email hello@zhixiachinese.com.",
        checkoutGeneric: "Something went wrong. Please try again."
      }
    };

const packName = (pack) => (IS_ZH ? pack.nameZh : pack.name);
const packMeta = (pack) => (IS_ZH ? pack.metaZh : pack.meta);
const packLessons = (pack) => (IS_ZH ? pack.lessonsLabelZh : pack.lessonsLabel);
const methodName = (value) => STRINGS.methods[value] || value;

const money = (value) => `$${Number(value).toFixed(2)}`;
const moneyWhole = (value) => `$${Number(value)}`;

function readStorage(store, key) {
  if (!store) {
    return null;
  }
  try {
    const value = store.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

function writeStorage(store, key, value) {
  if (!store) {
    return;
  }
  try {
    store.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* Storage can be unavailable in private browsing. The demo still works. */
  }
}

function removeStorage(store, key) {
  if (!store) {
    return;
  }
  try {
    store.removeItem(key);
  } catch (error) {
    /* Ignore unavailable storage. */
  }
}

function applyDemoVisibility() {
  document.querySelectorAll("[data-demo-only]").forEach((element) => {
    element.hidden = !CONFIG.demoMode;
  });

  document.querySelectorAll("[data-success-live]").forEach((element) => {
    element.hidden = CONFIG.demoMode;
  });

  document.querySelectorAll("[data-success-demo]").forEach((element) => {
    element.hidden = !CONFIG.demoMode;
  });
}

function initYear() {
  const year = new Date().getFullYear();
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = year;
  });
}

function initLanguageLinks() {
  document.querySelectorAll(".nav-lang, .footer-seal a[hreflang]").forEach((link) => {
    try {
      const target = new URL(link.getAttribute("href"), window.location.href);
      if (window.location.search) {
        target.search = window.location.search;
      }
      if (window.location.hash) {
        target.hash = window.location.hash;
      }
      link.href = target.href;
    } catch (error) {
      /* Keep the plain link if URL parsing is unavailable. */
    }
  });
}

function initValidationMessages() {
  const messages = IS_ZH
    ? {
        required: "请填写此项。",
        select: "请选择一个选项。",
        checkbox: "请勾选此项以继续。",
        email: "请输入有效的邮箱地址。",
        date: "请选择今天或之后的日期。",
        invalid: "请检查此项。"
      }
    : {
        required: "Please fill in this field.",
        select: "Please choose an option.",
        checkbox: "Please tick this box to continue.",
        email: "Please enter a valid email address.",
        date: "Please choose today or a later date.",
        invalid: "Please check this field."
      };

  document.querySelectorAll("form").forEach((form) => {
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      const clear = () => field.setCustomValidity("");
      field.addEventListener("input", clear);
      field.addEventListener("change", clear);
      field.addEventListener("invalid", () => {
        let message = messages.invalid;
        if (field.validity.valueMissing) {
          if (field.type === "checkbox") {
            message = messages.checkbox;
          } else if (field.tagName === "SELECT") {
            message = messages.select;
          } else {
            message = messages.required;
          }
        } else if (field.type === "email" && field.validity.typeMismatch) {
          message = messages.email;
        } else if (field.type === "date" && field.validity.rangeUnderflow) {
          message = messages.date;
        }
        field.setCustomValidity(message);
      });
    });
  });
}

function clearValidationMessages(form) {
  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.setCustomValidity("");
  });
}

function initHeader() {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.getElementById("site-nav");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  if (!toggle || !nav) {
    return;
  }

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? STRINGS.closeNav : STRINGS.openNav);
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  };

  toggle.addEventListener("click", () => {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      toggle.getAttribute("aria-expanded") === "true" &&
      !nav.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760 && toggle.getAttribute("aria-expanded") === "true") {
      setMenu(false);
    }
  });
}

function initReveal() {
  const elements = Array.from(document.querySelectorAll(".reveal"));
  if (!elements.length) {
    return;
  }

  elements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  });

  if (!("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -9% 0px", threshold: 0.08 }
  );

  elements.forEach((element) => observer.observe(element));
}

function initScrollSpy() {
  const navLinks = Array.from(document.querySelectorAll(".nav-list .nav-link"));
  if (!navLinks.length) {
    return;
  }

  const sectionIds = ["about", "pricing", "inquiry"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if (!sections.length || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        navLinks.forEach((link) => {
          const href = link.getAttribute("href") || "";
          link.classList.toggle("is-active", href.endsWith(`#${entry.target.id}`));
        });
      });
    },
    { rootMargin: "-28% 0px -58% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
}

function showFormError(form, message) {
  let error = form.querySelector(".form-error");
  if (!error) {
    error = document.createElement("p");
    error.className = "form-error";
    error.setAttribute("role", "alert");
    const actions = form.querySelector(".form-actions");
    if (actions) {
      actions.before(error);
    } else {
      form.appendChild(error);
    }
  }
  error.textContent = message;
  error.hidden = false;
}

function clearFormError(form) {
  const error = form.querySelector(".form-error");
  if (error) {
    error.hidden = true;
    error.textContent = "";
  }
}

function initPackageChoosers() {
  const select = document.getElementById("package");
  document.querySelectorAll(".choose-package").forEach((button) => {
    button.addEventListener("click", () => {
      const packageKey = button.getAttribute("data-package");
      if (!packageKey || !PACKAGES[packageKey]) {
        return;
      }

      if (select) {
        select.value = packageKey;
      }
      writeStorage(sessionStore, STORAGE_KEYS.selectedPackage, packageKey);

      const card = document.querySelector(".form-card");
      if (card) {
        card.classList.remove("package-flash");
        window.requestAnimationFrame(() => card.classList.add("package-flash"));
      }
    });
  });
}

function planLabel(packageKey) {
  if (!packageKey || !PACKAGES[packageKey]) {
    return STRINGS.recommend;
  }
  const pack = PACKAGES[packageKey];
  return `${packName(pack)} · ${moneyWhole(pack.price)}`;
}

function initInquiryForm() {
  const form = document.querySelector("[data-inquiry-form]");
  if (!form) {
    return;
  }

  const success = document.getElementById("inquiry-success");
  const intro = document.querySelector("[data-form-intro]");
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel = submit ? submit.innerHTML : "";
  const successName = document.querySelector("[data-success-name]");
  const successEmail = document.querySelector("[data-success-email]");
  const successPlan = document.querySelector("[data-success-plan]");
  const successPay = document.querySelector("[data-success-pay]");
  const reset = document.querySelector("[data-reset-inquiry]");
  const packageSelect = document.getElementById("package");
  const contactMethod = document.getElementById("contact-method");
  const contactHandle = document.getElementById("contact-handle");
  let isSubmitting = false;

  if (contactMethod && contactHandle) {
    contactMethod.addEventListener("change", () => {
      const method = contactMethod.value;
      if (method === "WeChat") {
        contactHandle.placeholder = STRINGS.placeholders.wechat;
      } else if (method === "WhatsApp") {
        contactHandle.placeholder = STRINGS.placeholders.whatsapp;
      } else {
        contactHandle.placeholder = STRINGS.placeholders.chat;
      }
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    clearFormError(form);

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    isSubmitting = true;
    const data = new FormData(form);
    const packageKey = String(data.get("package") || "");
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      nationality: String(data.get("nationality") || "").trim(),
      nativeLanguage: String(data.get("nativeLanguage") || "").trim(),
      chineseLevel: String(data.get("level") || ""),
      package: packageKey,
      packageName: packageKey && PACKAGES[packageKey] ? PACKAGES[packageKey].name : "Not sure yet",
      schedule: String(data.get("schedule") || ""),
      timezone: String(data.get("timezone") || "").trim(),
      goals: data.getAll("goals").map(String),
      contactMethod: String(data.get("contactMethod") || "Email"),
      contactHandle: String(data.get("contactHandle") || "").trim(),
      notes: String(data.get("notes") || "").trim(),
      trial: data.get("trial") === "Yes, free intro chat",
      consent: data.get("consent") === "Agreed",
      submittedAt: new Date().toISOString(),
      source: "website-inquiry"
    };

    if (submit) {
      submit.disabled = true;
      submit.innerHTML = STRINGS.sending;
    }

    try {
      if (!CONFIG.demoMode) {
        if (!CONFIG.inquiryEndpoint) {
          throw new Error(STRINGS.errors.inquiryMissing);
        }
        const response = await fetch(CONFIG.inquiryEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(STRINGS.errors.inquiryService);
        }
      } else {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
      }

      if (CONFIG.demoMode) {
        writeStorage(localStore, STORAGE_KEYS.inquiry, payload);
      }
      writeStorage(sessionStore, STORAGE_KEYS.checkout, {
        name: payload.name,
        email: payload.email,
        package: packageKey
      });
      if (packageKey && PACKAGES[packageKey]) {
        writeStorage(sessionStore, STORAGE_KEYS.selectedPackage, packageKey);
      }

      if (successName) {
        successName.textContent = payload.name.split(/\s+/)[0] || STRINGS.friend;
      }
      if (successEmail) {
        successEmail.textContent = payload.email;
      }
      if (successPlan) {
        successPlan.textContent = `${STRINGS.preferredPlan}${planLabel(packageKey)}`;
      }
      if (successPay) {
        const payPage = IS_ZH ? "pay-zh.html" : "pay.html";
        const query = packageKey && PACKAGES[packageKey]
          ? `?package=${encodeURIComponent(packageKey)}&from=inquiry`
          : "?from=inquiry";
        successPay.href = `${payPage}${query}`;
      }

      if (intro) {
        intro.hidden = true;
      }
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch (error) {
      showFormError(
        form,
        error.message || STRINGS.errors.inquiryGeneric
      );
    } finally {
      isSubmitting = false;
      if (submit) {
        submit.disabled = false;
        submit.innerHTML = submitLabel;
      }
    }
  });

  if (reset && success) {
    reset.addEventListener("click", () => {
      form.reset();
      clearFormError(form);
      success.hidden = true;
      form.hidden = false;
      if (intro) {
        intro.hidden = false;
      }
      if (packageSelect) {
        packageSelect.value = "";
      }
      removeStorage(sessionStore, STORAGE_KEYS.selectedPackage);
      removeStorage(sessionStore, STORAGE_KEYS.checkout);
      removeStorage(localStore, STORAGE_KEYS.inquiry);
      clearValidationMessages(form);
      const nameField = document.getElementById("name");
      if (nameField) {
        nameField.focus();
      }
      form.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Restore an unfinished inquiry on a return visit. Nothing is sent again.
  const stored = readStorage(localStore, STORAGE_KEYS.inquiry);
  if (CONFIG.demoMode && stored && stored.email && !form.hidden) {
    const fields = {
      name: stored.name,
      email: stored.email,
      nationality: stored.nationality,
      nativeLanguage: stored.nativeLanguage,
      level: stored.chineseLevel,
      schedule: stored.schedule,
      timezone: stored.timezone,
      contactMethod: stored.contactMethod,
      contactHandle: stored.contactHandle,
      notes: stored.notes
    };
    Object.entries(fields).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (field && value) {
        field.value = value;
      }
    });
    if (stored.package && packageSelect) {
      packageSelect.value = stored.package;
    }
  }
}

function formatOrderNumber(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `ZX-${year}${month}${day}-${suffix}`;
}

function initCheckout() {
  const form = document.querySelector("[data-checkout-form]");
  if (!form) {
    return;
  }

  const packageRadios = Array.from(form.querySelectorAll('input[name="package"]'));
  const paymentRadios = Array.from(form.querySelectorAll('input[name="payment"]'));
  const payButton = form.querySelector("[data-pay-button]");
  const paymentDetail = form.querySelector("[data-payment-detail]");
  const success = document.getElementById("checkout-success");
  const steps = Array.from(document.querySelectorAll("[data-checkout-steps] [data-step]"));
  const orderName = document.querySelector("[data-order-name]");
  const orderMeta = document.querySelector("[data-order-meta]");
  const orderMark = document.querySelector("[data-order-mark]");
  const orderLessons = document.querySelector("[data-order-lessons]");
  const orderSubtotal = document.querySelector("[data-order-subtotal]");
  const orderSavings = document.querySelector("[data-order-savings]");
  const savingsRow = document.querySelector("[data-savings-row]");
  const orderTotal = document.querySelector("[data-order-total]");
  const startDate = document.getElementById("checkout-start");
  const nameField = document.getElementById("checkout-name");
  const emailField = document.getElementById("checkout-email");
  const payLabel = payButton ? payButton.innerHTML : "";
  const params = new URLSearchParams(window.location.search);
  let isSubmitting = false;

  // A sensible minimum for the preferred start date.
  if (startDate) {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
    startDate.min = localToday.toISOString().slice(0, 10);
  }

  // Restore a package chosen on the pricing cards or in a previous checkout.
  const storedCheckout = readStorage(sessionStore, STORAGE_KEYS.checkout) || {};
  const storedPackage = readStorage(sessionStore, STORAGE_KEYS.selectedPackage);
  const requestedPackage = params.get("package");
  const initialKey = [requestedPackage, storedPackage, storedCheckout.package]
    .find((key) => key && PACKAGES[key]);

  if (initialKey) {
    const radio = packageRadios.find((item) => item.value === initialKey);
    if (radio) {
      radio.checked = true;
    }
  }

  // Prefill contact details from the inquiry without overwriting anything.
  if (storedCheckout.name && nameField && !nameField.value) {
    nameField.value = storedCheckout.name;
  }
  if (storedCheckout.email && emailField && !emailField.value) {
    emailField.value = storedCheckout.email;
  }

  function currentPackage() {
    const checked = packageRadios.find((radio) => radio.checked) || packageRadios[1] || packageRadios[0];
    return PACKAGES[checked ? checked.value : "ten"];
  }

  function renderSummary() {
    const pack = currentPackage();
    if (orderName) orderName.textContent = packName(pack);
    if (orderMeta) orderMeta.textContent = packMeta(pack);
    if (orderMark) orderMark.textContent = pack.mark;
    if (orderLessons) orderLessons.textContent = packLessons(pack);
    if (orderSubtotal) orderSubtotal.textContent = money(pack.price + pack.savings);
    if (orderSavings) orderSavings.textContent = `−${money(pack.savings)}`;
    if (savingsRow) savingsRow.hidden = pack.savings === 0;
    if (orderTotal) orderTotal.textContent = moneyWhole(pack.price);
    if (payButton) {
      payButton.innerHTML = `${STRINGS.payButton(moneyWhole(pack.price))} <span class="arrow" aria-hidden="true">→</span>`;
    }
  }

  function renderPaymentDetail() {
    const selected = paymentRadios.find((radio) => radio.checked);
    if (!selected || !paymentDetail) {
      return;
    }
    const label = methodName(selected.value);
    const separator = IS_ZH ? "" : " ";
    paymentDetail.innerHTML = `<strong>${STRINGS.methodSelected(label)}</strong>${separator}${selected.getAttribute("data-detail") || ""}`;
  }

  packageRadios.forEach((radio) => radio.addEventListener("change", renderSummary));
  paymentRadios.forEach((radio) => radio.addEventListener("change", renderPaymentDetail));
  renderSummary();
  renderPaymentDetail();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    clearFormError(form);

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    isSubmitting = true;
    const pack = currentPackage();
    const paymentRadio = paymentRadios.find((radio) => radio.checked);
    const payload = {
      name: String(new FormData(form).get("name") || "").trim(),
      email: String(new FormData(form).get("email") || "").trim(),
      country: String(new FormData(form).get("country") || ""),
      timezone: String(new FormData(form).get("timezone") || "").trim(),
      startDate: String(new FormData(form).get("startDate") || ""),
      phone: String(new FormData(form).get("phone") || "").trim(),
      packageKey: Object.keys(PACKAGES).find((key) => PACKAGES[key] === pack) || "ten",
      packageName: pack.name,
      lessons: pack.lessons,
      amount: pack.price,
      currency: "USD",
      paymentMethod: paymentRadio ? paymentRadio.value : "Card",
      createdAt: new Date().toISOString()
    };

    if (payButton) {
      payButton.disabled = true;
      payButton.innerHTML = STRINGS.processing;
    }

    try {
      if (CONFIG.checkoutEndpoint && !CONFIG.demoMode) {
        const response = await fetch(CONFIG.checkoutEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          throw new Error(STRINGS.errors.checkoutStart);
        }
        const result = await response.json();
        if (!result.url) {
          throw new Error(STRINGS.errors.checkoutUrl);
        }
        window.location.assign(result.url);
        return;
      }

      if (!CONFIG.demoMode) {
        throw new Error(STRINGS.errors.checkoutMissing);
      }

      await new Promise((resolve) => window.setTimeout(resolve, 900));

      const order = {
        ...payload,
        orderNumber: formatOrderNumber(),
        status: "demo-confirmed"
      };
      writeStorage(localStore, STORAGE_KEYS.lastOrder, order);
      removeStorage(sessionStore, STORAGE_KEYS.selectedPackage);
      removeStorage(sessionStore, STORAGE_KEYS.checkout);
      removeStorage(localStore, STORAGE_KEYS.inquiry);

      const firstName = payload.name.split(/\s+/)[0] || STRINGS.friend;
      const setText = (selector, value) => {
        document.querySelectorAll(selector).forEach((element) => {
          element.textContent = value;
        });
      };

      setText("[data-success-first]", firstName);
      setText("[data-success-email]", payload.email);
      setText("[data-success-order]", order.orderNumber);
      setText(
        "[data-success-date]",
        new Intl.DateTimeFormat(STRINGS.dateLocale, { dateStyle: "medium" }).format(new Date())
      );
      setText("[data-success-package]", packName(pack));
      setText("[data-success-lessons]", packLessons(pack));
      setText("[data-success-method]", methodName(payload.paymentMethod));
      setText("[data-success-total]", money(pack.price));

      document.querySelectorAll("[data-success-live]").forEach((element) => {
        element.hidden = CONFIG.demoMode;
      });
      document.querySelectorAll("[data-success-demo]").forEach((element) => {
        element.hidden = !CONFIG.demoMode;
      });

      if (steps.length) {
        steps.forEach((step) => {
          const stepNumber = Number(step.getAttribute("data-step"));
          step.classList.toggle("is-complete", stepNumber < 3);
          step.classList.toggle("is-active", stepNumber === 3);
        });
      }

      form.hidden = true;
      document.body.classList.add("is-complete");
      if (success) {
        success.hidden = false;
        success.focus({ preventScroll: true });
        success.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch (error) {
      showFormError(form, error.message || STRINGS.errors.checkoutGeneric);
    } finally {
      isSubmitting = false;
      if (payButton) {
        payButton.disabled = false;
        payButton.innerHTML = payLabel;
        renderSummary();
      }
    }
  });

  document.querySelectorAll("[data-print]").forEach((button) => {
    button.addEventListener("click", () => window.print());
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyDemoVisibility();
  initYear();
  initLanguageLinks();
  initValidationMessages();
  initHeader();
  initReveal();
  initScrollSpy();
  initPackageChoosers();
  initInquiryForm();
  initCheckout();
});

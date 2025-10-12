// assets/app.js — EarnUwant Interactions

// ========= CONFIG: Fill these before go‑live =========
const CONFIG = {
  email: "contact.earnuwant@gmail.com",
  emailjs: {
    publicKey: "dI1ShLp6VUVpPo5Io",
    serviceId: "service_bvq0snh",
    templateIdContact: "template_contact",
    templateIdWorker: "template_worker"
  },
  recaptcha: {
    siteKey: "YOUR_RECAPTCHA_SITE_KEY" // ensure script tag is added in HTML if using v3
  }
};
// =====================================================

// Year in footer
(function setYear(){
  const yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }
})();

// Mobile nav toggle
(function mobileNav(){
  const btn = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if(!btn || !nav) return;
  btn.addEventListener('click', ()=>{
    const isOpen = nav.style.display === 'flex';
    nav.style.display = isOpen ? 'none' : 'flex';
    btn.setAttribute('aria-expanded', String(!isOpen));
  });
})();

// Smooth scroll for same‑page anchors
(function smoothAnchors(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href').trim();
      if(id.length > 1){
        const tgt = document.querySelector(id);
        if(tgt){
          e.preventDefault();
          tgt.scrollIntoView({behavior:'smooth', block:'start'});
        }
      }
    });
  });
})();

// Count‑up when visible (fallback: numbers already present)
(function countUp(){
  const stats = document.querySelectorAll('.hero-stats .stat span:first-child');
  if(!('IntersectionObserver' in window) || stats.length===0) return;
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target;
        const targetText = el.textContent.replace(/[, +]/g,'');
        const target = parseInt(targetText,10);
        if(!isNaN(target)){
          let cur = 0;
          const step = Math.ceil(target/60);
          const t = setInterval(()=>{
            cur += step;
            if(cur >= target){ cur = target; clearInterval(t); }
            el.textContent = cur.toLocaleString();
          }, 20);
        }
        obs.unobserve(el);
      }
    });
  },{threshold:.3});
  stats.forEach(s=>obs.observe(s));
})();

// Minimal validator
function validateEmail(v){ return /^[^s@]+@[^s@]+.[^s@]+$/.test(v); }
function validatePhone(v){ return /^[0-9+-s()]{7,}$/.test(v); }

// reCAPTCHA v3 helper (optional)
async function getRecaptchaToken(action){
  if(!window.grecaptcha || !CONFIG.recaptcha.siteKey) return '';
  try{
    await grecaptcha.ready();
    const token = await grecaptcha.execute(CONFIG.recaptcha.siteKey, {action});
    return token || '';
  }catch{ return ''; }
}

// EmailJS init (optional)
(function initEmailJS(){
  if(!window.emailjs) return;
  if(CONFIG.emailjs.publicKey){
    emailjs.init(CONFIG.emailjs.publicKey);
  }
})();

// Serialize form to object
function formToJSON(form){
  const fd = new FormData(form);
  const obj = {};
  for(const [k,v] of fd.entries()){
    if(obj[k]){ // handle multi-select
      if(Array.isArray(obj[k])) obj[k].push(v);
      else obj[k] = [obj[k], v];
    }else obj[k] = v;
  }
  return obj;
}

// Generic submit handler with EmailJS
async function handleFormSubmit(form, templateId, actionLabel){
  const btn = form.querySelector('button[type="submit"]');
  const orig = btn ? btn.textContent : '';
  const data = formToJSON(form);

  // Basic validation
  if(data.email && !validateEmail(data.email)){
    alert("Please enter a valid email.");
    return;
  }
  if(data.phone && !validatePhone(data.phone)){
    alert("Please enter a valid phone number.");
    return;
  }

  // reCAPTCHA token
  const tokenInput = form.querySelector('input[name="recaptcha_token"]');
  const token = await getRecaptchaToken(actionLabel || 'submit');
  if(tokenInput){ tokenInput.value = token; }

  // If EmailJS configured, send
  if(window.emailjs && CONFIG.emailjs.serviceId && templateId){
    try{
      if(btn){ btn.disabled = true; btn.textContent = "Sending..."; }
      const payload = {
        ...data,
        to_email: CONFIG.email
      };
      await emailjs.send(CONFIG.emailjs.serviceId, templateId, payload);
      alert("Sent successfully. We will reply soon.");
      form.reset();
    }catch(err){
      console.error(err);
      alert("Failed to send. Please try later or email us directly.");
    }finally{
      if(btn){ btn.disabled = false; btn.textContent = orig; }
    }
  }else{
    // Fallback: mailto
    const subject = encodeURIComponent([Website] ${actionLabel || 'Message'} from ${data.name || 'Visitor'});
    const body = encodeURIComponent(
      Object.entries(data).map(([k,v])=>${k}: ${Array.isArray(v)?v.join(', '):v}).join('
')
    );
    window.location.href = mailto:${CONFIG.email}?subject=${subject}&body=${body};
  }
}

// Wire contact form
(function contactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    await handleFormSubmit(form, CONFIG.emailjs.templateIdContact, 'contact');
  });
})();

// Wire worker apply form
(function workerForm(){
  const form = document.getElementById('workerForm');
  if(!form) return;
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    await handleFormSubmit(form, CONFIG.emailjs.templateIdWorker, 'worker_apply');
  });
})();

// Simple in‑view animation hooks (CSS to use [data-reveal="1"])
(function revealOnView(){
  const els = document.querySelectorAll('[data-reveal]');
  if(els.length===0 || !('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('reveal-in');
        obs.unobserve(en.target);
      }
    });
  },{threshold:.2});
  els.forEach(el=>obs.observe(el));
})();
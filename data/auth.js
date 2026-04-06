/* ═══════════════════════════════════════════════════
   AUTH.JS — role persistence, simple session state
   ═══════════════════════════════════════════════════ */

const Auth = (() => {
  const ROLE_KEY = 'vp_role';
  const CITY_KEY = 'vp_city';

  function setRole(role) {
    sessionStorage.setItem(ROLE_KEY, role);
  }

  function getRole() {
    return sessionStorage.getItem(ROLE_KEY);
  }

  function setCity(city) {
    sessionStorage.setItem(CITY_KEY, city);
  }

  function getCity() {
    return sessionStorage.getItem(CITY_KEY) || 'Mumbai';
  }

  function clearRole() {
    sessionStorage.removeItem(ROLE_KEY);
  }

  // Guard: redirect to index if no role set on a dashboard page
  function requireRole(expected) {
    const role = getRole();
    if (!role) {
      window.location.replace('index.html');
      return false;
    }
    if (expected && role !== expected) {
      window.location.replace(role === 'vendor' ? 'vendor.html' : 'customer.html');
      return false;
    }
    return true;
  }

  return { setRole, getRole, setCity, getCity, clearRole, requireRole };
})();

/* ── Toast utility ── */
function toast(msg, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  // Sanitise: use textContent, never innerHTML
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

/* ── Safe DOM helper (never uses innerHTML with user input) ── */
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

window.Auth  = Auth;
window.toast = toast;
window.esc   = esc;

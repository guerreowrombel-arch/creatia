// === HAMBURGER & NAV ===
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const overlay = document.querySelector('.nav-overlay');
const navLinks = document.querySelectorAll('.nav-menu li');

function toggleMenu() {
  hamburger.classList.toggle('active');
  nav.classList.toggle('active');
  overlay.classList.toggle('active');

  // Links animados
  navLinks.forEach((link, index) => {
    if (link.style.animation) {
      link.style.animation = '';
    } else {
      link.style.animation = `fadeSlideIn 0.4s ease forwards ${index / 5 + 0.2}s`;
    }
  });
}

if (hamburger) {
  hamburger.addEventListener('click', toggleMenu);
}

if (overlay) {
  overlay.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    nav?.classList.remove('active');
    overlay?.classList.remove('active');
    navLinks.forEach(link => (link.style.animation = ''));
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    nav?.classList.remove('active');
    overlay?.classList.remove('active');
    navLinks.forEach(link => (link.style.animation = ''));
  });
});

// === MENÚ DE CUENTA (toggle visible/oculto) ===
const cuentaIcon = document.querySelector('.icono-cuenta');
const cuentaMenu = document.getElementById('cuentaMenu');

if (cuentaIcon && cuentaMenu) {
  cuentaIcon.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation(); // 👈 ¡ESTA ES LA CLAVE! Detiene la propagación del clic
    if (cuentaMenu.style.display === 'block') {
      // Si está abierto, lo cerramos con animación
      cuentaMenu.style.animation = 'menuExit 0.2s ease forwards';
      setTimeout(() => {
        cuentaMenu.style.display = 'none';
      }, 200);
    } else {
      // Si está cerrado, lo abrimos
      cuentaMenu.style.display = 'block';
      cuentaMenu.style.animation = 'menuEntrance 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }
  });

  // Cerrar si se hace clic fuera
  document.addEventListener('click', (e) => {
    if (!cuentaIcon.contains(e.target) && !cuentaMenu.contains(e.target)) {
      if (cuentaMenu.style.display === 'block') {
        cuentaMenu.style.animation = 'menuExit 0.2s ease forwards';
        setTimeout(() => {
          cuentaMenu.style.display = 'none';
        }, 200);
      }
    }
  });
}

// Animación de salida
const style = document.createElement('style');
style.textContent = `
  @keyframes menuExit {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.95); }
  }
`;
document.head.appendChild(style);

// === INTEGRACIÓN CON SUPABASE ===
const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// === SCROLL REVEAL ===
function revealOnScroll() {
  const sections = document.querySelectorAll('.scroll-reveal');
  const windowHeight = window.innerHeight;

  sections.forEach(section => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < windowHeight - 100) {
      section.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);

// === LÓGICA DINÁMICA PARA USUARIOS LOGUEADOS ===
document.addEventListener("DOMContentLoaded", async () => {
  // Chequear sesión
  const { data: { session } } = await supabaseClient.auth.getSession();

  // Elementos dinámicos
  const navCrear = document.getElementById('navCrear');
  const heroCtaButton = document.getElementById('heroCtaButton');
  const ctaFinal = document.getElementById('ctaFinal');
  const techSection = document.getElementById('techSection');

  if (!session) {
    console.log("🔴 Visitante: mostrando contenido público");
    // Dejar todo como está (botones de registro, CTA final visible)
    return;
  }

  console.log("🟢 Usuario logueado:", session.user.id);

  // Mostrar botón "Crear" en nav
  if (navCrear) navCrear.style.display = 'block';

  // Cambiar botón del hero
  if (heroCtaButton) {
    heroCtaButton.textContent = "Crea ahora";
    heroCtaButton.onclick = () => {
      window.location.href = "../codigos/crear.html";
    };
  }

  // Ocultar CTA Final
  if (ctaFinal) ctaFinal.style.display = 'none';

  // Mostrar sección técnica
  if (techSection) techSection.style.display = 'block';

  // Cargar datos del usuario
  const { data: usuario } = await supabaseClient
    .from("usuarios")
    .select("correo_electronico")
    .eq("id", session.user.id)
    .single();

  const { data: perfil } = await supabaseClient
    .from("perfiles")
    .select("apodo, imagen_perfil, portada")
    .eq("usuario_id", session.user.id)
    .single();

  // Actualizar menú de cuenta
  if (cuentaMenu) {
    cuentaMenu.innerHTML = `
      <div class="cuenta-cover" style="background-image:url('${perfil?.portada || "../imagenes/default-cover.jpg"}');"></div>
      <div class="cuenta-avatar">
        <img src="${perfil?.imagen_perfil || "../imagenes/boton-de-cuenta-redonda-con-usuario-dentro.png"}" alt="Avatar">
      </div>
      <div class="cuenta-info" style="text-align:center; margin:10px 0;">
        <p><strong>${perfil?.apodo || "Usuario"}</strong></p>
        <p>${usuario?.correo_electronico || session.user.email}</p>
      </div>
      <div class="cuenta-actions">
        <button onclick="window.location.href='../perfil/perfil.html'">Perfil</button>
        <button id="logoutBtn">Cerrar sesión</button>
      </div>
    `;

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        localStorage.clear();
        window.location.reload();
      });
    }
  }

  // Activar animaciones scroll-reveal
  revealOnScroll();
});
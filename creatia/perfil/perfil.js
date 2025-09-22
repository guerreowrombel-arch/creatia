// Configuración Supabase
const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho"; // 👈 Reemplaza con tu anon key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar sesión
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    window.location.href = "../codigos/creatia.html";
    return;
  }

  // Obtener datos de usuario
  const { data: usuario } = await supabaseClient
    .from("usuarios")
    .select("nombre, apellido, correo_electronico")
    .eq("id", session.user.id)
    .single();

  const { data: perfil } = await supabaseClient
    .from("perfiles")
    .select("apodo, imagen_perfil, portada")
    .eq("usuario_id", session.user.id)
    .single();

  // Mostrar datos
  document.getElementById("nombreUsuario").textContent = `${usuario?.nombre || ""} ${usuario?.apellido || ""}`;
  document.getElementById("apodoUsuario").textContent = perfil?.apodo || "Sin apodo";
  document.getElementById("emailUsuario").textContent = usuario?.correo_electronico || session.user.email;

  // Imágenes
  const avatarImg = document.getElementById("avatarPerfil");
  const menuAvatar = document.getElementById("menuAvatar");
  const portadaPerfil = document.getElementById("portadaPerfil");

  if (perfil?.imagen_perfil) {
    avatarImg.src = perfil.imagen_perfil;
    menuAvatar.src = perfil.imagen_perfil;
  }

  if (perfil?.portada) {
    portadaPerfil.style.backgroundImage = `url(${perfil.portada})`;
  }

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    localStorage.clear();
    window.location.href = "../codigos/creatia.html";
  });

  // Cargar proyectos (placeholder)
  const proyectosLista = document.getElementById("proyectosLista");
  proyectosLista.innerHTML = `
    <div class="proyecto-card">
      <h4>Proyecto de logo universitario</h4>
      <p>Creado el 15/05/2024</p>
    </div>
    <div class="proyecto-card">
      <h4>Diseño de app móvil</h4>
      <p>Creado el 20/05/2024</p>
    </div>
  `;

  // ==== TOGGLE MENÚ DE CUENTA ====
  const cuentaIcon = document.querySelector('.icono-cuenta');
  const cuentaMenu = document.getElementById('cuentaMenu');

  if (cuentaIcon && cuentaMenu) {
    cuentaIcon.addEventListener('click', (e) => {
      e.preventDefault();
      cuentaMenu.style.display = cuentaMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Cerrar menú si se hace clic fuera
    document.addEventListener('click', (e) => {
      if (!cuentaIcon.contains(e.target) && !cuentaMenu.contains(e.target)) {
        cuentaMenu.style.display = 'none';
      }
    });
  }
});
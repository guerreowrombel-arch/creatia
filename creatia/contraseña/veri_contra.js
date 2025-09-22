import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

    const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Cargar datos del usuario al iniciar
    async function loadUserData() {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();

        if (authError || !session) {
          alert("❌ No hay sesión activa.");
          window.location.href = "../inicio_sesion/iniciodesesion.html";
          return;
        }

        const user = session.user;
        const userPanel = document.querySelector('.user-panel');
        const avatarEl = document.getElementById('userAvatar');
        const nicknameEl = document.getElementById('userNickname');
        const emailEl = document.getElementById('userEmail');

        // Mostrar email SIEMPRE
        emailEl.textContent = user.email;

        // Buscar perfil extendido
        const { data: profile, error: profileError } = await supabase
          .from('perfiles')
          .select('apodo, imagen_perfil, portada')
          .eq('usuario_id', user.id)
          .single();

        // Apodo: si no hay, mostrar fallback
        nicknameEl.textContent = profile?.apodo || "Usuario Anónimo";

        // Avatar: si hay, aplicar
        if (profile?.imagen_perfil) {
          avatarEl.style.backgroundImage = `url('${profile.imagen_perfil}')`;
        }

        // Portada: si hay, aplicar como fondo
        if (profile?.portada) {
          userPanel.classList.add('has-cover');
          userPanel.style.setProperty('--cover-url', `url('${profile.portada}')`);
        }

      } catch (err) {
        console.error("⚠️ Error cargando datos del usuario:", err);
        document.getElementById('userNickname').textContent = "Carga fallida";
        document.getElementById('userEmail').textContent = "—";
      }
    }

    // Verificar contraseña
    document.getElementById('verifyForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const currentPassword = document.getElementById('currentPassword').value;
      const messageEl = document.getElementById('verifyMessage');
      const submitBtn = document.querySelector('.btn-primary');

      if (!currentPassword) {
        messageEl.textContent = "Por favor ingresa tu contraseña actual.";
        messageEl.className = "message error";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Verificando...";

      try {
        const { data: { session }, error } = await supabase.auth.signInWithPassword({
          email: (await supabase.auth.getUser()).data.user.email,
          password: currentPassword
        });

        if (error) throw error;

        if (session) {
          window.location.href = "cambiar_contraseña.html"; // 👈 ¡Ajusta esta ruta!
        } else {
          throw new Error("Credenciales inválidas");
        }

      } catch (err) {
        console.error("Error:", err.message);
        messageEl.textContent = "❌ Contraseña incorrecta. Inténtalo de nuevo.";
        messageEl.className = "message error";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Verificar y Continuar";
      }
    });

    // Iniciar carga de datos cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', loadUserData);
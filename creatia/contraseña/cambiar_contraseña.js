import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

    const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Cargar datos del usuario
    async function loadUserData() {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) throw new Error("No hay sesión");

        const user = session.user;
        const userPanel = document.getElementById('userPanel');
        const avatarEl = document.getElementById('userAvatar');
        const nicknameEl = document.getElementById('userNickname');
        const emailEl = document.getElementById('userEmail');

        emailEl.textContent = user.email;

        const { data: profile } = await supabase
          .from('perfiles')
          .select('apodo, imagen_perfil, portada')
          .eq('usuario_id', user.id)
          .single();

        nicknameEl.textContent = profile?.apodo || "Usuario Anónimo";

        if (profile?.imagen_perfil) {
          avatarEl.style.backgroundImage = `url('${profile.imagen_perfil}')`;
        }

        if (profile?.portada) {
          userPanel.classList.add('has-cover');
          userPanel.style.setProperty('--cover-url', `url('${profile.portada}')`);
        }

      } catch (err) {
        console.error("Error cargando perfil:", err.message);
        document.getElementById('userNickname').textContent = "Carga fallida";
        document.getElementById('userEmail').textContent = "—";
      }
    }

    // Toggle contraseña
    document.addEventListener('click', function(e) {
      if (e.target.closest('.toggle-password')) {
        const button = e.target.closest('.toggle-password');
        const targetId = button.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;

        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        button.style.color = isPassword ? '#d60000' : '#aaa';
      }
    });

    // Medidor de fortaleza
    function updatePasswordStrength() {
      const password = document.getElementById('newPassword').value;
      const barFill = document.getElementById('barFill');
      const strengthText = document.getElementById('strengthText');
      const container = document.querySelector('.password-strength');

      container.classList.remove('weak', 'medium', 'strong');

      if (!password) {
        barFill.style.width = '0%';
        strengthText.textContent = 'Escribe una contraseña';
        return;
      }

      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const isLongEnough = password.length >= 6;

      let score = 0;
      if (hasLower) score++;
      if (hasUpper) score++;
      if (hasNumber) score++;
      if (isLongEnough) score++;

      if (score <= 2) {
        container.classList.add('weak');
        barFill.style.width = '33%';
        strengthText.textContent = 'Débil – Necesita más tipos de caracteres';
      } else if (score === 3) {
        container.classList.add('medium');
        barFill.style.width = '66%';
        strengthText.textContent = 'Media – Casi perfecta';
      } else {
        container.classList.add('strong');
        barFill.style.width = '100%';
        strengthText.textContent = 'Fuerte – ¡Perfecta!';
      }
    }

    document.getElementById('newPassword')?.addEventListener('input', updatePasswordStrength);

    // Enviar formulario
    document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const messageEl = document.getElementById('passwordMessage');
      const submitBtn = document.querySelector('.btn-primary');

      if (newPassword !== confirmPassword) {
        messageEl.textContent = "❌ Las contraseñas no coinciden.";
        messageEl.className = "message error";
        return;
      }

      const hasLower = /[a-z]/.test(newPassword);
      const hasUpper = /[A-Z]/.test(newPassword);
      const hasNumber = /[0-9]/.test(newPassword);
      const isLongEnough = newPassword.length >= 6;

      if (!hasLower || !hasUpper || !hasNumber || !isLongEnough) {
        messageEl.textContent = "❌ La contraseña debe incluir minúscula, mayúscula, número y al menos 6 caracteres.";
        messageEl.className = "message error";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Guardando...";

      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;

        messageEl.textContent = "✅ ¡Contraseña actualizada con éxito!";
        messageEl.className = "message success";

        setTimeout(() => {
          window.location.href = "../perfil/perfil.html";
        }, 2500);

      } catch (err) {
        console.error("Error:", err.message);
        messageEl.textContent = `❌ Error: ${err.message}`;
        messageEl.className = "message error";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Guardar Contraseña";
      }
    });

    // Inicializar
    document.addEventListener('DOMContentLoaded', () => {
      loadUserData();
      updatePasswordStrength();
    });
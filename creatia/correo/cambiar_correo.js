import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

    const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Verificar sesión activa
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("❌ Debes iniciar sesión para cambiar tu correo.");
        window.location.href = "../inicio_sesion/iniciodesesion.html"; // ajusta ruta
        return false;
      }
      return true;
    }

    document.getElementById('emailForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const hasSession = await checkSession();
      if (!hasSession) return;

      const newEmail = document.getElementById('newEmail').value.trim();
      const messageEl = document.getElementById('emailMessage');
      const submitBtn = document.querySelector('.btn-primary');

      if (!newEmail) {
        messageEl.textContent = "Por favor ingresa un correo válido.";
        messageEl.className = "message error";
        return;
      }

      // Desactivar botón mientras se procesa
      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      try {
        const { error } = await supabase.auth.updateUser({ email: newEmail });

        if (error) throw error;

        messageEl.textContent = `✅ Enlace de confirmación enviado a ${newEmail}. Por favor, revisa tu bandeja.`;
        messageEl.className = "message success";

        // Redirigir a perfil después de 3 segundos
        setTimeout(() => {
          window.location.href = "../perfil/perfil.html"; // 👈 ¡Cambia esto a tu ruta real de perfil!
        }, 3000);

      } catch (err) {
        console.error("Error:", err.message);
        messageEl.textContent = `❌ Error: ${err.message}`;
        messageEl.className = "message error";
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar enlace de confirmación";
      }
    });
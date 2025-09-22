import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

    const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    document.getElementById('recoverForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const messageEl = document.getElementById('recoverMessage');
      const submitBtn = document.querySelector('.btn-primary');

      if (!email) {
        messageEl.textContent = "Por favor ingresa un correo válido.";
        messageEl.className = "message error";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Enviando...";

      try {
        // 👇 Esto automáticamente verifica si el email existe en Auth
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: '../contraseña/cambiar_contraseña.html'
        });

        if (error) throw error;

        // ✅ Mensaje genérico por seguridad (no revelamos si el email existe o no)
        messageEl.textContent = "✅ Si este correo está registrado, recibirás un enlace para restablecer tu contraseña.";
        messageEl.className = "message success";

        // Opcional: limpiar campo
        document.getElementById('email').value = '';

      } catch (err) {
        console.error("Error:", err.message);
        messageEl.textContent = "❌ Hubo un problema al procesar tu solicitud. Inténtalo más tarde.";
        messageEl.className = "message error";
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Enviar enlace de recuperación";
      }
    });
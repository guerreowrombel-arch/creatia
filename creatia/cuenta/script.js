// 🚀 Configuración de Supabase
const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho"; // Reemplaza con tu anon key completa
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registrationForm");
  const passwordInput = document.getElementById("password");
  const passwordStrengthMeter = document.getElementById("passwordStrengthMeter");
  const passwordStrengthText = document.getElementById("passwordStrengthText");

  // ===== Validación fuerza contraseña =====
  passwordInput.addEventListener("input", function () {
    const password = passwordInput.value;
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;

    passwordStrengthMeter.style.width = strength + "%";

    if (strength < 50) {
      passwordStrengthText.textContent = "Seguridad de contraseña: Débil";
      passwordStrengthMeter.style.backgroundColor = "#e74c3c";
    } else if (strength < 75) {
      passwordStrengthText.textContent = "Seguridad de contraseña: Media";
      passwordStrengthMeter.style.backgroundColor = "#f39c12";
    } else {
      passwordStrengthText.textContent = "Seguridad de contraseña: Fuerte";
      passwordStrengthMeter.style.backgroundColor = "#2ecc71";
    }
  });

  // ===== Validar y enviar =====
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    let isValid = true;

    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");
    const email = document.getElementById("email");

    // Validaciones
    if (!firstName.value.trim()) {
      showError(firstName, "firstNameError", "El nombre es obligatorio");
      isValid = false;
    } else clearError(firstName, "firstNameError");

    if (!lastName.value.trim()) {
      showError(lastName, "lastNameError", "El apellido es obligatorio");
      isValid = false;
    } else clearError(lastName, "lastNameError");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim() || !emailRegex.test(email.value)) {
      showError(email, "emailError", "Ingresa un correo válido");
      isValid = false;
    } else clearError(email, "emailError");

    // Validación de password según Supabase
    if (
      passwordInput.value.length < 8 ||
      !/[a-z]/.test(passwordInput.value) ||
      !/[A-Z]/.test(passwordInput.value) ||
      !/[0-9]/.test(passwordInput.value)
    ) {
      showError(
        passwordInput,
        "passwordError",
        "La contraseña debe tener al menos 8 caracteres, incluir minúsculas, mayúsculas y números"
      );
      isValid = false;
    } else {
      clearError(passwordInput, "passwordError");
    }

    if (!isValid) return;

    // ===== Registro en Supabase con METADATA =====
    const { data, error } = await supabaseClient.auth.signUp({
      email: email.value,
      password: passwordInput.value,
      options: {
        data: {
          nombre: firstName.value,
          apellido: lastName.value
        }
      }
    });

    if (error) {
      alert("❌ Error al registrar: " + error.message);
      return;
    }

    console.log("👤 Usuario registrado:", data);

    // 👉 No necesitamos actualizar la tabla "usuarios" desde aquí
    // El TRIGGER handle_new_user ya lo hace automáticamente

    // Redirigir a inicio de sesion
    window.location.href = "../inicio_sesion/iniciodesesion.html";
  });

  // Helpers para mostrar errores
  function showError(input, errorId, message) {
    const errorElement = document.getElementById(errorId);
    errorElement.textContent = message;
    errorElement.style.display = "block";
    input.classList.add("error");
  }

  function clearError(input, errorId) {
    const errorElement = document.getElementById(errorId);
    errorElement.style.display = "none";
    input.classList.remove("error");
  }
});
// 🚀 Configuración Supabase
const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho"; // pega tu anon key
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    let isValid = true;

    // Validar correo
    const email = document.getElementById("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === "") {
      showError(email, "emailError", "El correo electrónico es obligatorio");
      isValid = false;
    } else if (!emailRegex.test(email.value)) {
      showError(email, "emailError", "Ingresa un correo electrónico válido");
      isValid = false;
    } else {
      clearError(email, "emailError");
    }

    // Validar contraseña
    const password = document.getElementById("password");
    if (password.value.trim() === "") {
      showError(password, "passwordError", "La contraseña es obligatoria");
      isValid = false;
    } else {
      clearError(password, "passwordError");
    }

    if (!isValid) return;

    // 🚀 LOGIN con Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (error) {
      console.error("❌ Error de login:", error.message);
      alert("Correo o contraseña incorrectos");
      return;
    }

    const user = data.user; // usuario actual
    console.log("👤 Sesión activa:", user);

    // 👉 Traer datos de la tabla USUARIOS
    const { data: usuario, error: errUsuario } = await supabaseClient
      .from("usuarios")
      .select("nombre, apellido, correo_electronico")
      .eq("id", user.id)
      .single();

    if (errUsuario) {
      console.error("Error leyendo usuarios:", errUsuario.message);
    }

    // 👉 Traer datos de la tabla PERFILES
    const { data: perfil, error: errPerfil } = await supabaseClient
      .from("perfiles")
      .select("apodo, imagen_perfil, portada")
      .eq("usuario_id", user.id)
      .single();

    if (errPerfil) {
      console.error("Error leyendo perfiles:", errPerfil.message);
    }

    // 👉 Guardamos todo en localStorage
    const allData = { usuario, perfil };
    localStorage.setItem("datosUsuario", JSON.stringify(allData));

    // 👉 Redirigir al perfil/dashboard
    window.location.href = "./creatia.html"; // cambia según tu página real
  });

  // Funciones ERRORES
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
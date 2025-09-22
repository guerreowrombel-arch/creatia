// 🚀 Configuración de Supabase
const SUPABASE_URL = "https://nrbpqaofhavniiottefl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yYnBxYW9maGF2bmlpb3R0ZWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDIzMzAsImV4cCI6MjA3MzcxODMzMH0.2pDIvqS79WEqSKkEoJRj4TILXLTA4tJlhWzUlve4Aho";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ========= PREVISUALIZAR IMÁGENES ========= */
const avatarInput = document.getElementById("avatarInput");
const coverInput = document.getElementById("coverInput");
const avatarLabel = document.getElementById("avatarLabel");
const coverLabel = document.getElementById("coverLabel");

const preview = (fileInput, elementCSSBg) => {
  const file = fileInput.files[0];
  if (!file) {
    console.warn("⚠️ No se seleccionó archivo");
    return;
  }
  console.log("📸 Seleccionando:", file.name);

  const reader = new FileReader();
  reader.onload = (e) => {
    elementCSSBg.style.backgroundImage = `url('${e.target.result}')`;
  };
  reader.readAsDataURL(file);
};

avatarInput.addEventListener("change", () =>
  preview(avatarInput, avatarLabel)
);
coverInput.addEventListener("change", () =>
  preview(coverInput, coverLabel)
);

/* ========= FORMULARIO ========= */
const form = document.getElementById("profileForm");
const skipBtn = document.getElementById("skipBtn");
const nicknameInput = form.nickname;

// Redirección final
const goNextPage = () => {
  console.log("➡️ Redirigiendo a creatia.html...");
  form.querySelector(".btn-primary").disabled = true;
  form.querySelector(".btn-primary").textContent = "Guardando…";
  setTimeout(() => {
    window.location.href = "../perfil/perfil.html";
  }, 1200);
};

// Guardar perfil en Supabase
async function saveProfile() {
  // 🔍 Verificar si hay sesión activa
  const { data: sessionData } = await supabaseClient.auth.getSession();
  if (!sessionData.session) {
    alert("❌ No hay sesión activa. Por favor inicia sesión primero.");
    console.error("No session data:", sessionData);
    window.location.href = "../inicio_sesion/iniciodesesion.html";
    return;
  }

  const user = sessionData.session.user;
  console.log("👤 Usuario autenticado:", user.id);

  const updates = {};
  const nickname = nicknameInput.value.trim();
  if (nickname) updates.apodo = nickname;

  // === Subir avatar si hay ===
  if (avatarInput.files[0]) {
    const file = avatarInput.files[0];
    const path = `avatars/${user.id}-${Date.now()}.jpg`;
    console.log("⏫ Subiendo avatar:", path);

    const { data: uplAv, error: errAv } = await supabaseClient
      .storage.from("imagenes-usuarios")
      .upload(path, file, { upsert: true });

    if (errAv) {
      console.error("❌ Error subiendo avatar:", errAv);
      alert("Error subiendo avatar: " + errAv.message);
      return;
    } else {
      console.log("✅ Avatar subido:", uplAv);
      updates.imagen_perfil = `${SUPABASE_URL}/storage/v1/object/public/imagenes-usuarios/${path}`;
    }
  }

  // === Subir portada si hay ===
  if (coverInput.files[0]) {
    const file = coverInput.files[0];
    const path = `portadas/${user.id}-${Date.now()}.jpg`;
    console.log("⏫ Subiendo portada:", path);

    const { data: uplCo, error: errCo } = await supabaseClient
      .storage.from("imagenes-usuarios")
      .upload(path, file, { upsert: true });

    if (errCo) {
      console.error("❌ Error subiendo portada:", errCo);
      alert("Error subiendo portada: " + errCo.message);
      return;
    } else {
      console.log("✅ Portada subida:", uplCo);
      updates.portada = `${SUPABASE_URL}/storage/v1/object/public/imagenes-usuarios/${path}`;
    }
  }

  // === Guardar datos en la tabla perfiles ===
  if (Object.keys(updates).length > 0) {
    const { error: errDb } = await supabaseClient
      .from("perfiles")
      .upsert(
        {
          usuario_id: user.id,
          ...updates,
        },
        { onConflict: "usuario_id" }
      );
    if (errDb) {
      console.error("❌ Error guardando perfil en DB:", errDb.message);
      alert("Error guardando perfil en DB: " + errDb.message);
      return;
    } else {
      console.log("✅ Perfil actualizado en la DB:", updates);
    }
  }

  goNextPage();
}

// Submit con validación de apodo
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!nicknameInput.value.trim()) {
    alert("Por favor escribe tu apodo");
    return;
  }
  await saveProfile();
});

// Botón "Omitir"
skipBtn.addEventListener("click", async () => {
  if (
    nicknameInput.value.trim() ||
    avatarInput.files[0] ||
    coverInput.files[0]
  ) {
    await saveProfile();
  } else {
    goNextPage();
  }
});

/* ========= 🎯 CARGAR PERFIL EXISTENTE AL INICIAR ========= */
async function loadUserProfile() {
  const { data: sessionData } = await supabaseClient.auth.getSession();

  if (!sessionData.session) {
    alert("❌ No estás logueado. Redirigiendo al login...");
    window.location.href = "iniciodesesion.html";
    return;
  }

  const userId = sessionData.session.user.id;

  // Buscar perfil en la tabla "perfiles"
  const { data: profile, error } = await supabaseClient
    .from("perfiles")
    .select("*")
    .eq("usuario_id", userId)
    .single(); // Solo un registro

  if (error && error.code !== "PGRST116") {
    // PGRST116 = "no rows returned" → eso está OK, significa que no tiene perfil aún
    console.error("❌ Error al cargar perfil:", error);
    alert("Error al cargar tu perfil: " + error.message);
    return;
  }

  if (profile) {
    console.log("✅ Perfil encontrado:", profile);

    // Rellenar apodo
    if (profile.apodo) {
      nicknameInput.value = profile.apodo;
    }

    // Previsualizar avatar si existe
    if (profile.imagen_perfil) {
      avatarLabel.style.backgroundImage = `url('${profile.imagen_perfil}')`;
    }

    // Previsualizar portada si existe
    if (profile.portada) {
      coverLabel.style.backgroundImage = `url('${profile.portada}')`;
    }
  } else {
    console.log("ℹ️ No se encontró perfil. Mostrando valores por defecto.");
    // Opcional: puedes poner aquí valores por defecto, ej:
    // avatarLabel.style.backgroundImage = "url('../default-avatar.png')";
    // coverLabel.style.backgroundImage = "url('../default-cover.jpg')";
  }
}

// 👇 Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", loadUserProfile);
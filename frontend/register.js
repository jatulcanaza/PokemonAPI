document.getElementById("registerSubmitBtn").addEventListener("click", async () => {
  const username = document.getElementById("newUsername").value.trim();
  const password = document.getElementById("newPassword").value.trim();
  const msg = document.getElementById("registerMessage");

  if (!username || !password) {
    msg.style.color = "red";
    msg.textContent = "Por favor, completa todos los campos";
    return;
  }

  try {
    const res = await fetch("http://pokeapp-lb-1369835668.us-east-1.elb.amazonaws.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      msg.style.color = "green";
      msg.textContent = `Usuario ${username} registrado con éxito! Redirigiendo al login...`;
      setTimeout(() => {
        window.location.href = "index.html"; // vuelve al login
      }, 1500);
    } else {
      msg.style.color = "red";
      msg.textContent = "❌ " + data.message;
    }
  } catch (error) {
    msg.style.color = "red";
    msg.textContent = "Error al registrar el usuario";
  }
});

document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const msg = document.getElementById("message");

  const res = await fetch("http://pokeapp-lb-1369835668.us-east-1.elb.amazonaws.com/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    msg.textContent = "Bienvenido, redirigiendo...";
    setTimeout(() => {
      window.location.href = "pokemons.html";
    }, 1500);
  } else {
    msg.textContent = "❌ " + data.message;
  }
});

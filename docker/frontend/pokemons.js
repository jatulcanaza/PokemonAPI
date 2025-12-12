const searchInput = document.getElementById("search");
const suggestionsList = document.getElementById("suggestions");
const detailsDiv = document.getElementById("details");
const logoutBtn = document.getElementById("logoutBtn");

let allPokemons = [];

// Cargar ~1000 Pokémon para autocompletar
async function loadPokemons() {
  detailsDiv.innerHTML = "Cargando lista de Pokémon...";
  try {
    const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1000");
    const data = await res.json();
    allPokemons = data.results; // [{ name, url }]
    detailsDiv.innerHTML = "Listo, busca tu Pokémon favorito.";
  } catch (error) {
    detailsDiv.innerHTML = "Error al cargar los Pokémon.";
  }
}

function renderSuggestions(list) {
  suggestionsList.innerHTML = "";
  list.slice(0, 10).forEach(poke => {
    const li = document.createElement("li");
    li.textContent = poke.name;
    li.addEventListener("click", () => showPokemonDetails(poke.name));
    suggestionsList.appendChild(li);
  });
}

// Buscar mientras se escribe usando includes
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  suggestionsList.innerHTML = "";
  if (!q) return;
  const filtered = allPokemons.filter(p => p.name.includes(q));
  renderSuggestions(filtered);
});

// Mostrar detalles del Pokémon seleccionado
async function showPokemonDetails(name) {
  suggestionsList.innerHTML = "";
  searchInput.value = name;
  detailsDiv.innerHTML = "Cargando...";
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Pokémon no encontrado");
    const data = await res.json();
    const types = data.types.map(t => t.type.name).join(", ");
    const img = data.sprites.other?.["official-artwork"]?.front_default || data.sprites.front_default || "";
    detailsDiv.innerHTML = `
      <div class="pokemon-card">
        ${img ? `<img class="pokemon-img" src="${img}" alt="${data.name}">` : ""}
        <h3>${data.name} (id: ${data.id})</h3>
        <p>Altura: ${data.height} • Peso: ${data.weight}</p>
        <p>Tipos: ${types}</p>
      </div>
    `;

    // Log de búsqueda (silencioso, sin cambiar UI)
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/search-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, token })
      }).catch(() => {});
    }
  } catch (error) {
    detailsDiv.innerHTML = "Error al cargar los detalles.";
  }
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

// Inicialización
loadPokemons();



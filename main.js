const pokemonContainer = document.querySelector(".pokemon-container");
const spinner = document.querySelector("#spinner");
const previous = document.querySelector("#previous");
const next = document.querySelector("#next");
const searchPokemon = document.querySelector("#searchPokemon");
const buttonPokemon = document.querySelector("#pokeButton");
const containerVolver = document.querySelector("#searchContainer");
const typeFilter = document.querySelector("#typeFilter");

const volver = document.createElement('button');
volver.id = 'volver';
volver.textContent = 'Volver a la lista';
volver.style.display = 'none';

volver.addEventListener('click', () => {
    searchPokemon.value = '';
    limpiarHTML();
    recorrerPokemon();
    volver.style.display = 'none';
    previous.classList.remove('hidden');
    next.classList.remove('hidden');
    buttonImgNormal.classList.remove('hidden');
    buttonImg3D.classList.remove('hidden');
});

containerVolver.appendChild(volver);

const buttonImgNormal = document.createElement('button');
buttonImgNormal.textContent = 'Ver Imágenes Normales';
buttonImgNormal.id = 'verNormal';
buttonImgNormal.addEventListener('click', () => {
    currentView = 'normal';
    limpiarHTML();
    recorrerPokemon();
});

const buttonImg3D = document.createElement('button');
buttonImg3D.textContent = 'Ver Imágenes en 3D';
buttonImg3D.id = 'verEn3D';
buttonImg3D.addEventListener('click', () => {
    currentView = '3d';
    limpiarHTML();
    recorrerPokemon();
});

containerVolver.appendChild(buttonImgNormal);
containerVolver.appendChild(buttonImg3D);

let offset = 1;
let limit = 9;
let currentView = 'normal'; // Vista actual, por defecto 'normal'

document.addEventListener('DOMContentLoaded', recorrerPokemon);

previous.addEventListener('click', () => {
    if (offset != 1) {
        offset -= 9;
        limpiarHTML();
        recorrerPokemon(offset, limit);
    }
});

next.addEventListener('click', () => {
    offset += 9;
    limpiarHTML();
    recorrerPokemon(offset, limit);
});

buttonPokemon.addEventListener('click', () => {
    const searchTerm = searchPokemon.value.trim().toLowerCase();
    if (searchTerm) {
        limpiarHTML();
        buscarPokemon(searchTerm);
        previous.classList.add('hidden');
        next.classList.add('hidden');
        buttonImgNormal.classList.add('hidden');
        buttonImg3D.classList.add('hidden');
    }
});

typeFilter.addEventListener('change', () => {
    limpiarHTML();
    const selectedType = typeFilter.value;
    if (selectedType === 'all') {
        recorrerPokemon();
    } else {
        filtrarPorTipo(selectedType);
    }
});

function llamarApi(id, mostrarSeleccionado = false) {
    const url = `https://pokeapi.co/api/v2/pokemon/${id}/`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (mostrarSeleccionado) {
                mostrarPokemonSeleccionado(data); // Mostrar directamente el Pokémon seleccionado
            } else {
                crearPokemon(data); // Crear tarjeta en la lista
            }
            spinner.style.display = "none";
        })
        .catch(error => console.error('Error:', error));
}

function recorrerPokemon() {
    spinner.style.display = "block";
    for (let i = offset; i < offset + limit; i++) {
        llamarApi(i);
    }
}

function buscarPokemon(searchTerm) {
    const url = `https://pokeapi.co/api/v2/pokemon/${searchTerm}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            crearPokemon(data);
            volver.style.display = 'block'; // Mostrar el botón al hacer una búsqueda
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Pokémon no encontrado. Intenta con otro nombre o ID.");
        });
}

function filtrarPorTipo(tipo) {
    fetch(`https://pokeapi.co/api/v2/type/${tipo}`)
        .then(response => response.json())
        .then(data => {
            data.pokemon.forEach(poke => {
                fetch(poke.pokemon.url)
                    .then(response => response.json())
                    .then(pokemonData => {
                        crearPokemon(pokemonData);
                    })
                    .catch(error => console.error('Error:', error));
            });
        })
        .catch(error => console.error('Error:', error));
}



// Añadir esta función para obtener la cadena evolutiva
// Función para obtener la cadena evolutiva
async function fetchEvolutionChain(speciesUrl) {
    const speciesResponse = await fetch(speciesUrl);
    const speciesData = await speciesResponse.json();
    const evolutionChainUrl = speciesData.evolution_chain.url;

    const evolutionChainResponse = await fetch(evolutionChainUrl);
    const evolutionChainData = await evolutionChainResponse.json();

    return evolutionChainData;
}

function displayEvolutionChain(evolutionChain, container) {
    const evolutionsTitle = document.createElement("h5");
    evolutionsTitle.classList.add("mt-4", "text-center", "evolutions-title");
    evolutionsTitle.textContent = "Evoluciones:";
    container.appendChild(evolutionsTitle);

    const evolutionsContainer = document.createElement("div");
    evolutionsContainer.classList.add("d-flex", "justify-content-center", "align-items-center", "evolutions-container");
    container.appendChild(evolutionsContainer);

    let currentEvolution = evolutionChain.chain;
    while (currentEvolution) {
        const evolutionCard = document.createElement("div");
        evolutionCard.classList.add("evolution-card", "text-center", "m-2");

        const evolutionSprite = document.createElement("img");
        evolutionSprite.classList.add("evolution-sprite", "img-fluid", "rounded-circle");
        evolutionSprite.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonIdFromUrl(currentEvolution.species.url)}.png`;

        const evolutionName = document.createElement("p");
        evolutionName.classList.add("evolution-name");
        evolutionName.textContent = currentEvolution.species.name;

        evolutionCard.appendChild(evolutionSprite);
        evolutionCard.appendChild(evolutionName);
        evolutionsContainer.appendChild(evolutionCard);

        if (currentEvolution.evolves_to.length > 0) {
            const arrow = document.createElement("span");
            arrow.classList.add("evolution-arrow", "mx-2");
            arrow.innerHTML = "→";
            evolutionsContainer.appendChild(arrow);
            currentEvolution = currentEvolution.evolves_to[0];
        } else {
            currentEvolution = null;
        }
    }
}

function getPokemonIdFromUrl(url) {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 2];
}

// Función para obtener la descripción del Pokémon
async function fetchPokemonDescription(speciesUrl) {
    const speciesResponse = await fetch(speciesUrl);
    const speciesData = await speciesResponse.json();
    const flavorTextEntries = speciesData.flavor_text_entries;

    // Buscar la descripción en inglés
    const englishEntry = flavorTextEntries.find(entry => entry.language.name === 'es');

    return englishEntry ? englishEntry.flavor_text : 'Descripción no disponible.';
}

function mostrarPokemonSeleccionado(pokemon) {
    limpiarHTML();

    const selectedCardContainer = document.createElement("div");
    selectedCardContainer.classList.add("d-flex", "justify-content-center", "align-items-start", "selected-card-container");

    const selectedCard = document.createElement("div");
    selectedCard.classList.add("card", "m-3");

    const spriteContainer = document.createElement("div");
    spriteContainer.classList.add("card-body", "text-center");

    const sprite = document.createElement("img");
    sprite.src = currentView === 'normal' ? pokemon.sprites.front_default : pokemon.sprites.other.home.front_default;
    sprite.classList.add("card-img-top", "img-fluid", "rounded");
    spriteContainer.appendChild(sprite);

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const number = document.createElement("h5");
    number.classList.add("card-title");
    number.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;

    const name = document.createElement("h4");
    name.classList.add("card-title");
    name.textContent = pokemon.name;

    const height = document.createElement("p");
    height.classList.add("card-text");
    height.textContent = `Altura: ${pokemon.height / 10} m`;

    const weight = document.createElement("p");
    weight.classList.add("card-text");
    weight.textContent = `Peso: ${pokemon.weight / 10} kg`;

    // Crear el contenedor para la descripción
    const descriptionContainer = document.createElement("div");
    descriptionContainer.classList.add("description-container", "card", "m-3");
    const descriptionBody = document.createElement("div");
    descriptionBody.classList.add("card-body");
    const descriptionTitle = document.createElement("h5");
    descriptionTitle.classList.add("card-subtitle", "mb-2", "text-muted");
    descriptionTitle.textContent = "Descripción:";
    const descriptionText = document.createElement("p");
    descriptionText.classList.add("description-text");
    descriptionBody.appendChild(descriptionTitle);
    descriptionBody.appendChild(descriptionText);
    descriptionContainer.appendChild(descriptionBody);

    fetchPokemonDescription(pokemon.species.url).then(description => {
        descriptionText.textContent = description;
    });

    // Crear el contenedor para habilidades y ataques
    const abilitiesAndMovesContainer = document.createElement("div");
    abilitiesAndMovesContainer.classList.add("abilities-moves-container", "card", "m-3");
    const abilitiesAndMovesBody = document.createElement("div");
    abilitiesAndMovesBody.classList.add("card-body", "d-flex", "flex-column"); // Añadir clases de flexbox

    // Crear el contenedor para habilidades
    const abilities = document.createElement("div");
    abilities.classList.add("card-text", "mt-3");
    const abilitiesTitle = document.createElement("h5");
    abilitiesTitle.classList.add("card-subtitle", "mb-2", "text-muted");
    abilitiesTitle.textContent = "Habilidades:";
    abilities.appendChild(abilitiesTitle);

    pokemon.abilities.forEach(abilityInfo => {
        const abilityName = document.createElement("p");
        abilityName.classList.add("card-text");
        abilityName.textContent = abilityInfo.ability.name;
        abilities.appendChild(abilityName);
    });

    // Crear el contenedor para ataques
    const moves = document.createElement("div");
    moves.classList.add("card-text", "mt-3");
    const movesTitle = document.createElement("h5");
    movesTitle.classList.add("card-subtitle", "mb-2", "text-muted");
    movesTitle.textContent = "Ataques:";
    moves.appendChild(movesTitle);

    const movePromises = pokemon.moves.slice(0, 5).map(moveInfo => {
        return fetch(moveInfo.move.url)
            .then(response => response.json())
            .then(moveDetails => {
                const moveName = document.createElement("p");
                const power = moveDetails.power !== null ? `Poder: ${moveDetails.power}` : `Descripción: ${moveDetails.effect_entries[0].short_effect}`;
                moveName.innerHTML = `<strong>${moveDetails.name}</strong> - ${power}`;
                moves.appendChild(moveName);
            })
            .catch(error => console.error('Error al obtener detalles del movimiento:', error));
    });

    Promise.all(movePromises).then(() => {
        cardBody.appendChild(number);
        cardBody.appendChild(name);
        cardBody.appendChild(height);
        cardBody.appendChild(weight);
        cardBody.appendChild(descriptionContainer); // Agregar descripción

        abilitiesAndMovesBody.appendChild(abilities); // Agregar habilidades al nuevo contenedor
        abilitiesAndMovesBody.appendChild(moves); // Agregar ataques al nuevo contenedor
        abilitiesAndMovesContainer.appendChild(abilitiesAndMovesBody);

        selectedCard.appendChild(spriteContainer);
        selectedCard.appendChild(cardBody);
        selectedCardContainer.appendChild(selectedCard);
        selectedCardContainer.appendChild(abilitiesAndMovesContainer); // Agregar habilidades y ataques al lado del selectedCard
        pokemonContainer.appendChild(selectedCardContainer);

        const evolutionsContainer = document.createElement("div");
        evolutionsContainer.classList.add("evolutions-section");
        pokemonContainer.appendChild(evolutionsContainer);

        fetchEvolutionChain(pokemon.species.url).then(evolutionChain => {
            displayEvolutionChain(evolutionChain, evolutionsContainer);
        });

        volver.style.display = 'block';
    });

    function displayEvolutionChain(evolutionChain, container) {
        const evolutionsTitle = document.createElement("h5");
        evolutionsTitle.classList.add("mt-4", "text-center", "evolutions-title");
        evolutionsTitle.textContent = "Evoluciones:";
        container.appendChild(evolutionsTitle);
    
        const evolutionsContainer = document.createElement("div");
        evolutionsContainer.classList.add("d-flex", "justify-content-center", "align-items-center", "evolutions-container");
        container.appendChild(evolutionsContainer);
    
        let currentEvolution = evolutionChain.chain;
    
        while (currentEvolution) {
            if (!currentEvolution.species || !currentEvolution.species.url) {
                console.error("Error: Evolución no válida", currentEvolution);
                break; // Salir del bucle si los datos son inválidos
            }
    
            const evolutionCard = document.createElement("div");
            evolutionCard.classList.add("evolution-card", "text-center", "m-2");
    
            const evolutionSprite = document.createElement("img");
            evolutionSprite.classList.add("evolution-sprite", "img-fluid", "rounded-circle");
    
            const evolutionId = getPokemonIdFromUrl(currentEvolution.species.url);
    
            // Validar el ID obtenido
            if (!evolutionId) {
                console.error("Error: No se pudo obtener el ID del Pokémon evolutivo");
                break;
            }
    
            evolutionSprite.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evolutionId}.png`;
    
            // Añadir evento de clic para mostrar el Pokémon
            evolutionSprite.addEventListener('click', () => {
                limpiarHTML(); // Limpiar contenido antes de mostrar el nuevo Pokémon
                llamarApi(evolutionId, true);
            });
    
            const evolutionName = document.createElement("p");
            evolutionName.classList.add("evolution-name");
            evolutionName.textContent = currentEvolution.species.name;
    
            evolutionCard.appendChild(evolutionSprite);
            evolutionCard.appendChild(evolutionName);
            evolutionsContainer.appendChild(evolutionCard);
    
            if (currentEvolution.evolves_to.length > 0) {
                const arrow = document.createElement("span");
                arrow.classList.add("evolution-arrow", "mx-2");
                arrow.innerHTML = "→";
                evolutionsContainer.appendChild(arrow);
                currentEvolution = currentEvolution.evolves_to[0];
            } else {
                currentEvolution = null;
            }
        }
    }
    
}



function crearPokemon(pokemon) {
    const flipCard = document.createElement("div");
    flipCard.classList.add("flip-card");

    const cardContainer = document.createElement("div");
    cardContainer.classList.add("card-container");

    flipCard.appendChild(cardContainer);

    const card = document.createElement("div");
    card.classList.add("pokemon-block");

    const spriteContainer = document.createElement("div");
    spriteContainer.classList.add("img-container");

    const sprite = document.createElement("img");
    if (currentView === 'normal') {
        sprite.src = pokemon.sprites.front_default;
    } else {
        sprite.src = pokemon.sprites.other.home.front_default;
    }
    spriteContainer.appendChild(sprite);

    const number = document.createElement("p");
    number.textContent = `#${pokemon.id.toString().padStart(3, 0)}`;

    const name = document.createElement("p");
    name.classList.add("name");
    name.textContent = pokemon.name;

    card.appendChild(spriteContainer);
    card.appendChild(number);
    card.appendChild(name);

    const cardBack = document.createElement("div");
    cardBack.classList.add("pokemon-block-back");

    cardBack.appendChild(progressBars(pokemon.stats));

    const verPokemon = document.createElement("button");
     verPokemon.textContent = "Ver Pokémon";
     verPokemon.classList.add = ('view-button')
     cardBack.appendChild(verPokemon);
        
    cardContainer.appendChild(card);
    cardContainer.appendChild(cardBack);

    pokemonContainer.appendChild(flipCard);

    verPokemon.addEventListener('click', () => {
        mostrarPokemonSeleccionado(pokemon);
    });

    

}


function progressBars(stats) {
    const statsContainer = document.createElement("div");
    statsContainer.classList.add("stats-container");

    for (let i = 0; i < 3; i++) {
        const stat = stats[i];

        const statPercent = stat.base_stat / 2 + "%";
        const statContainer = document.createElement("stat-container");
        statContainer.classList.add("stat-container");

        const statName = document.createElement("p");
        statName.textContent = stat.stat.name;

        const progress = document.createElement("div");
        progress.classList.add("progress");

        const progressBar = document.createElement("div");
        progressBar.classList.add("progress-bar");
        progressBar.setAttribute("aria-valuenow", stat.base_stat);
        progressBar.setAttribute("aria-valuemin", 0);
        progressBar.setAttribute("aria-valuemax", 200);
        progressBar.style.width = statPercent;

        progressBar.textContent = stat.base_stat;

        progress.appendChild(progressBar);
        statContainer.appendChild(statName);
        statContainer.appendChild(progress);

        statsContainer.appendChild(statContainer);
    }

    return statsContainer;
}

function limpiarHTML() {
    while (pokemonContainer.firstChild) {
        pokemonContainer.removeChild(pokemonContainer.firstChild);
    }
}

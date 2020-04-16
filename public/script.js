class Pokedex {
    constructor(number) {
        this.number = number;
        this.api = `https://pokeapi.co/api/v2/pokemon?offset=0&limit=${number}`;
        this.DOMcontainer = document.querySelector(".pokemon-container");
        this.BtnContainer = document.querySelector(".btn-container");
        this.getData(this.api);
        this.allPokemon = [];
        this.numPages = 0;
        this.index = 0;
    }

    displayData(data) { 
        let abilities = data.abilities.map(ability => ability.ability.name);
        abilities = abilities.join(", "); 
        const image = data.sprites.front_default;
        const name = data.name.charAt(0).toUpperCase()+data.name.substring(1);
        const height = data.height;
        const experience = data.base_experience;
        const types = data.types.map(type => type.type.name).join("/");

        let html = `
            <div class="cart-container">
                <div class="cart-header">
                    <h2 class="cart-title">${name}</h2>
                    ${image != null ? `<img class="cart-img" src="${image}" alt="${name}">`:`<img class="cart-img no-photo" src="../img/pokemon-go.png" alt="no photo"><span class="text-noPokemon">Przepraszamy. Był zbyt szybki. Nie zrobiliśmy zdjęcia</span>`}
                </div>
                <div class="cart-body">
                    <div class="cart-abilities">
                        <div class="cart-text">
                            <h3>Height</h3>
                            <h3>Experience</h3>
                            <h3>Abilities</h3>
                        </div>
                        <div class="cart-value">
                            <h3>${height}</h3>
                            <h3>${experience}</h3>
                            <h3>${abilities}</h3>
                        </div>
                    </div>
                    <h3 class="cart-types">${types}</h3>
                </div>
            </div>
        `;
        this.DOMcontainer.innerHTML += html;    
    };
    
    async getPokemon(url){
        const result = await fetch(url);
        const data = await result.json();
        this.displayData(data)   
    }

    async getData(api) {
        this.DOMcontainer.innerHTML = "";
        const result = await fetch(api);
        const data = await result.json();
        data.results.forEach(result => {
            this.getPokemon(result.url);
        });
        this.next = data.next;
        this.prev = data.previous;
        if(data.previous || data.next) {
            this.BtnContainer.innerHTML = `
            ${
                data.previous ? `<button class="btn" onclick="pokedex.getData(pokedex.prev)">Poprzednia strona</button>` : ''
             }
            ${
                data.next ? `<button class="btn" onclick="pokedex.getData(pokedex.next)">Następna strona</button>` : ''
              }
            `;
        } else {
            this.BtnContainer.innerHTML = "";
        }
    };  
    async searchPokemon(value) {
       fetch(`https://pokeapi.co/api/v2/pokemon/${value}`)
       .then(response => {
           if(response.ok){
            response.json().then(data =>{
                this.DOMcontainer.innerHTML = "";
                this.BtnContainer.innerHTML = `
                     <button onclick="pokedex.getData('https://pokeapi.co/api/v2/pokemon?offset=0&limit=20')">Pokaż wszystkie</button>
                 `;
                this.displayData(data);
            })
           }else {
            throw Error(console.log("błąd"));
        }
       }) 
       .catch(error =>{
            this.DOMcontainer.innerHTML = `
            <div class="no-pokemon-container">
                <h2>Nie ma takiego pokemona, albo nie udało nam się go jeszcze złapać. Spróbuj ponownie</h2>
                <img class="no-pokemon" src="img/pokemonGo.png" title="no pokemon">
            </div>    
            `;
            this.BtnContainer.innerHTML = `
                <button onclick="pokedex.getData('https://pokeapi.co/api/v2/pokemon?offset=0&limit=20')">
                Pokaż wszystkie</button>
            `;
        }); 
    };

    searchByName() {
        event.preventDefault();
        const searchInput = document.querySelector(".search-pokemon");
        if(!searchInput.value) {
            return;  
        } else {
            pokedex.searchPokemon(searchInput.value);
            searchInput.value = "";
        }
    };

    displayPokemonsByType(type){
       this.DOMcontainer.innerHTML = "";

       if(type === "next"){
            this.index++;
       } else if (type === "prev"){
           this.index--;
       }
        this.allPokemon[this.index].forEach(pokemon => {
            const url = pokemon.pokemon.url;
            this.getPokemon(url);
        });
        this.BtnContainer.innerHTML = `
        ${
            this.index > 0 ? `<button class="btn" onclick="pokedex.displayPokemonsByType('prev')">Poprzednia strona</button>` : ''
         }
        ${
            this.index == this.numPages-1 ? '' : `<button class="btn" onclick="pokedex.displayPokemonsByType('next')">Następna strona</button>`
          }
        `;  
    }

    async getPokemonByType(type) {
        const result = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const data = await result.json();
        const pokemons = data.pokemon;
        this.numPages = Math.ceil(pokemons.length/this.number);
        this.allPokemon = [];
        let start = 0;
        let end = this.number;
        this.index = 0;
        for(let i = 0; i < this.numPages; i++){
            let tab = pokemons.slice(start,end);
            start += this.number;
            end += this.number;
            this.allPokemon.push(tab); 
        }
   
        this.displayPokemonsByType();   
    };

    searchByType() {
        const type = event.target.value;
        pokedex.DOMcontainer.innerHTML = "";
        if(type === "all"){
            pokedex.getData(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=20`);  
        } else {
            pokedex.getPokemonByType(type);
        }       
    }
}

function init() {
    const number = 30;
    pokedex = new Pokedex(number);
    const formName = document.querySelector(".form-name");
    //searching pokemons by name
    formName.addEventListener("submit", pokedex.searchByName);
    const formType = document.querySelector(".form-type");
    //searching pokemons by type
    formType.addEventListener("change", pokedex.searchByType);

    const goToTop = () => {
        const arrow = document.querySelector(".btn-arrow");
        const pokemonSection = document.querySelector(".pokemon-section");
        const top = pokemonSection.offsetTop;
        
        if(this.scrollY >= top){
            arrow.classList.add("active");
        } else {
            arrow.classList.remove("active");
        }

        arrow.addEventListener("click", function() {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        })
    }

    window.addEventListener("scroll", goToTop);
}

document.addEventListener("DOMContentDownload", init());


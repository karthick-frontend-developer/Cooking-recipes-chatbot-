const API_KEY = "1d36a161bfe24eac8e85b9520c383657";
let dictionary;

async function loadDictionary() {
    const aff = await fetch("dictionaries/en_US/en_US.aff").then(res => res.text());
    const dic = await fetch("dictionaries/en_US/en_US.dic").then(res => res.text());
    dictionary = new Typo("en_US", aff, dic);
}

function cli() {
    const rawInput = document.getElementById("inputvalue").value;
    if (!rawInput) return;

    const input = correctSpelling(rawInput.toLowerCase());
    addMessage(rawInput, "user");

    const extractedIngredients = extractIngredients(input);
    if (extractedIngredients.length > 0) {
        getRecipe(extractedIngredients.join(","));
    } else {
        addMessage("❌ Couldn't detect ingredients. Please try again.", "bot");
    }
}

function correctSpelling(text) {
    return text.split(" ").map(word => {
        if (dictionary && !dictionary.check(word)) {
            const suggestions = dictionary.suggest(word);
            return suggestions.length ? suggestions[0] : word;
        }
        return word;
    }).join(" ");
}

function extractIngredients(text) {
    const commonWords = ["give", "me", "recipe", "for", "with", "i", "have", "need", "to", "cook"];
    return text.split(" ").filter(word => !commonWords.includes(word));
}

function addMessage(text, sender) {
    const chatbox = document.querySelector(".chatmsg");
    const className = sender === "user" ? "user-msg" : "bot-msg";
    chatbox.innerHTML += `<div class="${className}">${text}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
}

async function getRecipe(ingredients) {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=1&apiKey=${API_KEY}`;
    try {
        const response = await axios.get(url);
        if (response.data.length === 0) {
            addMessage("❌ No recipes found. Try different ingredients!", "bot");
            return;
        }
        const recipe = response.data[0];
        const recipeInfo = `
           <center><strong>🍽️ Recipe:</strong> ${recipe.title} <br>
            <img src="${recipe.image}" width="150"><br>
            <button onclick="getInstructions(${recipe.id})">📖 Get Instructions</button></center>
        `;
        addMessage(recipeInfo, "bot");
    } catch (error) {
        addMessage("❌ Error fetching recipe. Try again!", "bot");
        console.error(error);
    }
}

async function getInstructions(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`;
    try {
        const response = await axios.get(url);
        const recipe = response.data;
        const steps = recipe.analyzedInstructions[0]?.steps.map(
            step => `${step.number}. ${step.step}`
        ).join("<br>") || "No instructions available.";

        addMessage(`<strong>👨‍🍳 Instructions for ${recipe.title}:</strong><br>${steps}`, "bot");
    } catch (error) {
        addMessage("❌ Error fetching instructions.", "bot");
        console.error(error);
    }
}

// Load dictionary on startup
loadDictionary();

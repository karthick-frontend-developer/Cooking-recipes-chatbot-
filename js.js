const API_KEY = "1d36a161bfe24eac8e85b9520c383657";
function cli()
{
    const input = document.getElementById("inputvalue").value.toLowerCase()
    if(!input) return;
    addMessage(input,"user")
    getrecipe(input);
}
function addMessage(text,sender)
{
    const chatbox = document.querySelector(".chatmsg")
    if (sender == "user")
    {
        chatbox.innerHTML += `<div class="user-msg">${text}</div>`  
    }
    else if (sender == "bot")
    {
         chatbox.innerHTML += `<div class="bot-msg1">${text}</div>`
    }
    else
    {
        chatbox.innerHTML += `<div class="bot-msg">${text}</div>`
    }
    
    chatbox.scrollTop = chatbox.scrollHeight;
}
async function getrecipe(ingredients) {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=1&apiKey=${API_KEY}`;
    console.log(url)
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
        let steps = recipe.analyzedInstructions[0]?.steps.map(step => `${step.number}. ${step.step}`).join("<br>") || "No instructions available.";

        addMessage(`<strong>👨‍🍳 Instructions for ${recipe.title}:</strong><br>${steps}`,"bot");
    } catch (error) {
        addMessage("❌ Error fetching instructions.", "bot");
        console.error(error);
    }
}
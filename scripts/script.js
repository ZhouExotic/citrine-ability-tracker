// Load JSON data and initialize the table
async function loadAbilities() {
    try {
        const abilitiesResponse = await fetch('data/abilities.json');
        const abilities = await abilitiesResponse.json();

        const cultivationStagesResponse = await fetch('data/cultivationstages.json');
        const cultivationStages = await cultivationStagesResponse.json();

        const breakthroughsResponse = await fetch('data/breakthroughs.json');
        const breakthroughs = await breakthroughsResponse.json();

        // Function to display abilities dynamically
        displayAbilities(abilities, cultivationStages, breakthroughs);
    } catch (error) {
        console.error("Failed to load abilities:", error);
    }
}

// Function to fetch the breakthroughs based on default and exceptions
function getBooksForLevel(stage, level, breakthroughs) {
    // Check if the stage has an exception
    const stageBreakthroughs = breakthroughs.exceptions[stage] || breakthroughs.default;
    
    // Find the corresponding breakthrough for the given level
    const matchingBreakthrough = stageBreakthroughs.find(b => level >= b.level);
    
    return matchingBreakthrough ? matchingBreakthrough.books : 0;
}

// Function to calculate citrine cost for a given ability level
function calculateCitrineCost(ability, level, breakthroughs) {
    let totalBooks = 0;

    // Loop through the level in increments of 10, getting the book requirement at each increment
    for (let i = 0; i <= level; i += 10) {
        const booksForLevel = getBooksForLevel(ability.cultivationStage, i, breakthroughs);
        totalBooks += booksForLevel;
    }

    return totalBooks * ability.citrinePerBook;
}

// Function to display abilities organized by cultivation stages
function displayAbilities(abilities, cultivationStages, breakthroughs) {
    const mainContainer = document.querySelector('.content-container');
    mainContainer.innerHTML = ''; // Clear the content container

    cultivationStages.forEach((stage) => {
        // Create a section for each stage
        const section = document.createElement('div');
        section.classList.add('section');

        const stageHeader = document.createElement('h2');
        stageHeader.textContent = stage.name;
        section.appendChild(stageHeader);

        const abilityGroup = document.createElement('div');
        abilityGroup.classList.add('ability-group');

        // Get the abilities that belong to this stage
        const stageAbilities = abilities.filter(
            (ability) => ability.cultivationStage === stage.name
        );

        stageAbilities.forEach((ability) => {
            const abilityBox = document.createElement('div');
            abilityBox.classList.add('ability-box');

            const abilityLabel = document.createElement('span');
            abilityLabel.textContent = ability.abilityName;

            const input = document.createElement('input');
            input.type = 'number';
            input.min = 0;
            input.max = ability.maxLevel;
            input.value = localStorage.getItem(ability.abilityName) || 0;
            input.dataset.ability = ability.abilityName;

            const citrineLabel = document.createElement('span');
            citrineLabel.classList.add('citrine-label');
            const currentCitrine = calculateCitrineCost(
                ability,
                input.value,
                breakthroughs
            );
            citrineLabel.textContent = `Citrine: ${currentCitrine}`;

            // Event listener for input change
            input.addEventListener('input', function () {
                const newLevel = parseInt(input.value);
                const citrineCost = calculateCitrineCost(
                    ability,
                    newLevel,
                    breakthroughs
                );

                citrineLabel.textContent = `Citrine: ${citrineCost}`;
                localStorage.setItem(ability.abilityName, newLevel);
            });

            // Append to the ability box
            abilityBox.appendChild(abilityLabel);
            abilityBox.appendChild(input);
            abilityBox.appendChild(citrineLabel);

            // Append ability box to the ability group
            abilityGroup.appendChild(abilityBox);
        });

        section.appendChild(abilityGroup);
        mainContainer.appendChild(section);
    });
}

// Load abilities when the page loads
window.addEventListener('DOMContentLoaded', loadAbilities);

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

// Function to calculate citrine cost for a given ability level
function calculateCitrineCost(ability, level, breakthroughs) {
    const stageBreakthroughs = breakthroughs.find(
        (breakthrough) => breakthrough.cultivationStage === ability.cultivationStage
    );

    if (!stageBreakthroughs) {
        return 0; // Return 0 if no breakthroughs are found for the cultivation stage
    }

    let totalBooks = 0;

    stageBreakthroughs.breakthroughs.forEach((breakthrough) => {
        if (level >= breakthrough.level) {
            totalBooks += breakthrough.books;
        }
    });

    return totalBooks * ability.citrinePerBook;
}


// Function to calculate and update total citrine cost
function updateTotalCitrine() {
    const allInputs = document.querySelectorAll('input[type="number"]');
    let totalCitrine = 0;

    allInputs.forEach(input => {
        const abilityName = input.dataset.ability;
        const abilityLevel = parseInt(input.value);
        const abilityData = input.dataset.abilityData ? JSON.parse(input.dataset.abilityData) : null;
        const breakthroughs = input.dataset.breakthroughs ? JSON.parse(input.dataset.breakthroughs) : null;

        if (abilityData && breakthroughs) {
            const citrineCost = calculateCitrineCost(abilityData, abilityLevel, breakthroughs);
            totalCitrine += citrineCost;
        }
    });

    document.getElementById('total-citrine').textContent = `Total Citrine: ${totalCitrine}`;
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
            input.step = 10; // Step increments of 10
            input.value = localStorage.getItem(ability.abilityName) || 0;
            input.dataset.ability = ability.abilityName;

            // Store ability data and breakthroughs in dataset
            input.dataset.abilityData = JSON.stringify(ability);
            input.dataset.breakthroughs = JSON.stringify(breakthroughs);

            const citrineLabel = document.createElement('span');
            citrineLabel.classList.add('citrine-label');
            const currentCitrine = calculateCitrineCost(
                ability,
                input.value,
                breakthroughs
            );
            citrineLabel.textContent = `Citrine: ${currentCitrine}`;

            // Event listener for input change to recalculate citrine cost
            input.addEventListener('input', function () {
                const newLevel = parseInt(input.value);
                const citrineCost = calculateCitrineCost(
                    ability,
                    newLevel,
                    breakthroughs
                );

                citrineLabel.textContent = `Citrine: ${citrineCost}`;
                localStorage.setItem(ability.abilityName, newLevel);

                // Update total citrine whenever an ability input is changed
                updateTotalCitrine();
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

    // Ensure total citrine is calculated when the page loads
    updateTotalCitrine();
}



// Load abilities when the page loads
window.addEventListener('DOMContentLoaded', loadAbilities);

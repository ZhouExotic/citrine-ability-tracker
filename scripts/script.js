// Load JSON data and initialize the table
async function loadAbilities() {
    try {
        const abilitiesResponse = await fetch('data/abilities.json');
        const abilities = await abilitiesResponse.json();
        console.log("Abilities loaded:", abilities);

        const cultivationStagesResponse = await fetch('data/cultivationstages.json');
        const cultivationStages = await cultivationStagesResponse.json();
        console.log("Cultivation Stages loaded:", cultivationStages);

        const breakthroughsResponse = await fetch('data/breakthroughs.json');
        const breakthroughs = await breakthroughsResponse.json();
        console.log("Breakthroughs loaded:", breakthroughs);

        // Function to display abilities dynamically
        displayAbilities(abilities, cultivationStages, breakthroughs);
    } catch (error) {
        console.error("Failed to load abilities:", error);
    }
}

// Function to switch tabs
function handleTabSwitching(abilities, cultivationStages, breakthroughs) {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons and add to clicked one
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Get the path from the button and display relevant abilities
            const selectedPath = this.dataset.path;
            displayAbilities(abilities, cultivationStages, breakthroughs, selectedPath);
        });
    });
}

// Function to calculate citrine cost for a given ability level
function calculateCitrineCost(ability, level, breakthroughs) {
    const stageBreakthroughs = breakthroughs.find(
        (breakthrough) => breakthrough.cultivationStage === ability.cultivationStage
    );

    if (!stageBreakthroughs) {
        return 0;
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

// Function to display abilities organized by cultivation stages for the selected path
function displayAbilities(abilities, cultivationStages, breakthroughs, selectedPath) {
    const mainContainer = document.querySelector('.content-container');
    mainContainer.innerHTML = ''; // Clear the content container

    console.log(`Selected Path: ${selectedPath}`);
    console.log('Abilities:', abilities);
    console.log('Cultivation Stages:', cultivationStages);
    console.log('Breakthroughs:', breakthroughs);

    // Filter abilities by selected path
    const pathAbilities = abilities.filter(ability => ability.path === selectedPath);
    console.log(`Filtered Abilities for ${selectedPath}:`, pathAbilities);

    cultivationStages.forEach((stage) => {
        console.log(`Processing cultivation stage: ${stage.name}`);

        // Create a section for each stage
        const section = document.createElement('div');
        section.classList.add('section');

        const stageHeader = document.createElement('h2');
        stageHeader.textContent = stage.name;
        section.appendChild(stageHeader);

        const abilityGroup = document.createElement('div');
        abilityGroup.classList.add('ability-group');

        // Get the abilities that belong to this stage and path
        const stageAbilities = pathAbilities.filter(
            (ability) => ability.cultivationStage === stage.name
        );
        console.log(`Abilities for stage "${stage.name}":`, stageAbilities);

        stageAbilities.forEach((ability) => {
            console.log(`Displaying ability: ${ability.abilityName}`);

            const abilityBox = document.createElement('div');
            abilityBox.classList.add('ability-box');

            const abilityLabel = document.createElement('span');
            abilityLabel.textContent = ability.abilityName;

            const input = document.createElement('input');
            input.type = 'number';
            input.min = 0;
            input.max = ability.maxLevel;
            input.step = 10;
            input.value = localStorage.getItem(ability.abilityName) || 0;
            input.dataset.ability = ability.abilityName;
            input.dataset.abilityData = JSON.stringify(ability);
            input.dataset.breakthroughs = JSON.stringify(breakthroughs);

            const citrineLabel = document.createElement('span');
            citrineLabel.classList.add('citrine-label');
            const currentCitrine = calculateCitrineCost(
                ability,
                input.value,
                breakthroughs
            );
            console.log(`Initial Citrine cost for ${ability.abilityName} at level ${input.value}: ${currentCitrine}`);
            citrineLabel.textContent = `Citrine: ${currentCitrine}`;

            // Event listener for input change
            input.addEventListener('input', function () {
                const newLevel = parseInt(input.value);
                const citrineCost = calculateCitrineCost(
                    ability,
                    newLevel,
                    breakthroughs
                );
                console.log(`Updated Citrine cost for ${ability.abilityName} at level ${newLevel}: ${citrineCost}`);

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

        // Only append section if it has abilities
        if (stageAbilities.length > 0) {
            section.appendChild(abilityGroup);
            mainContainer.appendChild(section);
        } else {
            console.log(`No abilities found for cultivation stage: ${stage.name}`);
        }
    });

    // Ensure total citrine is calculated when the page loads
    updateTotalCitrine();
}

// Load abilities when the page loads
window.addEventListener('DOMContentLoaded', loadAbilities);

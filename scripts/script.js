async function loadAbilities() {
    try {
        const abilitiesResponse = await fetch('data/abilities.json');
        const abilities = await abilitiesResponse.json();

        const cultivationStagesResponse = await fetch('data/cultivationstages.json');
        const cultivationStages = await cultivationStagesResponse.json();

        const breakthroughsResponse = await fetch('data/breakthroughs.json');
        const breakthroughs = await breakthroughsResponse.json();

        // Initialize tabs and ability display
        initializeTabs(abilities, cultivationStages, breakthroughs);
    } catch (error) {
        console.error("Failed to load abilities:", error);
    }
}

function calculateCitrineCost(ability, level, breakthroughs) {
    const stageBreakthroughs = breakthroughs.find(b => b.cultivationStage === ability.cultivationStage);
    let totalBooks = 0;

    if (stageBreakthroughs) {
        stageBreakthroughs.breakthroughs.forEach(breakthrough => {
            if (level >= breakthrough.level) {
                totalBooks += breakthrough.books;
            }
        });
    }

    return totalBooks * ability.citrinePerBook;
}

function displayAbilities(abilities, breakthroughs) {
    const contentContainer = document.querySelector('.content-container');
    contentContainer.innerHTML = '';  // Clear previous abilities

    abilities.forEach(ability => {
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
        const currentCitrine = calculateCitrineCost(ability, input.value, breakthroughs);
        citrineLabel.textContent = `Citrine: ${currentCitrine}`;

        input.addEventListener('input', function () {
            const newLevel = parseInt(input.value);
            const citrineCost = calculateCitrineCost(ability, newLevel, breakthroughs);
            citrineLabel.textContent = `Citrine: ${citrineCost}`;

            localStorage.setItem(ability.abilityName, newLevel);
            updateTotalCitrine(abilities, breakthroughs);
        });

        abilityBox.appendChild(abilityLabel);
        abilityBox.appendChild(input);
        abilityBox.appendChild(citrineLabel);

        contentContainer.appendChild(abilityBox);
    });

    updateTotalCitrine(abilities, breakthroughs);
}

function initializeTabs(abilities, cultivationStages, breakthroughs) {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const path = button.dataset.path;
            const filteredAbilities = abilities.filter(a => a.path === path);
            displayAbilities(filteredAbilities, breakthroughs);
        });
    });

    // Trigger initial display
    document.querySelector('.tab-button.active').click();
}

function updateTotalCitrine(abilities, breakthroughs) {
    let totalCitrine = 0;

    abilities.forEach(ability => {
        const level = parseInt(localStorage.getItem(ability.abilityName)) || 0;
        totalCitrine += calculateCitrineCost(ability, level, breakthroughs);
    });

    document.getElementById('total-citrine').textContent = totalCitrine;
}

window.addEventListener('DOMContentLoaded', loadAbilities);

// Ensure DOM is fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// Function to fetch JSON data
async function fetchData() {
    try {
        const abilitiesResponse = await fetch('data/abilities.json');
        const abilitiesData = await abilitiesResponse.json();
        displayAbilities(abilitiesData); // Populates the table with abilities
        loadSavedLevels();  // Load saved levels from local storage
    } catch (error) {
        console.error('Failed to load abilities:', error);
    }
}

// Function to populate the abilities table from the JSON data
function displayAbilities(abilitiesData) {
    const tableBody = document.querySelector('#techniques-table tbody');
    
    if (!tableBody) {
        console.error('Table body not found!');
        return;
    }

    tableBody.innerHTML = ''; // Clear the table body before populating

    abilitiesData.forEach((ability) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${ability.abilityName}</td>
            <td>${ability.cultivationStage}</td>
            <td>${ability.maxLevel}</td>
            <td>${ability.abilityType}</td>
            <td>
                <input type="number" min="0" max="${ability.maxLevel}" step="10" value="0" 
                    data-ability="${ability.abilityName}" data-stage="${ability.cultivationStage}" 
                    onchange="handleLevelInput(this)">
            </td>
            <td class="citrine-cost">0</td>
        `;
        tableBody.appendChild(row);
    });

    updateTotalCitrineCost();  // Update total citrine cost when the table is populated
}

// Breakthrough levels and books required (global configuration)
const breakthroughBooks = {
    0: 0,
    20: 4,
    30: 10,
    40: 18,
    50: 32,
    60: 52,
    70: 78,
    80: 113,
    90: 153,
    100: 198
};

// Citrine cost per book by cultivation stage
const cultivationStages = {
    "Connection": 100,
    "Foundation": 150,
    "Virtuoso": 240,
    "Nascent": 280,
    "Incarnation": 400,
    "Incarnation extra": 450,
    "Immortal's Will": 200,
    "Voidbreak 1": 150,
    "Voidbreak 1 - element": 200,
    "Voidbreak 2": 200,
    "Voidbreak 2 - element": 280,
    "Wholeness 1": 280,
    "Wholeness 1 - element": 400,
    "Wholeness 2": 400,
    "Wholeness 2 - element": 450,
    "Perfection": 500,
    "Perfection - element": 500,
    "Nirvana": 500,
    "Nirvana - element": 500
};

// Function to calculate and update the Citrine cost based on input level
function handleLevelInput(input) {
    const level = parseInt(input.value);
    const abilityName = input.getAttribute('data-ability');
    const cultivationStage = input.getAttribute('data-stage');
    const citrineCostCell = input.parentElement.nextElementSibling;

    const citrineCost = calculateCitrineCost(level, cultivationStage);
    citrineCostCell.textContent = citrineCost;

    saveUserLevel(abilityName, level); // Save the user's input
    updateTotalCitrineCost(); // Update the total Citrine cost across all inputs
}

// Function to calculate the total Citrine cost for a specific level and cultivation stage
function calculateCitrineCost(level, stage) {
    let totalCost = 0;

    // Loop through each breakthrough point
    for (const [breakpoint, booksRequired] of Object.entries(breakthroughBooks)) {
        // If the user's level is greater than the current breakpoint, add the cost
        if (level >= breakpoint) {
            const citrinePerBook = cultivationStages[stage] || 0;
            totalCost += booksRequired * citrinePerBook;
        }
    }

    return totalCost;
}

// Function to update the total Citrine cost based on all input levels
function updateTotalCitrineCost() {
    let totalCitrine = 0;
    document.querySelectorAll('#techniques-table .citrine-cost').forEach(cell => {
        totalCitrine += parseInt(cell.textContent) || 0;
    });
    document.getElementById('total-citrine').textContent = `Total Citrine: ${totalCitrine}`;
}

// Function to save user levels in local storage
function saveUserLevel(abilityName, level) {
    const savedLevels = JSON.parse(localStorage.getItem('userLevels') || '{}');
    savedLevels[abilityName] = level;
    localStorage.setItem('userLevels', JSON.stringify(savedLevels));
}

// Function to load saved user levels from local storage
function loadSavedLevels() {
    const savedLevels = JSON.parse(localStorage.getItem('userLevels') || '{}');
    document.querySelectorAll('#techniques-table input').forEach(input => {
        const abilityName = input.getAttribute('data-ability');
        if (savedLevels[abilityName]) {
            input.value = savedLevels[abilityName];
            handleLevelInput(input); // Trigger the Citrine cost calculation
        }
    });
}

// On page load, fetch data and populate the table
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

// Sample data structure for packing list items
const packingListData = {
    swim: {
        name: "Swimming",
        items: ["Swim suit", "Beach towel", "Goggles"]
    },
    gear: {
        name: "Gear",
        items: ["Sunglasses", "Umbrella", "Tent", "Sleeping bags", "Sleeping pad", "Extra blanket", "Pillows", "Lantern / flashlight", "Head lamp", "Camp chairs"]
    },
    activities: {
        name: "Activities",
        items: ["Beach tent", "Picnic blanket", "Kite", "Bocce balls", "Card games"]
    },
    kids: {
        name: "Kids",
        items: ["Toys", "Books", "Cuddlies", "Floaties"]
    },
    clothes: {
        name: "Clothes",
        items: ["Hiking boots", "Flip flops", "Pajamas", "Sweater", "Jacket", "Pants", "Shorts", "Shirts", "Underwear", "Hat", "Socks"]
    },
    cooking: {
        name: "Cooking",
        items: ["Lighter / Matches", "Firewood", "Tin foil", "Zip lock bags", "Camp stove", "Jet boil", "Saucepan", "Frying pan", "Plates", "Cups", "Silverware", "Paper towels", "Cutting board", "Knife", "Mug", "Water jug", "Coffee maker", "Food nets", "Cooler", "Water bottles", "Propane", "Sponge", "Dishsoap", "Washing tub", "Trash bags"]
    },
    food: {
        name: "Food",
        items: ["Tea bags", "Coffee"]
    },
    toilettries: {
        name: "Toilettries",
        items: ["Toilet paper", "Hand sanitizer", "Soap", "Toothbrush", "Toothpaste", "Towel", "Hairbrush", "Sunscreen", "Bug spray", "Deodorant"]
    },
    miscellaneous: {
        name: "Miscellaneous",
        items: ["Charging cable", "Car snacks"]
    }
};

// Weather-specific items
const weatherItems = {
    rainy: {
        clothing: ["Rain jacket / Poncho", "Rain pants", "Waterproof boots", "Umbrella"],
        gear: ["Tarp", "Ground cloth"]
    },
    cold: {
        clothing: ["Thermal underwear", "Winter jacket", "Gloves", "Winter hat"],
        gear: ["Hand warmers", "Extra blankets"]
    }
};

// Activity-specific items
const activityItems = {
    cookout: {
        cooking: ["Grill", "Charcoal", "Lighter fluid", "Cooler", "Ice"],
        gear: ["Fire starter", "Matches"]
    },
    swimming: {
        clothing: ["Swimsuit", "Beach towel", "Life jacket", "Goggles"]
    }
};

// DOM Elements
const tripForm = document.getElementById('trip-form');
const tripDetailsPage = document.getElementById('trip-details');
const packingListPage = document.getElementById('packing-list');
const listContainer = document.getElementById('list-container');
const newItemInput = document.getElementById('new-item');
const addItemButton = document.getElementById('add-item');
const shareListButton = document.getElementById('share-list');
const backToFormButton = document.getElementById('back-to-form');

// Store deleted items for undo functionality
let deletedItems = [];

// Store the current packing list state
let currentPackingList = null;
let formState = {
    weather: [],
    activities: [],
    kids: [],
    bearCountry: []
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    tripForm.addEventListener('submit', generatePackingList);
    addItemButton.addEventListener('click', addNewItem);
    shareListButton.addEventListener('click', shareList);
    backToFormButton.addEventListener('click', () => {
        // Save the current state of checkboxes
        const checkedItems = new Set();
        document.querySelectorAll('.item input[type="checkbox"]:checked').forEach(checkbox => {
            checkedItems.add(checkbox.id);
        });

        // Switch to form page
        packingListPage.classList.remove('active');
        tripDetailsPage.classList.add('active');

        // Restore form state
        restoreFormState();

        // Restore the packing list with checked items when returning
        if (currentPackingList) {
            setTimeout(() => {
                displayPackingList(currentPackingList);
                // Restore checked state
                checkedItems.forEach(id => {
                    const checkbox = document.getElementById(id);
                    if (checkbox) checkbox.checked = true;
                });
            }, 0);
        }
    });
});

// Save form state before generating list
function saveFormState() {
    formState = {
        weather: Array.from(document.querySelectorAll('input[name="weather"]:checked')).map(cb => cb.value),
        activities: Array.from(document.querySelectorAll('input[name="activities"]:checked')).map(cb => cb.value),
        kids: Array.from(document.querySelectorAll('input[name="kids"]:checked')).map(cb => cb.value),
        bearCountry: Array.from(document.querySelectorAll('input[name="bear-country"]:checked')).map(cb => cb.value)
    };
}

// Restore form state
function restoreFormState() {
    // Restore weather checkboxes
    document.querySelectorAll('input[name="weather"]').forEach(checkbox => {
        checkbox.checked = formState.weather.includes(checkbox.value);
    });

    // Restore activities checkboxes
    document.querySelectorAll('input[name="activities"]').forEach(checkbox => {
        checkbox.checked = formState.activities.includes(checkbox.value);
    });

    // Restore kids checkbox
    document.querySelectorAll('input[name="kids"]').forEach(checkbox => {
        checkbox.checked = formState.kids.includes(checkbox.value);
    });

    // Restore bear country checkbox
    document.querySelectorAll('input[name="bear-country"]').forEach(checkbox => {
        checkbox.checked = formState.bearCountry.includes(checkbox.value);
    });
}

// Generate packing list based on user selections
function generatePackingList(e) {
    e.preventDefault();
    
    // Save form state before generating new list
    saveFormState();
    
    const formData = new FormData(tripForm);
    const selectedWeather = formData.getAll('weather');
    const selectedActivities = formData.getAll('activities');
    const kidsComing = formData.getAll('kids').includes('yes');
    const bearCountry = formData.getAll('bear-country').includes('yes');

    // Create a deep copy of the base packing list
    let finalList = JSON.parse(JSON.stringify(packingListData));

    // Remove kids category if kids are not coming
    if (!kidsComing) {
        delete finalList.kids;
    }

    // Remove swim category if swimming is not selected
    if (!selectedActivities.includes('swimming')) {
        delete finalList.swim;
    }

    // Add bear spray if in bear country
    if (bearCountry) {
        finalList.gear.items.push("Bear spray");
    }

    // Add weather-specific items
    selectedWeather.forEach(weather => {
        if (weatherItems[weather]) {
            Object.entries(weatherItems[weather]).forEach(([category, items]) => {
                if (finalList[category]) {
                    finalList[category].items.push(...items);
                }
            });
        }
    });

    // Add activity-specific items
    selectedActivities.forEach(activity => {
        if (activityItems[activity]) {
            Object.entries(activityItems[activity]).forEach(([category, items]) => {
                if (finalList[category]) {
                    finalList[category].items.push(...items);
                }
            });
        }
    });

    // Remove duplicates
    Object.keys(finalList).forEach(category => {
        finalList[category].items = [...new Set(finalList[category].items)];
    });

    // Store the current list
    currentPackingList = finalList;
    displayPackingList(finalList);
    tripDetailsPage.classList.remove('active');
    packingListPage.classList.add('active');
}

// Display the packing list
function displayPackingList(list) {
    listContainer.innerHTML = '';
    
    // Add undo button container if there are deleted items
    if (deletedItems.length > 0) {
        const undoContainer = document.createElement('div');
        undoContainer.className = 'undo-container';
        undoContainer.innerHTML = `
            <button class="btn undo-btn">Undo Last Delete</button>
        `;
        listContainer.appendChild(undoContainer);

        // Add event listener to undo button
        const undoButton = undoContainer.querySelector('.undo-btn');
        undoButton.addEventListener('click', undoLastDelete);
    }
    
    Object.entries(list).forEach(([category, data]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `
            <h3>${data.name}</h3>
            <div class="items-container"></div>
        `;
        
        const itemsContainer = categoryDiv.querySelector('.items-container');
        // Sort items alphabetically
        const sortedItems = [...data.items].sort((a, b) => a.localeCompare(b));
        
        sortedItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'item';
            itemDiv.innerHTML = `
                <input type="checkbox" id="${item.toLowerCase().replace(/\s+/g, '-')}">
                <label for="${item.toLowerCase().replace(/\s+/g, '-')}">${item}</label>
                <button class="remove-item" title="Remove item">×</button>
            `;
            itemsContainer.appendChild(itemDiv);
        });
        
        listContainer.appendChild(categoryDiv);
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemDiv = e.target.closest('.item');
            const category = itemDiv.closest('.category').querySelector('h3').textContent;
            const itemName = itemDiv.querySelector('label').textContent;
            
            // Store the deleted item information
            deletedItems.push({
                category: category,
                item: itemName
            });
            
            // Update undo button visibility
            updateUndoButton();
            
            itemDiv.remove();
        });
    });
}

// Update undo button visibility
function updateUndoButton() {
    let undoContainer = document.querySelector('.undo-container');
    
    if (deletedItems.length > 0) {
        if (!undoContainer) {
            undoContainer = document.createElement('div');
            undoContainer.className = 'undo-container';
            undoContainer.innerHTML = `
                <button class="btn undo-btn">Undo Last Delete</button>
            `;
            listContainer.insertBefore(undoContainer, listContainer.firstChild);
            
            // Add event listener to undo button
            const undoButton = undoContainer.querySelector('.undo-btn');
            undoButton.addEventListener('click', undoLastDelete);
        }
    } else if (undoContainer) {
        undoContainer.remove();
    }
}

// Undo last delete
function undoLastDelete() {
    if (deletedItems.length === 0) return;
    
    const lastDeleted = deletedItems.pop();
    const categoryDiv = Array.from(document.querySelectorAll('.category')).find(
        div => div.querySelector('h3').textContent === lastDeleted.category
    );
    
    if (categoryDiv) {
        const itemsContainer = categoryDiv.querySelector('.items-container');
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <input type="checkbox" id="${lastDeleted.item.toLowerCase().replace(/\s+/g, '-')}">
            <label for="${lastDeleted.item.toLowerCase().replace(/\s+/g, '-')}">${lastDeleted.item}</label>
            <button class="remove-item" title="Remove item">×</button>
        `;
        itemsContainer.appendChild(itemDiv);
        
        // Add event listener to the new remove button
        const removeButton = itemDiv.querySelector('.remove-item');
        removeButton.addEventListener('click', (e) => {
            const itemDiv = e.target.closest('.item');
            const category = itemDiv.closest('.category').querySelector('h3').textContent;
            const itemName = itemDiv.querySelector('label').textContent;
            
            deletedItems.push({
                category: category,
                item: itemName
            });
            
            updateUndoButton();
            itemDiv.remove();
        });
    }
    
    updateUndoButton();
}

// Add new item to the list
function addNewItem() {
    const newItem = newItemInput.value.trim();
    if (!newItem) return;

    // Simple category detection based on keywords
    let category = 'miscellaneous';
    const itemLower = newItem.toLowerCase();
    
    if (itemLower.match(/swim|beach|towel/)) {
        category = 'swim';
    } else if (itemLower.match(/tent|sleeping|lantern|flashlight|chair|umbrella/)) {
        category = 'gear';
    } else if (itemLower.match(/game|toy|ball|kite|card/)) {
        category = 'activities';
    } else if (itemLower.match(/book|cuddly|toy/)) {
        category = 'kids';
    } else if (itemLower.match(/shirt|pants|socks|underwear|jacket|boots|hat|sweater|flip|flop|pajama/)) {
        category = 'clothes';
    } else if (itemLower.match(/stove|pan|utensil|plate|cup|food|cook|pot|knife|sponge|dish|water/)) {
        category = 'cooking';
    } else if (itemLower.match(/tea|coffee|snack/)) {
        category = 'food';
    } else if (itemLower.match(/tooth|soap|towel|shampoo|brush|sunscreen|bug|deodorant/)) {
        category = 'toilettries';
    }

    // Add the new item to the appropriate category
    const categoryDiv = listContainer.querySelector(`.category:nth-child(${
        Object.keys(packingListData).indexOf(category) + 1
    }) .items-container`);
    
    if (categoryDiv) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        itemDiv.innerHTML = `
            <input type="checkbox" id="${newItem.toLowerCase().replace(/\s+/g, '-')}">
            <label for="${newItem.toLowerCase().replace(/\s+/g, '-')}">${newItem}</label>
            <button class="remove-item" title="Remove item">×</button>
        `;
        
        // Find the correct position to insert the new item
        const items = Array.from(categoryDiv.children);
        const insertIndex = items.findIndex(item => 
            item.querySelector('label').textContent.localeCompare(newItem) > 0
        );
        
        if (insertIndex === -1) {
            categoryDiv.appendChild(itemDiv);
        } else {
            categoryDiv.insertBefore(itemDiv, items[insertIndex]);
        }

        // Add event listener to the new remove button
        const removeButton = itemDiv.querySelector('.remove-item');
        removeButton.addEventListener('click', (e) => {
            const itemDiv = e.target.closest('.item');
            const category = itemDiv.closest('.category').querySelector('h3').textContent;
            const itemName = itemDiv.querySelector('label').textContent;
            
            deletedItems.push({
                category: category,
                item: itemName
            });
            
            updateUndoButton();
            itemDiv.remove();
        });
    }

    newItemInput.value = '';
}

// Share the packing list
function shareList() {
    const items = [];
    document.querySelectorAll('.item').forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const label = item.querySelector('label').textContent;
        items.push(`${checkbox.checked ? '✓' : '□'} ${label}`);
    });

    const listText = items.join('\n');
    
    if (navigator.share) {
        navigator.share({
            title: 'My Camping Packing List',
            text: listText
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support the Web Share API
        const textArea = document.createElement('textarea');
        textArea.value = listText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Packing list copied to clipboard!');
    }
} 
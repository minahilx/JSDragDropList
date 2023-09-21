let listContainer; // Reference to the list container element
let draggableItem; // Reference to the currently dragged item
let pointerStartX; // Initial X coordinate of the pointer
let pointerStartY; // Initial Y coordinate of the pointer
let itemsGap = 0; // Gap between items
let items = []; // Array to store all items

// Function to get all items in the list
function getAllItems() {
    if (!items?.length) {
        items = Array.from(listContainer.querySelectorAll('.js-item'));
    }
    return items;
}

// Function to get all idle items (items not being dragged)
function getIdleItems() {
    return getAllItems().filter(item => item.classList.contains('is-idle'));
}

// Function to check if an item is above another item
function isItemAbove(item) {
    return item.hasAttribute('data-is-above');
}

// Function to check if an item is toggled (being moved)
function isItemToggled(item) {
    return item.hasAttribute('data-is-toggled');
}

// Initialize the drag and drop functionality
function setup() {
    listContainer = document.querySelector('.js-list');

    if (!listContainer) return;

    // Event listeners for mouse and touch events
    listContainer.addEventListener('mousedown', dragStart);
    listContainer.addEventListener('touchstart', dragStart);

    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
}

// Handle the start of the drag operation
function dragStart(e) {
    if (e.target.classList.contains('js-item')) {
        draggableItem = e.target;
    }

    if (!draggableItem) return;

    // Record initial pointer coordinates
    pointerStartX = e.clientX || e.touches[0].clientX;
    pointerStartY = e.clientY || e.touches[0].clientY;

    setItemsGap();
    disablePageScroll();
    initDraggableItem();
    initItemsState();

    // Event listeners for mouse and touch move events
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
}

// Calculate the gap between items
function setItemsGap() {
    if (getIdleItems().length <= 1) {
        itemsGap = 0;
        return;
    }

    const item1 = getIdleItems()[0];
    const item2 = getIdleItems()[1];

    const item1Rect = item1.getBoundingClientRect();
    const item2Rect = item2.getBoundingClientRect();

    itemsGap = Math.abs(item1Rect.bottom - item2Rect.top);
}

// Disable page scrolling while dragging
function disablePageScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.userSelect = 'none';
}

// Initialize the state of idle items
function initItemsState() {
    getIdleItems().forEach((item, i) => {
        if (getAllItems().indexOf(draggableItem) > i) {
            item.dataset.isAbove = '';
        }
    });
}

// Add necessary classes to the draggable item
function initDraggableItem() {
    draggableItem.classList.remove('is-idle');
    draggableItem.classList.add('is-draggable');
}

// Handle the drag operation
function drag(e) {
    if (!draggableItem) return;

    e.preventDefault();

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    const pointerOffsetX = clientX - pointerStartX;
    const pointerOffsetY = clientY - pointerStartY;

    draggableItem.style.transform = `translate(${pointerOffsetX}px, ${pointerOffsetY}px)`;

    updateIdleItemsStateAndPosition();
}

// Update the state and position of idle items
function updateIdleItemsStateAndPosition() {
    const draggableItemRect = draggableItem.getBoundingClientRect();
    const draggableItemY = draggableItemRect.top + draggableItemRect.height / 2;

    // Update state
    getIdleItems().forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemY = itemRect.top + itemRect.height / 2;
        if (isItemAbove(item)) {
            if (draggableItemY <= itemY) {
                item.dataset.isToggled = '';
            } else {
                delete item.dataset.isToggled;
            }
        } else {
            if (draggableItemY >= itemY) {
                item.dataset.isToggled = '';
            } else {
                delete item.dataset.isToggled;
            }
        }
    });

    // Update position
    getIdleItems().forEach((item) => {
        if (isItemToggled(item)) {
            const direction = isItemAbove(item) ? 1 : -1;
            item.style.transform = `translateY(${
                direction * (draggableItemRect.height + itemsGap)
            }px)`;
        } else {
            item.style.transform = '';
        }
    });
}

// Handle the end of the drag operation
function dragEnd() {
    if (!draggableItem) return;

    applyNewItemsOrder();
    cleanup();
}

// Apply the new order of items after dragging
function applyNewItemsOrder() {
    const reorderedItems = [];

    getAllItems().forEach((item, index) => {
        if (item === draggableItem) {
            return;
        }
        if (!isItemToggled(item)) {
            reorderedItems[index] = item;
            return;
        }
        const newIndex = isItemAbove(item) ? index + 1 : index - 1;
        reorderedItems[newIndex] = item;
    });

    for (let index = 0; index < getAllItems().length; index++) {
        const item = reorderedItems[index];
        if (typeof item === 'undefined') {
            reorderedItems[index] = draggableItem;
        }
    }

    reorderedItems.forEach((item) => {
        listContainer.appendChild(item);
    });
}

// Clean up after dragging is finished
function cleanup() {
    itemsGap = 0;
    items = [];
    unsetDraggableItem();
    unsetItemState();
    enablePageScroll();

    // Remove event listeners for move events
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
}

// Reset the draggable item to its initial state
function unsetDraggableItem() {
    draggableItem.style = null;
    draggableItem.classList.remove('is-draggable');
    draggableItem.classList.add('is-idle');
    draggableItem = null;
}

// Reset the state and position of idle items
function unsetItemState() {
    getIdleItems().forEach((item, i) => {
        delete item.dataset.isAbove;
        delete item.dataset.isToggled;
        item.style.transform = '';
    });
}

// Enable page scrolling after dragging
function enablePageScroll() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    document.body.style.userSelect = '';
}

// Initialize the drag and drop functionality
setup();

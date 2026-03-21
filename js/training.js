window.trainingSteps = [
  {
    title: "Welcome to the Warehouse Map",
    text: "This training will walk you through all major features of the system in a simple step-by-step way. You can use Previous and Next to move through the guide anytime.",
    tip: "Tip: This training button is for learning the system quickly without changing any warehouse data."
  },
  {
    title: "Understanding Locations",
    text: "Each pallet sits inside a warehouse location. The large grid uses row and column labels like A1, B4, X10, and so on. Read the row letter and the column number together to identify a location.",
    tip: "Example: U1 means row U and column 1."
  },
  {
    title: "Edit Mode: ON / OFF",
    text: "Edit mode controls whether the map can be changed. When Edit is ON, users can add products, drag pallets, split, and merge. When Edit is OFF, the system becomes safer for viewing only.",
    tip: "Use Edit OFF when you only want to check locations without moving anything."
  },
  {
    title: "Add Product",
    text: "Use the Add Product panel to create a new pallet. Enter the Product ID and the Quantity, then click Add New Product. New pallets are created in the New_# area first.",
    tip: "Quantities can be whole numbers or decimals, such as 5, 12.5, or 100.25."
  },
  {
    title: "Dragging a Pallet",
    text: "When Edit is ON, click and drag a pallet to move it. Drop it onto any valid location cell in the map.",
    tip: "Different products can still be stacked in the same location, but they remain separate pallets."
  },
  {
    title: "Stacking in One Location",
    text: "If more than one pallet is placed in the same location, they stack visually inside that cell. This helps the map show multiple pallets at one location without changing the pallet identities.",
    tip: "Same location does not mean same pallet. They are still stored separately."
  },
  {
    title: "Split Feature",
    text: "Each pallet has a split icon on the top-right corner. Splitting lets you take part of the quantity from one pallet and create another pallet with that amount in the same location.",
    tip: "The split quantity must be smaller than the pallet’s current quantity."
  },
  {
    title: "Merge / Add More to Same Product",
    text: "Each pallet also has a merge icon on the top-left corner. This feature lets you add more quantity to that pallet only when the Product ID matches the pallet’s Product ID.",
    tip: "If the Product ID does not match, the system shows an error and does not add the quantity."
  },
  {
    title: "Temporary and New Areas",
    text: "Areas such as New_# and Temporary locations are useful for organizing incoming, unsorted, or intermediate items before they are placed in final storage positions.",
    tip: "A good workflow is to add products into New_# first, then drag them to the correct final location."
  },
  {
    title: "Shipped Area",
    text: "If a pallet is dragged into the SHIPPED area, it is treated as shipped out. It is removed from the active warehouse inventory on the map.",
    tip: "Only drop pallets there when they are truly leaving inventory."
  },
  {
    title: "TO-8412-OFFICE Area",
    text: "If a pallet is dragged into the TO-8412-OFFICE area, it is treated as sent to that office destination and removed from active map inventory in the same way.",
    tip: "This works like a destination drop zone, similar to SHIPPED."
  },
  {
    title: "History",
    text: "The History button shows recorded product movement information such as who moved something, the product ID, initial location, final location, quantity, and time.",
    tip: "This helps track actions and understand what happened in the warehouse over time."
  },
  {
    title: "Inventory Summary",
    text: "Inventory Summary combines all active pallets and shows total quantity by Product ID. It does not need to show every location there; it is mainly for seeing total stock levels quickly.",
    tip: "Use this when you want a fast total by product without checking each pallet individually."
  },
  {
    title: "Download Excel",
    text: "The Download Excel button exports the inventory data so it can be opened in spreadsheet software. This is useful for reporting, reviewing, and sharing inventory information.",
    tip: "This gives you a simple external record of product IDs, quantities, and locations."
  },
  {
    title: "Undo Button",
    text: "The UNDO button reverses the most recent move action. This is helpful if a pallet was accidentally dragged to the wrong location.",
    tip: "Undo is best used immediately after the mistaken move."
  },
  {
    title: "Account Sign Up",
    text: "New users can create an account from the sign-up page. During sign-up, the system asks for the company’s full name. Only approved company names are allowed to register.",
    tip: "If the entered company name is not approved, the system shows a message and blocks account creation."
  },
  {
    title: "Logging In",
    text: "After a valid account is created, the user can log in and access the warehouse map. This keeps the system restricted to authorized users only.",
    tip: "This protects the warehouse map from unapproved access."
  },
  {
    title: "Best Way to Use the System",
    text: "A common workflow is: sign in, turn Edit ON, add a product into New_#, move it to its correct location, split if needed, merge matching quantities if needed, review history, check summary, and export when needed.",
    tip: "That sequence helps users stay organized and accurate."
  },
  {
    title: "You’re Ready",
    text: "You now know the major features of the map: locations, edit mode, add, move, drag and drop, stack, split, merge, shipped, office drop zone, history, summary, export, undo, and account sign-up.",
    tip: "You can reopen Training anytime from the header."
  }
];

window.currentTrainingStep = 0;

window.renderTrainingStep = function renderTrainingStep() {
  const body = document.getElementById('training-body');
  const progress = document.getElementById('training-progress');
  const prevBtn = document.getElementById('training-prev-btn');
  const nextBtn = document.getElementById('training-next-btn');

  if (!body || !progress || !prevBtn || !nextBtn) return;

  const step = window.trainingSteps[window.currentTrainingStep];
  const stepNumber = window.currentTrainingStep + 1;
  const totalSteps = window.trainingSteps.length;

  body.innerHTML = `
    <div class="training-step-badge">Step ${stepNumber}</div>
    <div class="training-step-title">${step.title}</div>
    <div class="training-step-text">${step.text}</div>
    <div class="training-step-tip"><strong>Helpful note:</strong> ${step.tip}</div>
  `;

  progress.textContent = `${stepNumber} / ${totalSteps}`;

  prevBtn.disabled = window.currentTrainingStep === 0;

  if (window.currentTrainingStep === totalSteps - 1) {
    nextBtn.textContent = 'Finish';
  } else {
    nextBtn.textContent = 'Next ➡';
  }
};

window.openTrainingModal = function openTrainingModal() {
  window.currentTrainingStep = 0;
  window.renderTrainingStep();
  document.getElementById('training-modal').style.display = 'block';
};

window.closeTrainingModal = function closeTrainingModal() {
  document.getElementById('training-modal').style.display = 'none';
};

window.nextTrainingStep = function nextTrainingStep() {
  if (window.currentTrainingStep < window.trainingSteps.length - 1) {
    window.currentTrainingStep++;
    window.renderTrainingStep();
  } else {
    window.closeTrainingModal();
  }
};

window.prevTrainingStep = function prevTrainingStep() {
  if (window.currentTrainingStep > 0) {
    window.currentTrainingStep--;
    window.renderTrainingStep();
  }
};

window.initTrainingEvents = function initTrainingEvents() {
  const trainingBtn = document.getElementById('training-btn');
  const trainingCloseBtn = document.getElementById('training-close-btn');
  const prevBtn = document.getElementById('training-prev-btn');
  const nextBtn = document.getElementById('training-next-btn');
  const modal = document.getElementById('training-modal');

  if (trainingBtn) {
    trainingBtn.addEventListener('click', window.openTrainingModal);
  }

  if (trainingCloseBtn) {
    trainingCloseBtn.addEventListener('click', window.closeTrainingModal);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', window.prevTrainingStep);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', window.nextTrainingStep);
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      window.closeTrainingModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    const isOpen = modal && modal.style.display === 'block';
    if (!isOpen) return;

    if (e.key === 'Escape') {
      window.closeTrainingModal();
    } else if (e.key === 'ArrowRight') {
      window.nextTrainingStep();
    } else if (e.key === 'ArrowLeft') {
      window.prevTrainingStep();
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  window.initTrainingEvents();
});

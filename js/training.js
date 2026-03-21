// --- 1. CONFIGURATION: Updated with targets for ALL features ---
window.trainingSteps = [
  {
    title: "Welcome to the Warehouse Map",
    text: "This training will walk you through all major features. Watch the screen for highlights!",
    tip: "Tip: The guide will stay in the corner so you can see the map.",
    target: null 
  },
  {
    title: "Understanding Locations",
    text: "The grid uses labels like A1, B4. Read the row letter and column number together.",
    tip: "The map grid is highlighted now.",
    target: "A1" // Targets the first cell to show where the grid is
  },
  {
    title: "Edit Mode: ON / OFF",
    text: "Edit mode controls whether the map can be changed. Turn this ON to move pallets.",
    tip: "Safety first: Keep it OFF when just viewing.",
    target: "Edit" 
  },
  {
    title: "Add Product",
    text: "Enter Product ID and Quantity, then click Add New Product. Pallets appear in New_# first.",
    tip: "You can use decimals like 10.5 for quantities.",
    target: "Add New Product" 
  },
  {
    title: "Dragging and Stacking",
    text: "When Edit is ON, drag a pallet to a location. Multiple pallets can stack in one cell.",
    tip: "Stacking keeps pallets separate but in the same physical spot.",
    target: "New_" // Highlights the incoming area
  },
  {
    title: "Split Feature",
    text: "Use the split icon on a pallet to divide it into two. Useful for partial moves.",
    tip: "The split amount must be less than the total.",
    target: "Split" 
  },
  {
    title: "Merge / Add More",
    text: "The merge icon lets you combine quantities if the Product IDs match.",
    tip: "The system will block merges if IDs don't match.",
    target: "Merge"
  },
  {
    title: "Shipped Area",
    text: "Drag pallets here to remove them from active inventory. This marks them as sent out.",
    tip: "Once dropped here, the pallet is considered gone.",
    target: "SHIPPED"
  },
  {
    title: "Office Drop Zone",
    text: "Sending items to the office? Drop them in the TO-8412-OFFICE area.",
    tip: "This works just like the Shipped zone.",
    target: "OFFICE"
  },
  {
    title: "History",
    text: "Track every movement. See who moved what, where, and when.",
    tip: "Check this if a pallet 'disappears' to see who moved it.",
    target: "History"
  },
  {
    title: "Inventory Summary",
    text: "See your total stock levels by Product ID across the whole warehouse.",
    tip: "Perfect for a quick count without looking at the map.",
    target: "Inventory Summary"
  },
  {
    title: "Download Excel",
    text: "Export your current inventory to a spreadsheet for reporting or sharing.",
    tip: "Useful for weekly backups.",
    target: "Download Excel"
  },
  {
    title: "Undo Button",
    text: "Accidentally moved a pallet? Click Undo to put it back instantly.",
    tip: "Try to use this immediately after the mistake.",
    target: "Undo"
  },
  {
    title: "Account & Security",
    text: "Only approved companies can sign up. This keeps your data restricted to your team.",
    tip: "Your company name must be on the approved list.",
    target: "Log Out" // Highlights the auth area/button
  },
  {
    title: "You’re Ready!",
    text: "You've seen the whole workflow: Add, Move, Split, Merge, and Export.",
    tip: "You can restart this training anytime from the header.",
    target: null
  }
];

window.currentTrainingStep = 0;

// --- 2. SELF-CONTAINED STYLES ---
const style = document.createElement('style');
style.innerHTML = `
  /* 1. THE MAIN FIX: Remove the "long background" and set the theme */
  #training-modal {
    position: fixed !important;
    bottom: 25px !important;
    right: 25px !important;
    top: auto !important;
    left: auto !important;
    width: 380px !important; /* Slightly wider for better text flow */
    height: auto !important; /* THIS kills the extra white space at the bottom */
    background: #f0f7ff !important; /* The Light Blue background */
    padding: 0 !important; /* We let the inner content handle padding */
    z-index: 10002 !important;
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
    border: 1px solid #cce3ff;
    overflow: hidden;
  }

  /* 2. Adjusting your existing 'body' to match the theme */
  #training-body {
    background: transparent !important; /* Remove the old gray background */
    border: none !important; /* Remove the old border */
    min-height: auto !important; /* Let it shrink to the text size */
    padding: 24px !important;
  }

  /* 3. High Contrast Text for readability */
  .training-step-title {
    color: #003366 !important; /* Dark Navy */
    font-size: 22px !important;
  }

  .training-step-text {
    color: #1a4a75 !important; /* Deep Blue-Gray */
    font-size: 15px !important;
  }

  /* 4. The Tip Box - White card on Blue background looks great */
  .training-step-tip {
    background: #ffffff !important; 
    border-left: 5px solid #ffcc00 !important; /* Yellow for attention */
    color: #444 !important;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  /* 5. Highlight effect for the actual warehouse elements */
  .training-target-highlight {
    outline: 5px solid #ffcc00 !important;
    box-shadow: 0 0 20px rgba(255, 204, 0, 0.6) !important;
    z-index: 10001 !important;
  }

  /* 6. Button Colors */
  #training-next-btn {
    background-color: #007bff !important;
  }
  
  #training-prev-btn {
    background: white !important;
    color: #007bff !important;
    border: 1px solid #007bff !important;
  }
`;
document.head.appendChild(style);

// --- 3. HELPER: Find elements by their text content ---
window.findTargetElement = function(text) {
  if (!text) return null;
  const selectors = ['button', 'div', 'span', 'th', 'td', 'label', 'h3'];
  for (let selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (let el of elements) {
      if (el.textContent.trim().includes(text) && el.offsetParent !== null) {
        return el;
      }
    }
  }
  return null;
};

// --- 4. RENDER LOGIC ---
window.renderTrainingStep = function renderTrainingStep() {
  const body = document.getElementById('training-body');
  const progress = document.getElementById('training-progress');
  const prevBtn = document.getElementById('training-prev-btn');
  const nextBtn = document.getElementById('training-next-btn');

  if (!body || !progress || !prevBtn || !nextBtn) return;

  document.querySelectorAll('.training-target-highlight').forEach(el => {
    el.classList.remove('training-target-highlight');
  });

  const step = window.trainingSteps[window.currentTrainingStep];
  const stepNumber = window.currentTrainingStep + 1;
  const totalSteps = window.trainingSteps.length;

  const targetEl = window.findTargetElement(step.target);
  if (targetEl) {
    targetEl.classList.add('training-target-highlight');
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  body.innerHTML = `
    <div class="training-step-badge">Step ${stepNumber} of ${totalSteps}</div>
    <div style="font-weight:bold; font-size: 1.25em; margin-bottom:8px; color:#333;">${step.title}</div>
    <div style="margin-bottom:15px; color:#555; line-height:1.4;">${step.text}</div>
    <div style="background:#fff9e6; padding:12px; border-radius:8px; border-left:4px solid #ffcc00; font-size:0.9em; color:#664d00;">
      ${step.tip}
    </div>
  `;

  progress.textContent = `${stepNumber} / ${totalSteps}`;
  prevBtn.disabled = window.currentTrainingStep === 0;
  nextBtn.textContent = window.currentTrainingStep === totalSteps - 1 ? 'Finish' : 'Next ➡';
};

// --- 5. EVENT HANDLERS (Keep your standard ones) ---
window.openTrainingModal = function() {
  window.currentTrainingStep = 0;
  window.renderTrainingStep();
  const modal = document.getElementById('training-modal');
  if (modal) modal.style.display = 'block';
};

window.closeTrainingModal = function() {
  document.querySelectorAll('.training-target-highlight').forEach(el => el.classList.remove('training-target-highlight'));
  const modal = document.getElementById('training-modal');
  if (modal) modal.style.display = 'none';
};

window.nextTrainingStep = function() {
  if (window.currentTrainingStep < window.trainingSteps.length - 1) {
    window.currentTrainingStep++;
    window.renderTrainingStep();
  } else {
    window.closeTrainingModal();
  }
};

window.prevTrainingStep = function() {
  if (window.currentTrainingStep > 0) {
    window.currentTrainingStep--;
    window.renderTrainingStep();
  }
};

window.initTrainingEvents = function() {
  const trainingBtn = document.getElementById('training-btn');
  const trainingCloseBtn = document.getElementById('training-close-btn');
  const prevBtn = document.getElementById('training-prev-btn');
  const nextBtn = document.getElementById('training-next-btn');
  const modal = document.getElementById('training-modal');

  if (trainingBtn) trainingBtn.addEventListener('click', window.openTrainingModal);
  if (trainingCloseBtn) trainingCloseBtn.addEventListener('click', window.closeTrainingModal);
  if (prevBtn) prevBtn.addEventListener('click', window.prevTrainingStep);
  if (nextBtn) nextBtn.addEventListener('click', window.nextTrainingStep);

  window.addEventListener('click', (e) => { if (e.target === modal) window.closeTrainingModal(); });
  window.addEventListener('keydown', (e) => {
    if (modal && modal.style.display === 'block') {
      if (e.key === 'Escape') window.closeTrainingModal();
      else if (e.key === 'ArrowRight') window.nextTrainingStep();
      else if (e.key === 'ArrowLeft') window.prevTrainingStep();
    }
  });
};

document.addEventListener('DOMContentLoaded', window.initTrainingEvents);

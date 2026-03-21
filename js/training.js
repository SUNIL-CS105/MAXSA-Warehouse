// --- 1. CONFIGURATION: Add "target" labels to your steps ---
window.trainingSteps = [
  {
    title: "Welcome to the Warehouse Map",
    text: "This training will walk you through all major features. Watch the screen for highlights!",
    tip: "Tip: The guide will stay in the corner so you can see the map.",
    target: null 
  },
  {
    title: "Edit Mode: ON / OFF",
    text: "Edit mode controls whether the map can be changed. When ON, you can move pallets.",
    tip: "Look at the highlighted button to toggle mode.",
    target: "Edit" // The script will look for a button that says "Edit"
  },
  {
    title: "Add Product",
    text: "Enter Product ID and Quantity here. New pallets appear in the New_# area.",
    tip: "Quantities can include decimals like 10.5.",
    target: "Add New Product" 
  },
  {
    title: "Inventory Summary",
    text: "This shows total quantity by Product ID across the whole warehouse.",
    tip: "Great for a quick stock check.",
    target: "Inventory Summary"
  },
  {
    title: "History",
    text: "The History button shows a log of every move made in the system.",
    tip: "Use this to see who moved what and when.",
    target: "History"
  }
  // ... You can add "target" labels to your other existing steps here
];

window.currentTrainingStep = 0;

// --- 2. SELF-CONTAINED STYLES ---
// This injects the CSS directly so you don't have to touch your .css file
const style = document.createElement('style');
style.innerHTML = `
  /* Highlighting the active element */
  .training-target-highlight {
    outline: 4px solid #ffcc00 !important;
    box-shadow: 0 0 20px #ffcc00 !important;
    position: relative !important;
    z-index: 10001 !important;
    transition: all 0.4s ease;
  }

  /* Moving the modal to the side so it's interactive */
  #training-modal {
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    top: auto !important;
    left: auto !important;
    width: 350px !important;
    height: auto !important;
    transform: none !important;
    z-index: 10002 !important;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }

  /* Adding a nice animation for the badge */
  .training-step-badge {
    background: #007bff;
    color: white;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    margin-bottom: 10px;
    display: inline-block;
  }
`;
document.head.appendChild(style);

// --- 3. HELPER: Find elements by their text content ---
window.findTargetElement = function(text) {
  if (!text) return null;
  const selectors = ['button', 'div', 'span', 'a', 'label'];
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

// --- 4. UPDATED RENDER LOGIC ---
window.renderTrainingStep = function renderTrainingStep() {
  const body = document.getElementById('training-body');
  const progress = document.getElementById('training-progress');
  const prevBtn = document.getElementById('training-prev-btn');
  const nextBtn = document.getElementById('training-next-btn');

  if (!body || !progress || !prevBtn || !nextBtn) return;

  // Clear previous highlights
  document.querySelectorAll('.training-target-highlight').forEach(el => {
    el.classList.remove('training-target-highlight');
  });

  const step = window.trainingSteps[window.currentTrainingStep];
  const stepNumber = window.currentTrainingStep + 1;
  const totalSteps = window.trainingSteps.length;

  // Apply new highlight
  const targetEl = window.findTargetElement(step.target);
  if (targetEl) {
    targetEl.classList.add('training-target-highlight');
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  body.innerHTML = `
    <div class="training-step-badge">Step ${stepNumber} of ${totalSteps}</div>
    <div class="training-step-title" style="font-weight:bold; font-size: 1.2em; margin-bottom:10px;">${step.title}</div>
    <div class="training-step-text" style="margin-bottom:15px;">${step.text}</div>
    <div class="training-step-tip" style="background:#f0f7ff; padding:10px; border-left:4px solid #007bff; font-size:0.9em;">
      <strong>Guide:</strong> ${step.tip}
    </div>
  `;

  progress.textContent = `${stepNumber} / ${totalSteps}`;
  prevBtn.disabled = window.currentTrainingStep === 0;
  nextBtn.textContent = window.currentTrainingStep === totalSteps - 1 ? 'Finish' : 'Next ➡';
};

// --- (Keep your existing event listeners below) ---

window.openTrainingModal = function openTrainingModal() {
  window.currentTrainingStep = 0;
  window.renderTrainingStep();
  const modal = document.getElementById('training-modal');
  if (modal) modal.style.display = 'block';
};

window.closeTrainingModal = function closeTrainingModal() {
  document.querySelectorAll('.training-target-highlight').forEach(el => {
    el.classList.remove('training-target-highlight');
  });
  const modal = document.getElementById('training-modal');
  if (modal) modal.style.display = 'none';
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

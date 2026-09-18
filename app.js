// --- State Management ---
let state = {
  startingBudget: 0,
  totalExpenses: 0,
  totalRevenue: 0,
  transactions: []
};

// --- Initialization ---
// Create the Chart immediately (with zero data)
const ctx = document.getElementById('budgetChart').getContext('2d');
let budgetChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Remaining Balance', 'Total Expenses'],
    datasets: [{
      data: [0, 0], // Initial values
      backgroundColor: ['#800020', '#FFC72C'], // Maroon and Gold
      borderColor: '#ffffff',
      borderWidth: 2
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { font: { weight: 'bold' } } }
    }
  }
});

// Run this once when the page loads to set the initial view
updateInterface();


// --- Step 1: Set New Budget Logic ---
function setNewBudget() {
  const input = document.getElementById('newBudgetInput');
  const amount = parseFloat(input.value);

  // Validate Input
  if (isNaN(amount) || amount < 0) {
    alert("Please enter a valid, positive number for the starting budget.");
    return;
  }

  // Update State (We are starting fresh with a new budget number)
  state.startingBudget = amount;
  state.totalExpenses = 0; // Reset transactions when resetting the budget
  state.totalRevenue = 0; 

  // UI Cleanup and Refresh
  input.value = '';
  updateInterface();
}


// --- Step 2: Add Entry Logic ---
function addEntry() {
  const name = document.getElementById('entryName').value;
  const amountInput = document.getElementById('entryAmount');
  const amount = parseFloat(amountInput.value);
  const type = document.getElementById('entryType').value;

  // Validate Input
  if (!name || isNaN(amount) || amount <= 0) {
    alert("Please provide an item name and a positive amount.");
    return;
  }

  // Update State based on Entry Type
  if (type === 'expense') {
    state.totalExpenses += amount;
  } else if (type === 'revenue') {
    state.totalRevenue += amount;
  }

  // Clear Form Fields
  document.getElementById('entryName').value = '';
  amountInput.value = '';

  // UI Refresh
  updateInterface();
}


// --- Step 3: Global UI Refresh Logic ---
// This central function forces the entire page to update whenever data changes.
function updateInterface() {
  // 1. Calculate final values
  const totalChange = state.totalRevenue - state.totalExpenses;
  const currentAvailable = state.startingBudget + totalChange;

  // 2. Format as Currency ($X.XX)
  const currency = (val) => `$${val.toFixed(2)}`;

  // 3. Update the Left Column (Sketch Rows) and Header
  document.getElementById('displayBudgetLabel').innerText = currency(state.startingBudget);
  document.getElementById('totalRevenue').innerText = currency(state.totalRevenue);
  document.getElementById('totalExpenses').innerText = currency(state.totalExpenses);
  
  const totalChangeEl = document.getElementById('totalChange');
  totalChangeEl.innerText = currency(totalChange);
  // Color code Total Change (Green if up, red if down)
  totalChangeEl.classList.remove('text-green-600', 'text-red-600', 'text-maroon');
  if (totalChange > 0) totalChangeEl.classList.add('text-green-600');
  else if (totalChange < 0) totalChangeEl.classList.add('text-red-600');
  else totalChangeEl.classList.add('text-maroon');

  document.getElementById('currentBalance').innerText = currency(currentAvailable);

  // 4. Update Doughnut Chart (Revenue vs Expenses)
  // The first slice is what remains of the starting funds (Available + Expenses), minus the actual expenses.
  // The second slice is the total expenses.
  budgetChart.data.datasets[0].data = [
    (currentAvailable > 0 ? currentAvailable : 0), 
    state.totalExpenses
  ];
  budgetChart.update();
}

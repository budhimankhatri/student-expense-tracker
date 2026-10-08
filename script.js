let expenses = [];
let editingIndex = -1;

const button = document.querySelector("#addExpenseBtn");
const resetFormButton =
    document.querySelector("#resetFormBtn");
const expenseList = document.querySelector("#expenseList");
const clearAllButton = document.querySelector("#clearAllBtn");
const exportCsvButton =
    document.querySelector("#exportCsvBtn");
const categoryFilter = document.querySelector("#categoryFilter");
const saveBudgetButton = document.querySelector("#saveBudgetBtn");
const searchInput = document.querySelector("#searchInput");
const clearSearchButton =
    document.querySelector("#clearSearchBtn");

let totalAmount = 0;
let budget = 0;
function formatAmount(amount) {

    return Number(amount).toLocaleString("en-IN");

}


// Chart variable
let spendingChart;


// Load saved budget
const savedBudget = localStorage.getItem("budget");

if (savedBudget) {
    budget = Number(savedBudget);
}

document.querySelector("#budget").value = budget;


// Load saved expenses
const savedExpenses = localStorage.getItem("expenses");

if (savedExpenses) {
    expenses = JSON.parse(savedExpenses);
}


// Update dashboard
function updateDashboard() {

    totalAmount = 0;
    let monthlyAmount = 0;

    const today = new Date();

    expenses.forEach(function(item) {

        totalAmount =
            totalAmount + Number(item.amount);

        const expenseDate =
            new Date(item.date);

        if (
            expenseDate.getMonth() === today.getMonth() &&
            expenseDate.getFullYear() === today.getFullYear()
        ) {
            monthlyAmount =
                monthlyAmount + Number(item.amount);
        const budgetWarning =
    document.querySelector("#budgetWarning");

if (budget > 0 && totalAmount >= budget) {

    budgetWarning.textContent =
        "⚠️ You have exceeded your budget!";

}
else if (budget > 0 && totalAmount >= budget * 0.8) {

    budgetWarning.textContent =
        "⚠️ You have used 80% or more of your budget.";

}
else {

    budgetWarning.textContent = "";

}
            }

    });

    document.querySelector("#dashboardTotal").textContent =
    formatAmount(totalAmount);

document.querySelector("#monthlyTotal").textContent =
    formatAmount(monthlyAmount);

const remaining = budget - totalAmount;

if (remaining < 0) {

    document.querySelector("#remainingBalance").textContent =
        "-₹" + formatAmount(Math.abs(remaining));

}
else {

    document.querySelector("#remainingBalance").textContent =
        "₹" + formatAmount(remaining);

}
}


// Display expenses
function displayExpenses() {

    expenseList.innerHTML = "";

    const selectedCategory = categoryFilter.value;
    const searchText = searchInput.value.toLowerCase().trim();

    // Filter expenses
    const filteredExpenses = expenses.filter(function(item) {

        const matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        const matchesSearch =
    item.name.toLowerCase().includes(searchText) ||
    item.category.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;

    });


    // Sort newest date first
    filteredExpenses.sort(function(a, b) {

        return new Date(b.date) - new Date(a.date);

    });


    // Update expense count
    document.querySelector("#expenseCount").textContent =
        filteredExpenses.length;
        let filteredAmount = 0;

filteredExpenses.forEach(function(item) {

    filteredAmount =
        filteredAmount + Number(item.amount);

});

document.querySelector("#filteredTotal").textContent =
    "Filtered Total: ₹" + formatAmount(filteredAmount);

        // Show message when no expenses are found
if (filteredExpenses.length === 0) {

    expenseList.innerHTML =
        "<p>No expenses found.</p>";

    return;
}


    // Display expenses
    filteredExpenses.forEach(function(item) {

        const originalIndex = expenses.indexOf(item);

        const expense = document.createElement("div");
        const today = new Date();
const expenseDate = new Date(item.date);

const isToday =
    expenseDate.getDate() === today.getDate() &&
    expenseDate.getMonth() === today.getMonth() &&
    expenseDate.getFullYear() === today.getFullYear();

        expense.innerHTML = `
            <div class="expense-card">

                <div>

                    <h3>${item.name}</h3>

                    <p>${item.category}</p>

                    <p>${item.date}</p>

${isToday ? '<p class="today-label">Today</p>' : ''}

                </div>

                <div>

                    <h3>₹${formatAmount(item.amount)}</h3>

                    <button class="edit-btn">
                        Edit
                    </button>

                    <button class="delete-btn">
                        Delete
                    </button>

                </div>

            </div>
        `;

        expenseList.appendChild(expense);


        // Delete button
        const deleteButton =
            expense.querySelector(".delete-btn");

        deleteButton.addEventListener("click", function() {

            expenses.splice(originalIndex, 1);

            localStorage.setItem(
                "expenses",
                JSON.stringify(expenses)
            );

            displayExpenses();
            displayCategorySummary();
            updateDashboard();
            displaySpendingChart();

        });


        // Edit button
        const editButton =
            expense.querySelector(".edit-btn");

        editButton.addEventListener("click", function() {

            document.querySelector("#expenseName").value =
                item.name;

            document.querySelector("#amount").value =
                item.amount;

            document.querySelector("#category").value =
                item.category;

            document.querySelector("#date").value =
                item.date;

            editingIndex = originalIndex;

            button.textContent =
                "Update Expense";

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    });

}


// Add / Update expense
button.addEventListener("click", function() {
   

    const expenseName =
        document.querySelector("#expenseName").value;

    const amount =
        document.querySelector("#amount").value;

    const category =
        document.querySelector("#category").value;

    const date =
        document.querySelector("#date").value;


    // Validation
    if (
        expenseName === "" ||
        amount === "" ||
        date === ""
    ) {
        alert("Please fill in all the fields.");
        return;
    }


    if (Number(amount) <= 0) {
        alert("Amount must be greater than 0.");
        return;
    }


    if (Number(amount) > 100000) {
        alert("Amount cannot be more than ₹1,00,000.");
        return;
    }


    const todayDate =
        new Date().toISOString().split("T")[0];

    if (date > todayDate) {
        alert("Expense date cannot be in the future.");
        return;
    }


    const expenseData = {
        name: expenseName,
        amount: Number(amount),
        category: category,
        date: date
    };


    // Check for duplicate expense
    const duplicateExpense =
        expenses.some(function(item) {

            return (
                item.name.toLowerCase() ===
                expenseData.name.toLowerCase() &&

                Number(item.amount) ===
                expenseData.amount &&

                item.category ===
                expenseData.category &&

                item.date ===
                expenseData.date
            );

        });


    if (duplicateExpense && editingIndex === -1) {
        alert("This expense already exists.");
        return;
    }


    // Remember whether we are editing
    const wasEditing =
        editingIndex !== -1;


    // Add or update
    if (editingIndex === -1) {

        expenses.push(expenseData);

    }
    else {

        expenses[editingIndex] =
            expenseData;

        editingIndex = -1;

        button.textContent =
            "Add Expense";
    }


    // Save expenses
    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );


    // Update page
    displayExpenses();
    displayCategorySummary();
    updateDashboard();
    displaySpendingChart();


    // Success message
    const successMessage =
        document.querySelector("#successMessage");

    if (wasEditing) {

        successMessage.textContent =
            "Expense updated successfully!";

    }
    else {

        successMessage.textContent =
            "Expense added successfully!";

    }
    setTimeout(function() {

    successMessage.textContent = "";

}, 3000);


    // Clear form
    document.querySelector("#expenseName").value = "";
    document.querySelector("#amount").value = "";
    document.querySelector("#date").value = "";

});
// Save budget
saveBudgetButton.addEventListener("click", function() {

    const budgetInput =
        document.querySelector("#budget").value;

    if (
        budgetInput === "" ||
        Number(budgetInput) <= 0
    ) {
        alert("Please enter a valid budget.");
        return;
    }

    budget = Number(budgetInput);

    localStorage.setItem(
        "budget",
        budget
    );

    updateDashboard();

    alert("Budget saved successfully!");

});


// Category Summary
function displayCategorySummary() {

    const categorySummary =
        document.querySelector("#categorySummary");

    categorySummary.innerHTML = "";

    if (expenses.length === 0) {

        categorySummary.innerHTML =
            "<p>No expenses added yet.</p>";

        return;
    }

    const categories = {};

    expenses.forEach(function(item) {

        if (categories[item.category]) {

            categories[item.category] =
                categories[item.category] +
                Number(item.amount);

        }
        else {

            categories[item.category] =
                Number(item.amount);

        }

    });

    for (const category in categories) {

        const categoryDiv =
            document.createElement("div");

        categoryDiv.className =
            "category-summary";

        categoryDiv.innerHTML = `
            <span class="category-name">
                ${category}
            </span>

            <span class="category-amount">
                ₹${formatAmount(categories[category])}
            </span>
        `;

        categorySummary.appendChild(categoryDiv);

    }

}


// Clear all expenses
clearAllButton.addEventListener("click", function() {

    if (expenses.length === 0) {

        alert("There are no expenses to clear.");

        return;
    }

    const confirmDelete =
        confirm(
            "Are you sure you want to delete all expenses?"
        );

    if (!confirmDelete) {
        return;
    }

    expenses = [];
    editingIndex = -1;

    localStorage.removeItem("expenses");

    button.textContent =
        "Add Expense";

    displayExpenses();
    displayCategorySummary();
    updateDashboard();
    displaySpendingChart();

});


// Category filter
categoryFilter.addEventListener("change", function() {

    displayExpenses();

});


// Search expenses
const searchCharCount =
    document.querySelector("#searchCharCount");

searchInput.addEventListener("input", function() {

    searchCharCount.textContent =
        searchInput.value.length +
        " / 50 characters";

    displayExpenses();

});


// Clear Search
clearSearchButton.addEventListener("click", function() {

    searchInput.value = "";

    searchCharCount.textContent =
        "0 / 50 characters";

    displayExpenses();

});


// Reset Form
resetFormButton.addEventListener("click", function() {

    document.querySelector("#expenseName").value = "";

    document.querySelector("#amount").value = "";

    document.querySelector("#category").value =
        "Food";

    document.querySelector("#date").value =
        new Date().toISOString().split("T")[0];

    editingIndex = -1;

    button.textContent =
        "Add Expense";

    document.querySelector("#successMessage").textContent =
        "";

    document.querySelector("#nameCharCount").textContent =
        "0 / 50 characters";

    document.querySelector("#expenseName").focus();

});


// Spending Chart
function displaySpendingChart() {

    const categories = {};

    expenses.forEach(function(item) {

        if (categories[item.category]) {

            categories[item.category] =
                categories[item.category] +
                Number(item.amount);

        }
        else {

            categories[item.category] =
                Number(item.amount);

        }

    });

    const labels =
        Object.keys(categories);

    const amounts =
        Object.values(categories);

    const ctx =
        document.querySelector("#spendingChart");

    if (!ctx) {
        return;
    }

    if (spendingChart) {
        spendingChart.destroy();
    }

    spendingChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: labels,

            datasets: [{

                label: "Amount Spent",

                data: amounts

            }]

        },

        options: {

            responsive: true,

            plugins: {

                tooltip: {

                    callbacks: {

                        label: function(context) {

                            return "₹" + context.raw;

                        }

                    }

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        callback: function(value) {

                            return "₹" + value;

                        }

                    }

                }

            }

        }

    });

}


// Export expenses as CSV
exportCsvButton.addEventListener("click", function() {

    if (expenses.length === 0) {

        alert("There are no expenses to export.");

        return;
    }

    let csvContent =
        "Name,Amount,Category,Date\n";

    expenses.forEach(function(item) {

        csvContent +=
            `"${item.name}",${item.amount},"${item.category}",${item.date}\n`;

    });

    const blob =
        new Blob([csvContent], {
            type: "text/csv"
        });

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "student-expenses.csv";

    link.click();

    URL.revokeObjectURL(url);

});


// Enter key shortcut
document.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        const activeElement =
            document.activeElement;

        if (
            activeElement.id === "expenseName" ||
            activeElement.id === "amount" ||
            activeElement.id === "category" ||
            activeElement.id === "date"
        ) {

            event.preventDefault();

            button.click();

        }

    }

});


// Run when page opens
displayExpenses();
displayCategorySummary();
updateDashboard();
displaySpendingChart();


// Set today's date
const dateInput =
    document.querySelector("#date");

if (!dateInput.value) {
    dateInput.value =
        new Date().toISOString().split("T")[0];
}

// Focus on Expense Name
document.querySelector("#expenseName").focus();
const expenseNameInput =
    document.querySelector("#expenseName");

const nameCharCount =
    document.querySelector("#nameCharCount");

    expenseNameInput.addEventListener("input", function() {
        


    nameCharCount.textContent =
        expenseNameInput.value.length +
        " / 50 characters";

});

    
    
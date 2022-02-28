// create variable to hold db connection
let db;

// establish a connection to IndexedDB database called 'budget_boss' and set it to version 1
const request = indexedDB.open('budget_boss', 1);

// this event will emit if the database version changes. None to 1, 1 to 2, etc.
request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store (table) called 'new_budget_item' with auto incrementing primary key of sorts
    db.createObjectStore('new_budget_item', { autoIncrement: true });
}

// upon successful request
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadBudgetItems();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode)
}

// This function will be executed if we attempt to submit a new transaction and there's no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_budget_item'], 'readwrite');
  
    // access the object store for `new_budget_item`
    const budgetItemObjectStore = transaction.objectStore('new_budget_item');
  
    // add record to your store with add method
    budgetItemObjectStore.add(record);
};

function uploadBudgetItems() {
    // open a transaction on your db
    const transaction = db.transaction(['new_budget_item'], 'readwrite');

    // access your object store
    const budgetItemObjectStore = transaction.objectStore('new_budget_item');

    // get all records from store and set to a variable
    const getAll = budgetItemObjectStore.getAll();

    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDB's store, let's send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_budget_item'], 'readwrite');
                    // access the new_budget_item object store
                    const budgetItemObjectStore = transaction.objectStore('new_budget_item');
                    // clear all items in your store
                    budgetItemObjectStore.clear();

                    console.log('All saved budget items while offline have now been submitted to the online database!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
};

// listen for app coming back online
window.addEventListener('online', uploadBudgetItems);
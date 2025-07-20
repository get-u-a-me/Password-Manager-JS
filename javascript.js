const add_dialog = document.querySelector(".add-dialog");
const edit_dialog = document.querySelector(".edit-dialog");
const add_btn = document.querySelector(".add-btn");
const add_dialog_close_btn = document.querySelector(".add-dialog-close-btn");
const edit_dialog_close_btn = document.querySelector(".edit-dialog-close-btn");
const dialog_add_btn = document.querySelector(".dialog-add-btn");
const dialog_edit_btn = document.querySelector(".dialog-edit-btn");
const cards_container = document.querySelector(".cards-container");

const savedAccounts = [];

let currentEditAccount = null;

window.onload = loadAccounts;

class Account {
    constructor(platform, username, password) {
        this.platform = platform;
        this.username = username;
        this.password = password;
        this.id = crypto.randomUUID();
    }
}

function addNewPassword(account) {
    savedAccounts.push(account);
    renderCard(account);
    saveAccounts();

}

function loadAccounts() {
    let accounts = [];
    try {
        accounts = JSON.parse(localStorage.getItem("accounts"));
    } catch (e) {
        console.log(e);
    }

    accounts = accounts.map(a => new Account(a.platform, a.username, a.password));

    accounts.forEach(item => {
        savedAccounts.push(item)
        renderCard(item);
    })
}

function saveAccounts() {
    try {
        localStorage.setItem("accounts", JSON.stringify(savedAccounts));
    } catch (e) {
        console.log(e);
    }
}

function openEditDialog(accountRef) {
    currentEditAccount = accountRef;

    document.getElementById("edit-platform").value = accountRef.platform;
    document.getElementById("edit-username").value = accountRef.username;
    document.getElementById("edit-password").value = accountRef.password;

    edit_dialog.showModal();
}

dialog_edit_btn.addEventListener("click", (e) => {
    const form = document.querySelector(".edit-dialog-main");
    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const platformInput = document.getElementById("edit-platform").value;
    const usernameInput = document.getElementById("edit-username").value;
    const passwordInput = document.getElementById("edit-password").value;

    if (currentEditAccount) {
        currentEditAccount.platform = platformInput || "None";
        currentEditAccount.username = usernameInput;
        currentEditAccount.password = passwordInput;

        saveAccounts();

        cards_container.innerHTML = "";
        savedAccounts.forEach(renderCard);

        form.reset();
        edit_dialog.close();
        currentEditAccount = null;
    }
});

dialog_add_btn.addEventListener("click", (e) => {
    const form = document.querySelector(".add-dialog-main")

    e.preventDefault();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    var platformInput = document.getElementById("add-platform").value;
    const usernameInput = document.getElementById("add-username").value;
    const passwordInput = document.getElementById("add-password").value;

    if (platformInput === "") {
        platformInput = "None";
    }

    const account = new Account(platformInput, usernameInput, passwordInput);
    addNewPassword(account);
    form.reset();
    add_dialog.close();
})

function renderCard(account) {
    //creating DOM 
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-id", account.id);

    const card_content = document.createElement("div")
    card_content.classList.add("card-content");

    const platform = document.createElement("div");
    platform.classList.add("platform");
    platform.textContent = account.platform;

    const username = document.createElement("div");
    username.classList.add("username");
    username.textContent = account.username;

    const password = document.createElement("div");
    password.classList.add("password");
    password.textContent = account.password;

    card_content.appendChild(platform);
    card_content.appendChild(username);
    card_content.appendChild(password);

    const edit_card_wrapper = document.createElement("div");
    edit_card_wrapper.classList.add("edit-card");

    const edit_card_btn = document.createElement("button");
    edit_card_btn.classList.add("edit-card-btn");
    edit_card_btn.textContent = "✏️";

    const delete_card_btn = document.createElement("button");
    delete_card_btn.classList.add("delete-card-btn");
    delete_card_btn.textContent = "🗑️";

    edit_card_wrapper.appendChild(edit_card_btn);
    edit_card_wrapper.appendChild(delete_card_btn);

    card.appendChild(edit_card_wrapper);
    card.appendChild(card_content);
    cards_container.appendChild(card);

    //add function to buttons
    delete_card_btn.addEventListener("click", (e) => {
        card.remove();
        const index = savedAccounts.findIndex(b => b.id === account.id);
        if (index !== -1) {
            savedAccounts.splice(index, 1);
            saveAccounts(account);
        }
    })

    edit_card_btn.addEventListener("click", (e) => {
        openEditDialog(account);
    })
}

add_btn.addEventListener("click", (e) => {
    add_dialog.showModal();
})

edit_dialog_close_btn.addEventListener("click", (e) => {
    const form = document.querySelector(".edit-dialog-main");
    form.reset();
    edit_dialog.close();
})

add_dialog_close_btn.addEventListener("click", (e) => {
    const form = document.querySelector(".add-dialog-main");
    form.reset();
    add_dialog.close();
})


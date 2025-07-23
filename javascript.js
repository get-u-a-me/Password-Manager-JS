const add_dialog = document.querySelector(".add-dialog");
const edit_dialog = document.querySelector(".edit-dialog");
const add_btn = document.querySelector(".add-btn");
const add_dialog_close_btn = document.querySelector(".add-dialog-close-btn");
const edit_dialog_close_btn = document.querySelector(".edit-dialog-close-btn");
const cards_container = document.querySelector(".cards-container");

const savedAccounts = new Map();

window.onload = loadAccounts;

// Datenstruktur für einen Account, erstellt automatisch eine eindeutige ID (UUID)
class Account {
    constructor(platform, username, password, id = crypto.randomUUID()) {
        this.platform = platform;
        this.username = username;
        this.password = password;
        this.id = id;
    }
}

//fügt ein neues Passwort hinzu, updated das UI, speichert die neue Account Liste im LocalStorage
function addNewPassword(account) {
    savedAccounts.set(account.id, account);
    updateOrRenderCard(account);
    saveAccounts();
}

// Lädt gespeicherte Accounts aus dem localStorage, wandelt sie zurück in Account-Objekte und rendert sie.
function loadAccounts() {
    try {
        const raw = JSON.parse(localStorage.getItem("accounts")) || [];
        raw.forEach(a => {
            const acc = new Account(a.platform, a.username, a.password, a.id);
            savedAccounts.set(acc.id, acc);
            updateOrRenderCard(acc);
        });
    } catch (e) {
        console.log(e);
    }
}

//Speichert die Account Liste im localStorage
function saveAccounts() {
    try {
        const all = Array.from(savedAccounts.values());
        localStorage.setItem("accounts", JSON.stringify(all));
    } catch (e) {
        console.log(e);
    }
}

// Allgemeine Hilfsfunktion zum Öffnen und Befüllen von Dialogen (Add / Edit)
function openDialog(dialog, data = {}, mapping = {}) {
    //stellt die Verbindung der Daten zum richtigen Feld her
    for (const [key, id] of Object.entries(mapping)) {
        const el = dialog.querySelector(`#${id}`);
        if (el) el.value = data[key] || "";
    }

    if (dialog === edit_dialog) {
        dialog.querySelector("form").dataset.accountId = data.id || "";
    }

    dialog.showModal();
}
//öffnet den Dialog und gibt an welche Daten welches Feld nutzen sollen.
function openEditDialog(account) {
    openDialog(edit_dialog, account, {
        platform: "edit-platform",
        username: "edit-username",
        password: "edit-password"
    });
}

//listener für den submit button des edit dialogs
document.querySelector(".edit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;

    //prüft ob das Feld richtig ausgefüllt ist.
    //gibt Vlidity fehler falls nicht
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    //Aktualisiert den Account mit den eingegebenen Daten
    const accountId = form.dataset.accountId;
    const account = savedAccounts.get(accountId);
    if (!account) return;

    account.platform = document.getElementById("edit-platform").value || "None";
    account.username = document.getElementById("edit-username").value;
    account.password = document.getElementById("edit-password").value;

    updateOrRenderCard(account);
    saveAccounts();

    form.reset();
    edit_dialog.close();
});

//listener für den add button im hinzufügen Dialog
document.querySelector(".add-dialog-main").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;

    //prüft ob das Feld richtig ausgefüllt ist.
    //gibt Vlidity fehler falls nicht
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    //speichert die Daten als neuen Account
    const platformInput = document.getElementById("add-platform").value || "None";
    const usernameInput = document.getElementById("add-username").value;
    const passwordInput = document.getElementById("add-password").value;
    //erstellt Acccount
    const account = new Account(platformInput, usernameInput, passwordInput);

    //fügt Account zur Liste hinzu
    addNewPassword(account);
    // Formular leeren, damit beim nächsten Öffnen keine alten Daten angezeigt werden
    form.reset();
    add_dialog.close();
});

//überprüft ob die Card schon existiert
//wenn nein Card wirt erstellt,
//wenn ja nur die Daten aktualisieren
function updateOrRenderCard(account) {
    let card = document.querySelector(`.card[data-id="${account.id}"]`);

    if (!card) {
        renderCard(account);
        return;
    }

    card.querySelector(".platform").textContent = account.platform;
    card.querySelector(".username").textContent = account.username;
    card.querySelector(".password").textContent = account.password;
}

//erstellt die Card aus einem Template
function renderCard(account) {
    const template = document.getElementById("card-template");
    const card = template.content.cloneNode(true).querySelector(".card");

    //verknüpft Felder mit Daten
    card.dataset.id = account.id;
    card.querySelector(".platform").textContent = account.platform;
    card.querySelector(".username").textContent = account.username;
    card.querySelector(".password").textContent = account.password;

    //fügt funktionen zu den buttons hinzu
    card.querySelector(".edit-card-btn").addEventListener("click", () => openEditDialog(account));
    card.querySelector(".delete-card-btn").addEventListener("click", () => {
        savedAccounts.delete(account.id);
        saveAccounts();
        card.remove();
    });

    cards_container.appendChild(card);
}

// Öffnet den Dialog zum Hinzufügen eines neuen Accounts
add_btn.addEventListener("click", () => add_dialog.showModal());

//schließt den Dialog zum Hinzufügen ordentlich
add_dialog_close_btn.addEventListener("click", () => {
    document.querySelector(".add-dialog-main").reset();
    add_dialog.close();
});

//schließt den Dialog zum Bearbeiten ordentlich
edit_dialog_close_btn.addEventListener("click", () => {
    document.querySelector(".edit-form").reset();
    edit_dialog.close();
});

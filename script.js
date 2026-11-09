
// ==================================================
// 1. SUPABASE DATABASE CONNECTION
// ==================================================

const SUPABASE_URL = "https://dfbjaydkihkglyroxkdm.supabase.co";
const SUPABASE_KEY = "sb_publishable_rewFlV76-iuzcpEw9m4drw_UkNVz-3q";

// Check whether Supabase library has loaded
if (!window.supabase) {
    console.error(
        "Supabase library is missing. Check your script loading order."
    );

    const list = document.getElementById("certificateList");

    if (list) {
        list.textContent = "Database connection could not be initialized.";
    }

    throw new Error("Supabase library not loaded.");
}

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==================================================
// 2. PAGE ELEMENTS
// ==================================================

const adminPanel = document.getElementById("adminPanel");
const loginArea = document.getElementById("loginArea");
const managementArea = document.getElementById("managementArea");

const certificateList = document.getElementById("certificateList");
const learningList = document.getElementById("learningList");

const loginMessage = document.getElementById("loginMessage");
const saveMessage = document.getElementById("saveMessage");

let currentUser = null;


// ==================================================
// 3. OPEN AND CLOSE ADMIN PANEL
// ==================================================

const adminToggle = document.getElementById("adminToggle");
const closeAdmin = document.getElementById("closeAdmin");

if (adminToggle && adminPanel) {
    adminToggle.addEventListener("click", () => {
        adminPanel.classList.toggle("active");
    });
}

if (closeAdmin && adminPanel) {
    closeAdmin.addEventListener("click", () => {
        adminPanel.classList.remove("active");
    });
}


// ==================================================
// 4. UPDATE ADMIN DASHBOARD
// ==================================================

function updateDashboard() {

    if (loginArea) {
        loginArea.hidden = Boolean(currentUser);
    }

    if (managementArea) {
        managementArea.hidden = !currentUser;
    }
}


// ==================================================
// 5. CHECK EXISTING LOGIN SESSION
// ==================================================

async function checkLogin() {

    const { data, error } = await db.auth.getSession();

    if (error) {
        console.error("Session error:", error);

        if (loginMessage) {
            loginMessage.textContent = error.message;
        }

        return;
    }

    currentUser = data.session?.user || null;

    updateDashboard();
}


// ==================================================
// 6. LOGIN
// ==================================================

const loginButton = document.getElementById("loginBtn");

if (loginButton) {

    loginButton.addEventListener("click", async () => {

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!emailInput || !passwordInput) {
            console.error("Login email or password field is missing.");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (loginMessage) {
            loginMessage.textContent = "";
        }

        loginButton.disabled = true;

        try {

            const { data, error } = await db.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
            }

            currentUser = data.user;

            updateDashboard();

        } catch (error) {

            console.error("Login error:", error);

            if (loginMessage) {
                loginMessage.textContent = error.message;
            }

        } finally {

            loginButton.disabled = false;

        }

    });
}


// ==================================================
// 7. LOGOUT
// ==================================================

const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {

    logoutButton.addEventListener("click", async () => {

        logoutButton.disabled = true;

        try {

            const { error } = await db.auth.signOut();

            if (error) {
                throw error;
            }

            currentUser = null;

            updateDashboard();

        } catch (error) {

            console.error("Logout error:", error);
            alert("Logout failed: " + error.message);

        } finally {

            logoutButton.disabled = false;

        }

    });
}


// ==================================================
// 8. AUTHENTICATION STATE LISTENER
// ==================================================

db.auth.onAuthStateChange((_event, session) => {

    currentUser = session?.user || null;

    updateDashboard();

});


// ==================================================
// 9. LOAD PORTFOLIO INFORMATION
// ==================================================

async function loadPortfolio() {

    // ----------------------------------------------
    // A. LOAD PUBLIC CERTIFICATIONS
    // Table: certification
    // ----------------------------------------------

    if (certificateList) {

        certificateList.textContent = "Loading certificates...";

        try {

            const { data: certificates, error } = await db
                .from("certification")
                .select("*")
                .eq("is_published", true)
                .order("created_at", { ascending: false });

            if (error) {
                throw error;
            }

            certificateList.replaceChildren();

            if (!certificates || certificates.length === 0) {

                certificateList.textContent =
                    "Certifications will appear here soon.";

            } else {

                certificates.forEach(item => {

                    const card = document.createElement("article");
                    card.className = "content-card";

                    const title = document.createElement("h3");
                    title.textContent =
                        item.title || "Certification";

                    const issuer = document.createElement("small");
                    issuer.textContent =
                        item.issuer || "";

                    const date = document.createElement("small");
                    date.textContent = item.issue_date
                        ? "Issued: " + item.issue_date
                        : "";

                    const description = document.createElement("p");
                    description.textContent =
                        item.description || "";

                    card.append(
                        title,
                        issuer,
                        date,
                        description
                    );

                    if (item.certificate_file_url) {

                        addSafeLink(
                            card,
                            "View Certificate",
                            item.certificate_file_url
                        );

                    }

                    if (item.credential_url) {

                        addSafeLink(
                            card,
                            "Verify Credential",
                            item.credential_url
                        );

                    }

                    certificateList.appendChild(card);

                });

            }

        } catch (error) {

            console.error("Certification loading error:", error);

            certificateList.textContent =
                "Unable to load certifications: " + error.message;

        }

    }


    // ----------------------------------------------
    // B. LOAD LEARNING RECORDS
    // Table: portfolio_items
    // ----------------------------------------------

    if (learningList) {

        learningList.textContent = "Loading learning records...";

        try {

            const { data: learningItems, error } = await db
                .from("portfolio_items")
                .select("*")
                .eq("item_type", "learning")
                .order("created_at", { ascending: false });

            if (error) {
                throw error;
            }

            learningList.replaceChildren();

            if (!learningItems || learningItems.length === 0) {

                learningList.textContent =
                    "Learning activities will appear here soon.";

            } else {

                learningItems.forEach(item => {

                    const card = document.createElement("article");
                    card.className = "content-card";

                    const title = document.createElement("h3");
                    title.textContent =
                        item.title || "Learning activity";

                    const issuer = document.createElement("small");
                    issuer.textContent =
                        item.issuer || "";

                    const date = document.createElement("small");
                    date.textContent =
                        item.item_date || "";

                    const description = document.createElement("p");
                    description.textContent =
                        item.description || "";

                    card.append(
                        issuer,
                        title,
                        date,
                        description
                    );

                    if (item.item_url) {

                        addSafeLink(
                            card,
                            "View Learning Resource",
                            item.item_url
                        );

                    }

                    learningList.appendChild(card);

                });

            }

        } catch (error) {

            console.error("Learning loading error:", error);

            learningList.textContent =
                "Unable to load learning records: " + error.message;

        }

    }

}


// ==================================================
// 10. CREATE SAFE LINKS
// ==================================================

function addSafeLink(container, label, value) {

    if (!value) return;

    try {

        const url = new URL(value);

        if (
            url.protocol !== "https:" &&
            url.protocol !== "http:"
        ) {
            return;
        }

        const link = document.createElement("a");

        link.href = url.href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;

        container.appendChild(link);

    } catch (error) {

        console.warn("Invalid link:", value);

    }

}


// ==================================================
// 11. ADD NEW LEARNING INFORMATION
// Table: portfolio_items
// ==================================================

const contentForm = document.getElementById("contentForm");

if (contentForm) {

    contentForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        if (!currentUser) {
            alert("Please log in first.");
            return;
        }

        const getValue = (id) => {
            const element = document.getElementById(id);
            return element ? element.value.trim() : "";
        };

        const newItem = {

            owner_id: currentUser.id,

            item_type: getValue("itemType"),

            title: getValue("itemTitle"),

            issuer: getValue("itemIssuer"),

            item_date: getValue("itemDate") || null,

            description: getValue("itemDescription"),

            item_url: getValue("itemUrl") || null

        };

        if (!newItem.title || !newItem.item_type) {

            if (saveMessage) {
                saveMessage.textContent =
                    "Please enter a title and select an item type.";
            }

            return;
        }

        const submitButton = contentForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {

            const { error } = await db
                .from("portfolio_items")
                .insert([newItem]);

            if (error) {
                throw error;
            }

            if (saveMessage) {
                saveMessage.textContent =
                    "Information added successfully!";
            }

            contentForm.reset();

            await loadPortfolio();

        } catch (error) {

            console.error("Save error:", error);

            if (saveMessage) {
                saveMessage.textContent =
                    "Error: " + error.message;
            }

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
            }

        }

    });

}


// ==================================================
// 12. INITIALIZE WEBSITE
// ==================================================

async function initializeWebsite() {

    // Load public information independently of login.
    await loadPortfolio();

    // Check whether an admin is already logged in.
    await checkLogin();

}

initializeWebsite();


import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

// ==========================================
// 1. SUPABASE CONNECTION
// ==========================================

const SUPABASE_URL = "https://dfbjaydkihkglyroxkdm.supabase.co";
const SUPABASE_KEY = "sb_publishable_rewFlV76-iuzcpEw9m4drw_UkNVz-3q";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Your exact Supabase table name
const TABLE_NAME = "certification";


// ==========================================
// 2. HTML ELEMENTS
// ==========================================

const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const loginButton = document.getElementById("loginButton");

const logoutButton = document.getElementById("logoutButton");
const welcomeMessage = document.getElementById("welcomeMessage");

const certificationForm = document.getElementById("certificationForm");
const certificationList = document.getElementById("certificationList");

const certMessage = document.getElementById("certMessage");
const saveCertButton = document.getElementById("saveCertButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const formHeading = document.getElementById("formHeading");


// ==========================================
// 3. EDITING STATE
// ==========================================

let editingId = null;


// ==========================================
// 4. SHOW LOGIN OR DASHBOARD
// ==========================================

function showDashboard(session) {

    if (session) {

        loginSection.hidden = true;
        dashboardSection.hidden = false;

        welcomeMessage.textContent =
            "Signed in as " + session.user.email;

        loadCertifications();

    } else {

        loginSection.hidden = false;
        dashboardSection.hidden = true;

        certificationList.replaceChildren();

        resetCertificationForm();
    }
}


// ==========================================
// 5. CHECK EXISTING LOGIN SESSION
// ==========================================

async function checkLogin() {

    const { data, error } = await supabase.auth.getSession();

    if (error) {

        loginMessage.textContent = error.message;
        console.error("Session error:", error);

        return;
    }

    showDashboard(data.session);
}

checkLogin();


// ==========================================
// 6. LOGIN
// ==========================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    loginButton.disabled = true;
    loginButton.textContent = "Signing in...";

    loginMessage.textContent = "";

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value;

    const { data, error } = await supabase.auth.signInWithPassword({

        email,
        password

    });

    if (error) {

        loginMessage.textContent =
            "Login failed: " + error.message;

        console.error("Login error:", error);

    } else {

        loginMessage.textContent = "";

        loginForm.reset();

        showDashboard(data.session);
    }

    loginButton.disabled = false;
    loginButton.textContent = "Sign In";

});


// ==========================================
// 7. LOGOUT
// ==========================================

logoutButton.addEventListener("click", async function() {

    const { error } = await supabase.auth.signOut();

    if (error) {

        alert("Logout error: " + error.message);

    } else {

        showDashboard(null);
    }

});


// ==========================================
// 8. AUTHENTICATION STATE CHANGES
// ==========================================

supabase.auth.onAuthStateChange((_event, session) => {

    showDashboard(session);

});


// ==========================================
// 9. RESET CERTIFICATION FORM
// ==========================================

function resetCertificationForm() {

    certificationForm.reset();

    editingId = null;

    formHeading.textContent = "Add New Certification";

    saveCertButton.textContent = "Save Certification";

    cancelEditButton.hidden = true;

}


// ==========================================
// 10. LOAD CERTIFICATIONS FROM SUPABASE
// ==========================================

async function loadCertifications() {

    certificationList.textContent = "Loading certifications...";

    const { data, error } = await supabase

        .from(TABLE_NAME)

        .select("*")

        .order("created_at", { ascending: false });


    if (error) {

        certificationList.textContent =
            "Could not load certifications: " + error.message;

        console.error("Loading error:", error);

        return;
    }

    displayCertifications(data);

}


// ==========================================
// 11. DISPLAY CERTIFICATIONS
// ==========================================

function displayCertifications(certifications) {

    certificationList.replaceChildren();

    if (!certifications || certifications.length === 0) {

        certificationList.textContent =
            "No certifications added yet. Use the form above to add your first one.";

        return;
    }


    certifications.forEach(cert => {

        // Main card
        const card = document.createElement("article");

        card.className = "cert-item";


        // Certification title
        const heading = document.createElement("h3");

        heading.textContent =
            cert.title || "Untitled certification";


        // Issuer
        const issuer = document.createElement("p");

        issuer.textContent =
            "Issued by: " + (cert.issuer || "Not specified");


        // Issue date
        const issueDate = document.createElement("p");

        issueDate.textContent =
            "Issue date: " + (cert.issue_date || "Not specified");


        // Expiry date
        const expiryDate = document.createElement("p");

        expiryDate.textContent =
            "Expiry date: " + (cert.expiry_date || "No expiry date");


        // Description
        const description = document.createElement("p");

        description.textContent =
            cert.description || "";


        // Publication status
        const status = document.createElement("span");

        status.className = "cert-status";

        status.textContent =
            cert.is_published ? "Published" : "Unpublished";


        // Add basic information
        card.append(
            heading,
            issuer,
            issueDate,
            expiryDate,
            description,
            status
        );


        // Credential ID
        if (cert.credential_id) {

            const credential = document.createElement("p");

            credential.textContent =
                "Credential ID: " + cert.credential_id;

            card.append(credential);
        }


        // Verification link
        addSafeLink(
            card,
            "Verify certificate",
            cert.credential_url
        );


        // Certificate file link
        addSafeLink(
            card,
            "View certificate file",
            cert.certificate_file_url
        );


        // Action buttons container
        const actions = document.createElement("div");

        actions.className = "manager-actions";


        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";

        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {

            editCertification(cert);

        });


        // Publish / Unpublish button
        const publishButton = document.createElement("button");

        publishButton.type = "button";

        publishButton.textContent =
            cert.is_published ? "Unpublish" : "Publish";

        publishButton.addEventListener("click", function() {

            togglePublication(cert);

        });


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {

            deleteCertification(cert.id);

        });


        // Add buttons
        actions.append(
            editButton,
            publishButton,
            deleteButton
        );

        card.append(actions);


        // Add card to dashboard
        certificationList.append(card);

    });

}


// ==========================================
// 12. SAFELY CREATE LINKS
// ==========================================

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

        link.textContent = label;

        link.target = "_blank";

        link.rel = "noopener noreferrer";

        container.append(link);

    } catch {

        console.warn("Invalid URL:", value);

    }

}


// ==========================================
// 13. ADD OR UPDATE CERTIFICATION
// ==========================================

certificationForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    saveCertButton.disabled = true;

    saveCertButton.textContent = "Saving...";

    certMessage.textContent = "";


    // Collect form information
    const certification = {

        title: document.getElementById("title").value.trim(),

        issuer: document.getElementById("issuer").value.trim(),

        issue_date:
            document.getElementById("issue_date").value || null,

        expiry_date:
            document.getElementById("expiry_date").value || null,

        credential_id:
            document.getElementById("credential_id").value.trim() || null,

        credential_url:
            document.getElementById("credential_url").value.trim() || null,

        certificate_file_url:
            document.getElementById("certificate_file_url").value.trim() || null,

        description:
            document.getElementById("description").value.trim() || null,

        is_published:
            document.getElementById("is_published").checked

    };


    let result;

    if (editingId === null) {

        // INSERT NEW RECORD
        result = await supabase

            .from(TABLE_NAME)

            .insert([certification]);

    } else {

        // UPDATE EXISTING RECORD
        result = await supabase

            .from(TABLE_NAME)

            .update(certification)

            .eq("id", editingId);

    }


    if (result.error) {

        certMessage.textContent =
            "Error: " + result.error.message;

        console.error("Save error:", result.error);

    } else {

        certMessage.textContent =
            editingId === null
                ? "Certification added successfully!"
                : "Certification updated successfully!";

        resetCertificationForm();

        await loadCertifications();

    }


    saveCertButton.disabled = false;

    saveCertButton.textContent =
        editingId === null
            ? "Save Certification"
            : "Update Certification";

});


// ==========================================
// 14. EDIT CERTIFICATION
// ==========================================

function editCertification(cert) {

    editingId = cert.id;

    document.getElementById("title").value =
        cert.title || "";

    document.getElementById("issuer").value =
        cert.issuer || "";

    document.getElementById("issue_date").value =
        cert.issue_date || "";

    document.getElementById("expiry_date").value =
        cert.expiry_date || "";

    document.getElementById("credential_id").value =
        cert.credential_id || "";

    document.getElementById("credential_url").value =
        cert.credential_url || "";

    document.getElementById("certificate_file_url").value =
        cert.certificate_file_url || "";

    document.getElementById("description").value =
        cert.description || "";

    document.getElementById("is_published").checked =
        cert.is_published;


    formHeading.textContent = "Edit Certification";

    saveCertButton.textContent = "Update Certification";

    cancelEditButton.hidden = false;

    certificationForm.scrollIntoView({
        behavior: "smooth"
    });

}


// ==========================================
// 15. CANCEL EDITING
// ==========================================

cancelEditButton.addEventListener("click", function() {

    resetCertificationForm();

    certMessage.textContent = "Editing cancelled.";

});


// ==========================================
// 16. PUBLISH OR UNPUBLISH
// ==========================================

async function togglePublication(cert) {

    const { error } = await supabase

        .from(TABLE_NAME)

        .update({

            is_published: !cert.is_published

        })

        .eq("id", cert.id);


    if (error) {

        certMessage.textContent =
            "Publication error: " + error.message;

        console.error("Publication error:", error);

        return;
    }


    certMessage.textContent =
        cert.is_published
            ? "Certification unpublished."
            : "Certification published.";

    await loadCertifications();

}


// ==========================================
// 17. DELETE CERTIFICATION
// ==========================================

async function deleteCertification(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this certification?"
    );

    if (!confirmed) return;


    const { error } = await supabase

        .from(TABLE_NAME)

        .delete()

        .eq("id", id);


    if (error) {

        certMessage.textContent =
            "Delete error: " + error.message;

        console.error("Delete error:", error);

        return;
    }


    certMessage.textContent =
        "Certification deleted successfully.";


    if (editingId === id) {

        resetCertificationForm();

    }

    await loadCertifications();

}

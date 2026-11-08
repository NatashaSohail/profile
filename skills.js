const skillsData = {

    technical: [
        {
            name: "HTML & CSS",
            level: "Foundational"
        },
        {
            name: "C programming",
            level: "Beginner"
        },
        {
            name: "Python",
            level: "Learning / developing"
        },
        {
            name: "Data analysis concepts",
            level: "Foundational"
        },
        {
            name: "Git & GitHub",
            level: "Developing"
        }
    ],

    creative: [
        {
            name: "Jewellery concept development",
            level: "Developing"
        },
        {
            name: "Beauty / beautician practice",
            level: "Practical interest"
        },
        {
            name: "Teaching & explaining",
            level: "Experience"
        },
        {
            name: "Visual creativity",
            level: "Developing"
        },
        {
            name: "Research & self-learning",
            level: "Ongoing"
        }
    ]

};


// Automatically display skills
function displaySkills(containerId, skills) {

    const container = document.getElementById(containerId);

    container.innerHTML = skills.map(skill => `
        <div class="skill-item">

            <span class="skill-name">
                ${escapeHTML(skill.name)}
            </span>

            <span class="skill-level">
                ${escapeHTML(skill.level)}
            </span>

        </div>
    `).join("");

}


// Protect displayed text against HTML injection
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// Render both categories
displaySkills("technical-skills", skillsData.technical);
displaySkills("creative-skills", skillsData.creative);
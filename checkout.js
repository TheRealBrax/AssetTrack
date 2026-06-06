const student =
    JSON.parse(
        localStorage.getItem("student")
    );

if (!student) {
    window.location.href = "/";
}

document.getElementById(
    "studentName"
).textContent = student.name;

const equipment = [];

function renderEquipment() {

    const list =
        document.getElementById(
            "equipmentList"
        );

    const count =
        document.getElementById(
            "itemCount"
        );

    list.innerHTML = "";

    equipment.forEach((item, index) => {

        const div =
            document.createElement("div");

        div.className =
            "equipment-card";

        div.innerHTML = `
            <div>
                <strong>${item.asset_tag}</strong>
                <p>${item.name}</p>
            </div>

            <button onclick="removeItem(${index})">
                Remove
            </button>
        `;

        list.appendChild(div);

    });

    count.textContent =
        `${equipment.length} Items`;
}

window.removeItem = (index) => {

    equipment.splice(index, 1);

    renderEquipment();
};

async function addEquipment(assetTag) {

    const response =
        await fetch(
            `/api/equipment/${assetTag}`
        );

    if (!response.ok) {
        alert("Equipment not found");
        return;
    }

    const item =
        await response.json();

    equipment.push(item);

    renderEquipment();
}

document
.getElementById("fakeScanBtn")
.addEventListener("click", () => {

    addEquipment("CAM-001");

});

document
.querySelector(".checkout-btn")
.addEventListener("click", async () => {

    const response =
        await fetch(
            "/api/checkout",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                    student_id:
                        student.student_id,

                    equipment:
                        equipment.map(
                            e => e.asset_tag
                        )
                })
            }
        );

    if (!response.ok) {
        alert("Checkout failed");
        return;
    }

    alert("Equipment checked out!");

    equipment.length = 0;

    renderEquipment();

});


const student =
    JSON.parse(
        localStorage.getItem("student")
    );

if (!student) {
    window.location.href = "/";
}

document.getElementById(
    "studentName"
).textContent = student.name || student.student_id;

const equipmentUrl = "Data/equipment.json";

let equipmentRecordsPromise;

const equipment = [];

function setStatus(message) {
    const status = document.getElementById("scanStatus");

    if (status) {
        status.textContent = message;
    }
}

async function loadEquipmentRecords() {
    if (!equipmentRecordsPromise) {
        equipmentRecordsPromise = fetch(equipmentUrl).then((response) => {
            if (!response.ok) {
                throw new Error("Unable to load equipment records");
            }

            return response.json();
        });
    }

    return equipmentRecordsPromise;
}

async function findEquipmentByNfcUid(nfcUid) {
    const records = await loadEquipmentRecords();

    return records.find((item) => item.nfc_uid === nfcUid) || null;
}

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
        `${equipment.length} Item${equipment.length === 1 ? "" : "s"}`;
}

window.removeItem = (index) => {

    equipment.splice(index, 1);

    renderEquipment();
};

function addEquipment(item) {
    if (equipment.some((existing) => existing.asset_tag === item.asset_tag)) {
        setStatus(`${item.asset_tag} is already in the list.`);
        return;
    }

    equipment.push(item);
    setStatus(`Added ${item.asset_tag}.`);
    renderEquipment();
}

document
    .getElementById("scanNfcBtn")
    .addEventListener("click", async () => {

        if (!("NDEFReader" in window)) {
            setStatus("NFC is not supported on this browser.");
            return;
        }

        const reader = new NDEFReader();

        try {
            setStatus("Ready to scan an asset tag.");

            reader.addEventListener("reading", async (event) => {
                try {
                    const item = await findEquipmentByNfcUid(event.serialNumber);

                    if (!item) {
                        setStatus("Asset tag not recognized.");
                        return;
                    }

                    addEquipment(item);
                } catch (error) {
                    console.error(error);
                    setStatus("Could not resolve that tag.");
                }
            });

            reader.addEventListener("readingerror", () => {
                setStatus("NFC scan failed. Try again.");
            });

            await reader.scan();
            setStatus("Scan the tag now.");
        } catch (error) {
            console.error(error);

            if (error.name === "NotAllowedError") {
                setStatus("NFC access was blocked by the browser.");
                return;
            }

            setStatus("Unable to start NFC scanning.");
        }
    });

document
.querySelector(".checkout-btn")
.addEventListener("click", async () => {

    if (!equipment.length) {
        alert("Scan at least one item first");
        return;
    }

    const transactions =
        JSON.parse(localStorage.getItem("transactions") || "[]");

    transactions.push({
        student_id: student.student_id,
        student_name: student.name,
        equipment: equipment.map((item) => item.asset_tag),
        checked_out_at: new Date().toISOString()
    });

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    alert("Equipment checked out!");

    equipment.length = 0;

    renderEquipment();

    setStatus("Scan another tag to add more equipment.");

});

if (!("NDEFReader" in window)) {
    setStatus("NFC scanning requires a supported mobile browser.");
}

renderEquipment();


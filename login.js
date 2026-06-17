const studentsUrl = "Data/students.json";

let studentsPromise;

function setStatus(message) {
    const status = document.getElementById("nfcStatus");

    if (status) {
        status.textContent = message;
    }
}

async function loadStudents() {
    if (!studentsPromise) {
        studentsPromise = fetch(studentsUrl).then((response) => {
            if (!response.ok) {
                throw new Error("Unable to load student records");
            }

            return response.json();
        });
    }

    return studentsPromise;
}

async function findStudentById(studentId) {
    const students = await loadStudents();

    return students.find((student) => student.student_id === studentId) || null;
}

async function findStudentByNfcUid(nfcUid) {
    const students = await loadStudents();

    return students.find((student) => student.nfc_uid === nfcUid) || null;
}

function saveStudent(student) {
    localStorage.setItem("student", JSON.stringify(student));
    localStorage.setItem("studentId", student.student_id);
}

function goToCheckout(student) {
    saveStudent(student);
    window.location.href = "checkout.html";
}

async function handleManualLogin(event) {
    event.preventDefault();

    const studentId = document.getElementById("studentId").value.trim();

    if (!studentId) {
        alert("Enter a Student ID");
        return;
    }

    try {
        const student = await findStudentById(studentId);

        if (!student) {
            alert("Student not found");
            return;
        }

        goToCheckout(student);
    } catch (error) {
        console.error(error);
        alert("Could not load student data");
    }
}

async function startNfcLogin() {
    if (!("NDEFReader" in window)) {
        setStatus("NFC is not supported on this browser.");
        return;
    }

    const reader = new NDEFReader();

    try {
        setStatus("Ready to scan a student badge.");

        reader.addEventListener("reading", async (event) => {
            try {
                const student = await findStudentByNfcUid(event.serialNumber);

                if (!student) {
                    setStatus("Badge not recognized.");
                    return;
                }

                setStatus(`Welcome, ${student.name}.`);
                goToCheckout(student);
            } catch (error) {
                console.error(error);
                setStatus("Could not resolve that badge.");
            }
        });

        reader.addEventListener("readingerror", () => {
            setStatus("NFC scan failed. Try again.");
        });

        await reader.scan();
        setStatus("Scan the badge now.");
    } catch (error) {
        console.error(error);

        if (error.name === "NotAllowedError") {
            setStatus("NFC access was blocked by the browser.");
            return;
        }

        setStatus("Unable to start NFC scanning.");
    }
}

document.getElementById("loginForm").addEventListener("submit", handleManualLogin);
document.getElementById("scanNfcBtn").addEventListener("click", startNfcLogin);

if (!("NDEFReader" in window)) {
    setStatus("NFC scanning requires a supported mobile browser.");
}


document
.getElementById("loginForm")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const studentId =
        document.getElementById("studentId")
        .value
        .trim();

    if (!studentId) {
        alert("Enter a Student ID");
        return;
    }

    try {

        const response = await fetch(
            `/api/students/${studentId}`
        );

        const student =
            await response.json();

        if (!response.ok) {
            alert("Student not found");
            return;
        }

        localStorage.setItem(
            "student",
            JSON.stringify(student)
        );

        window.location.href =
            "checkout.html";

    } catch (error) {

        console.error(error);

        alert("Server error");
    }

});


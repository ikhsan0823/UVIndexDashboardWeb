document.addEventListener("DOMContentLoaded", function () {
    var button = document.getElementById("forecast-button");
    var container = document.getElementById("forecast-container");

    button.addEventListener("click", function () {
        // Toggle the visibility of the forecast-container
        container.style.display = (container.style.display === "none" || container.style.display === "") ? "block" : "none";
    });
});

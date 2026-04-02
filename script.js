//theme
document.addEventListener("DOMContentLoaded", function () {

  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }

  window.toggleMode = function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };

});

function filterGallery() {
  const search = document.getElementById("gallery-search").value.toLowerCase();
  const items = document.querySelectorAll(".gallery-item");

  items.forEach(item => {
    const name = item.querySelector("img").alt.toLowerCase();
    if (name.includes(search)) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}
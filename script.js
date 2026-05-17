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

document.addEventListener("DOMContentLoaded", function () {

  function filterGallery() {
    const search = document.getElementById("gallery-search").value.toLowerCase();
    const items = document.querySelectorAll(".gallery-item");
    let visible = 0;

    items.forEach(item => {
      const name = item.querySelector("img").alt.toLowerCase();
      if (name.includes(search)) {
        item.style.display = "";
        visible++;
      } else {
        item.style.display = "none";
      }
    });

    document.getElementById("gallery-count").textContent = `Showing ${visible} of ${items.length} images`;
  }

  document.getElementById("gallery-search").addEventListener("keyup", filterGallery);

  filterGallery();

});
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

// const imageFolder = "images/gallery/";
// const imageCount = 13; // just change this number

// window.onload = () => {
//   const gallery = document.querySelector(".gallery");

//   for (let i = 1; i <= imageCount; i++) {
//     const img = document.createElement("img");
//     img.src = `${imageFolder}img${i}.jpg`;
//     img.classList.add("gallery-img");

//     gallery.appendChild(img);
//   }
// };
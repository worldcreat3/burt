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

const imageFolder = "images/gallery/";

// manually list files in the folder
const images = [
  "img1.jpg",
  "img2.png",
  "img3.jpeg"
];

window.onload = () => {
  const gallery = document.querySelector(".gallery");

  images.forEach(file => {
    const img = document.createElement("img");
    img.src = imageFolder + file;
    img.classList.add("gallery-img");

    gallery.appendChild(img);
  });
};
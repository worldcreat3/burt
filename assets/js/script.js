let lastScroll = 0;

const navbar = document.getElementById("navbar");

if (navbar) {

    window.addEventListener("scroll", () => {

        const current = window.pageYOffset;

        if (current > lastScroll) {
            navbar.classList.add("hide");
        } else {
            navbar.classList.remove("hide");
        }

        lastScroll = current;

    });

}

const panels = document.querySelectorAll(".panel");

if (panels.length) {

    const observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }

        });

    }, {
        threshold:0.5
    });

    panels.forEach(panel => observer.observe(panel));

}

window.addEventListener("load", () => {

    const co = document.getElementById("co");
    const za = document.getElementById("za");
    const sound = document.getElementById("introSound");

    if (co) {

        setTimeout(() => co.classList.add("show"),150);

    }

    if (za) {

        setTimeout(() => za.classList.add("show"),300);

    }

});

const logo = document.querySelector(".logo");
const sound = document.getElementById("introSound");

if (logo && sound) {

    logo.addEventListener("click", () => {

        sound.pause();
        sound.currentTime = 0;
        console.log("pressed")
        sound.play();

    });

}

const sidebarButtons = document.querySelectorAll(".sidebar-btn");
const formCards = document.querySelectorAll(".form-card");

sidebarButtons.forEach(button => {

    button.addEventListener("click", () => {

        sidebarButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const category = button.dataset.category;

        formCards.forEach(card => {

            if (category === "all" || card.dataset.category === category) {

                card.style.display = "flex";

            } else {

                card.style.display = "none";

            }

        });

    });

});


//footer
loadComponent("navbar", "/backdoor/navbar.html");
loadComponent("footer", "/backdoor/footer.html");

function loadComponent(id, file) {

    fetch(file)
        .then(r => r.text())
        .then(html => {

            document.getElementById(id).innerHTML = html;

        });

}

const currentPath = window.location.pathname;

document.querySelectorAll("nav a").forEach(link => {

    const linkPath = new URL(link.href).pathname;

    if (
        currentPath === linkPath ||
        (linkPath !== "/" && currentPath.startsWith(linkPath))
    ) {

        link.classList.add("active");

    }

});

//customer support

const support = document.getElementById("support");
const header = document.getElementById("support-header");

let dragging = false;
let offsetX = 0;
let offsetY = 0;

header.addEventListener("mousedown", e => {

    dragging = true;

    offsetX = e.clientX - support.offsetLeft;
    offsetY = e.clientY - support.offsetTop;

    header.style.cursor = "grabbing";

});

document.addEventListener("mousemove", e => {

    if (!dragging) return;

    support.style.left = (e.clientX - offsetX) + "px";
    support.style.top = (e.clientY - offsetY) + "px";

    support.style.right = "auto";
    support.style.bottom = "auto";

});

document.addEventListener("mouseup", () => {

    dragging = false;

    header.style.cursor = "grab";

});

const open = document.getElementById("openSupport");
const close = document.getElementById("closeSupport");

open.onclick = () => {

    support.style.display = "block";

    open.style.display = "none";

};

close.onclick = () => {

    support.style.display = "none";

    open.style.display = "block";

};

document.getElementById("send").onclick = async () => {

    const prompt = document.getElementById("prompt").value;

    const res = await fetch(
        "https://burtcoza.lkaisoleo.workers.dev",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ prompt })
        }
    );

    const data = await res.json();

    // Append the user's message and the AI's reply to #messages
};

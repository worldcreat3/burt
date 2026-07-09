const supabaseClient = window.supabase.createClient(
    "https://dfosjtdmcjylljzgwcae.supabase.co",
    "sb_publishable_cic4-z59Hjct2jQKJJ3mWw_SZ526Xyw"
);

const steps = document.querySelectorAll(".step");
const circles = document.querySelectorAll(".progress-steps span");
const bar = document.getElementById("progressBar");
const checkoutForm = document.getElementById("checkoutForm");

let current = 0;

function updateStep() {

    steps.forEach((step, i) => {
        step.classList.toggle("active", i === current);
    });

    circles.forEach((circle, i) => {
        circle.classList.toggle("active", i <= current);
    });

    bar.style.width = ((current + 1) / steps.length) * 100 + "%";

}

document.querySelectorAll(".next").forEach(button => {

    button.addEventListener("click", () => {

        if (current < steps.length - 1) {

            current++;
            updateStep();

        }

    });

});

document.querySelectorAll(".back").forEach(button => {

    button.addEventListener("click", () => {

        if (current > 0) {

            current--;
            updateStep();

        }

    });

});

updateStep();

checkoutForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const file = document.getElementById("image").files[0];

    if (!file) {

        alert("Please upload an image.");
        return;

    }

    const filename = crypto.randomUUID() + "-" + file.name;

    const { error: uploadError } = await supabaseClient.storage
        .from("orders")
        .upload(filename, file);

    if (uploadError) {

        console.error(uploadError);
        alert(uploadError.message);
        return;

    }

    const order = {

        first_name: document.getElementById("firstName").value,
        last_name: document.getElementById("lastName").value,
        email: document.getElementById("email").value,

        prompt: document.getElementById("prompt").value,

        quantity: Number(document.getElementById("quantity").value),

        delivery_date: document.getElementById("deliveryDate").value,

        delivery_method: document.getElementById("deliveryMethod").value,

        promo_code: document.getElementById("promoCode").value,

        image_url: filename

    };

    const { error: insertError } = await supabaseClient
        .from("orders")
        .insert([order]);

    if (insertError) {

        alert("Database error:\n\n" + insertError.message);
        return;

    }

    alert("Order submitted successfully!");

    checkoutForm.reset();

    current = 0;

    updateStep();

});
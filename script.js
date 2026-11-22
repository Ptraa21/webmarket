
/* =================================
   KONFIGURASI WEBSITE
================================= */

const WHATSAPP_NUMBER = "628972260005";
const DELIVERY_FEE = 10000;


/* =================================
   DATA MENU
================================= */

const menus = [
    {
        id: 1,
        name: "Nasi Goreng Original",
        description: "Nasi goreng dengan bumbu khas.",
        price: 12000,
        emoji: "🍛",
        image: "image/nasgor.jpg"
    },
    {
        id: 2,
        name: "Nasi Gorprek",
        description: "Nasi goreng dengan ayam geprek.",
        price: 18000,
        emoji: "🍳",
        image: "image/nasgorspecial.jpg"
    },
    {
        id: 3,
        name: "Ayam Geprek",
        description: "Ayam crispy dengan sambal pedas.",
        price: 15000,
        emoji: "🍗",
        image: "image/ayamgeprek.jpg"
    },
    {
        id: 4,
        name: "Ayam Geprek Keju",
        description: "Ayam geprek dengan topping keju.",
        price: 20000,
        emoji: "🧀",
        image: "image/ayamgeprekkeju.jpg"
    },
    {
        id: 5,
        name: "Teh Anget",
        description: "Teh hangat yang nikmat dan menyegarkan.",
        price: 4000,
        emoji: "☕",
        image: "image/tehanget.jpg"
    },
    {
        id: 6,
        name: "Es Teh",
        description: "Es teh manis dingin dan menyegarkan.",
        price: 4000,
        emoji: "🧋",
        image: "image/esteh.jpg"
    },
    {
        id: 7,
        name: "Sambal",
        description: "Sambal pedas untuk pelengkap makanan.",
        price: 3000,
        emoji: "🌶️",
        image: "image/sambel.jpg"
    }
];


/* =================================
   STATE
================================= */

let cart = [];


/* =================================
   ELEMENT HTML
================================= */

const menuList = document.getElementById("menu-list");
const cartList = document.getElementById("cart-list");
const cartCount = document.getElementById("cart-count");

const modal = document.getElementById("checkout-modal");
const orderType = document.getElementById("order-type");
const paymentMethod = document.getElementById("payment-method");

const addressGroup = document.getElementById("address-group");
const addressInput = document.getElementById("customer-address");

const qrisSection = document.getElementById("qris-section");
const toast = document.getElementById("toast");


/* =================================
   FORMAT RUPIAH
================================= */

function rupiah(number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(number);
}


/* =================================
   RENDER MENU
================================= */

function renderMenus() {
    menuList.innerHTML = menus.map((menu, index) => `
        <article
            class="menu-card"
            style="animation-delay: ${index * 0.1}s"
        >
            <div class="menu-image">
                <img
                    src="${menu.image}"
                    alt="${menu.name}"
                    loading="lazy"
                    onerror="this.style.display='none'; this.parentElement.textContent='${menu.emoji}'"
                >
            </div>

            <div class="menu-info">
                <h3>${menu.name}</h3>

                <p>${menu.description}</p>

                <div class="menu-bottom">
                    <span class="menu-price">
                        ${rupiah(menu.price)}
                    </span>

                    <button
                        class="add-button"
                        data-add="${menu.id}"
                        aria-label="Tambah ${menu.name}"
                    >
                        +
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}


/* =================================
   ANIMASI MAKANAN TERBANG
================================= */

function flyToCart(element, emoji) {
    const start = element.getBoundingClientRect();

    const cartButton = document.getElementById("cart-button");
    const end = cartButton.getBoundingClientRect();

    const flying = document.createElement("div");

    flying.className = "flying-food";
    flying.textContent = emoji;

    flying.style.left = `${start.left + start.width / 2}px`;
    flying.style.top = `${start.top + start.height / 2}px`;

    document.body.appendChild(flying);

    const destinationX = end.left + end.width / 2;
    const destinationY = end.top + end.height / 2;

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            flying.style.left = `${destinationX}px`;
            flying.style.top = `${destinationY}px`;
            flying.style.transform = "scale(.2) rotate(360deg)";
            flying.style.opacity = "0";
        });
    });

    setTimeout(() => {
        flying.remove();

        cartButton.animate(
            [
                { transform: "scale(1)" },
                { transform: "scale(1.15)" },
                { transform: "scale(1)" }
            ],
            {
                duration: 350,
                easing: "ease-out"
            }
        );
    }, 800);
}


/* =================================
   TAMBAH KE KERANJANG
================================= */

function addToCart(id, button) {
    const menu = menus.find(item => item.id === id);

    if (!menu) return;

    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...menu,
            quantity: 1
        });
    }

    flyToCart(button, menu.emoji);

    renderCart();
    showToast(`${menu.name} ditambahkan!`);
}


/* =================================
   UBAH JUMLAH PRODUK
================================= */

function changeQuantity(id, amount) {
    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(item => item.id !== id);
    }

    renderCart();
}


/* =================================
   HITUNG SUBTOTAL
================================= */

function calculateSubtotal() {
    return cart.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);
}


/* =================================
   HITUNG ONGKIR
================================= */

function calculateDeliveryFee() {
    return orderType.value === "Delivery"
        ? DELIVERY_FEE
        : 0;
}


/* =================================
   RENDER KERANJANG
================================= */

function renderCart() {
    const totalItems = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartList.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <p>Keranjang masih kosong</p>
                <small>Yuk, pilih menu favoritmu!</small>
            </div>
        `;
    } else {
        cartList.innerHTML = cart.map(item => `
            <div class="cart-item">

                <div class="cart-item-info">
                    <h4>${item.emoji} ${item.name}</h4>

                    <p>
                        ${rupiah(item.price * item.quantity)}
                    </p>
                </div>

                <div class="quantity-control">

                    <button
                        data-quantity="${item.id}"
                        data-change="-1"
                        aria-label="Kurangi jumlah"
                    >
                        −
                    </button>

                    <span>${item.quantity}</span>

                    <button
                        data-quantity="${item.id}"
                        data-change="1"
                        aria-label="Tambah jumlah"
                    >
                        +
                    </button>

                </div>
            </div>
        `).join("");
    }

    document.getElementById("cart-total").textContent =
        rupiah(calculateSubtotal());

    updatePriceDetails();
}


/* =================================
   UPDATE RINCIAN CHECKOUT
================================= */

function updatePriceDetails() {
    const subtotal = calculateSubtotal();
    const delivery = calculateDeliveryFee();

    document.getElementById("subtotal").textContent =
        rupiah(subtotal);

    document.getElementById("delivery-fee").textContent =
        rupiah(delivery);

    document.getElementById("final-total").textContent =
        rupiah(subtotal + delivery);
}


/* =================================
   TOAST NOTIFICATION
================================= */

let toastTimer;

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


/* =================================
   PILIH JENIS PESANAN
================================= */

orderType.addEventListener("change", () => {
    const isDelivery = orderType.value === "Delivery";

    addressGroup.hidden = !isDelivery;
    addressInput.required = isDelivery;

    updatePriceDetails();
});


/* =================================
   PILIH PEMBAYARAN
================================= */

paymentMethod.addEventListener("change", () => {
    const isQRIS = paymentMethod.value === "QRIS";

    qrisSection.hidden = !isQRIS;
});


/* =================================
   BUKA CHECKOUT
================================= */

function openCheckout() {
    if (cart.length === 0) {
        showToast("Keranjang masih kosong!");
        return;
    }

    modal.classList.add("active");
    updatePriceDetails();
}

document
    .getElementById("checkout-button")
    .addEventListener("click", openCheckout);

document
    .getElementById("cart-button")
    .addEventListener("click", () => {
        document.getElementById("cart-section")
            .scrollIntoView({ behavior: "smooth" });
    });


/* =================================
   TUTUP CHECKOUT
================================= */

function closeCheckout() {
    modal.classList.remove("active");
}

document
    .getElementById("close-modal")
    .addEventListener("click", closeCheckout);

modal.addEventListener("click", event => {
    if (event.target === modal) {
        closeCheckout();
    }
});

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCheckout();
    }
});


/* =================================
   EVENT MENU DAN KERANJANG
================================= */

menuList.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (!button) return;

    const id = Number(button.dataset.add);

    addToCart(id, button);
});

cartList.addEventListener("click", event => {
    const button = event.target.closest("[data-quantity]");

    if (!button) return;

    const id = Number(button.dataset.quantity);
    const amount = Number(button.dataset.change);

    changeQuantity(id, amount);
});


/* =================================
   CHECKOUT WHATSAPP
================================= */

document
    .getElementById("checkout-form")
    .addEventListener("submit", event => {

        event.preventDefault();

        if (cart.length === 0) {
            showToast("Keranjang masih kosong!");
            return;
        }

        const name = document
            .getElementById("customer-name")
            .value.trim();

        const note = document
            .getElementById("customer-note")
            .value.trim();

        const address = addressInput.value.trim();

        const type = orderType.value;
        const payment = paymentMethod.value;

        if (!name) {
            alert("Masukkan nama pelanggan.");
            return;
        }

        if (type === "Delivery" && !address) {
            alert("Masukkan alamat pengiriman.");
            return;
        }

        const subtotal = calculateSubtotal();
        const delivery = calculateDeliveryFee();
        const total = subtotal + delivery;

        const orderItems = cart.map(item => {
            const itemTotal = item.price * item.quantity;

            return `- ${item.name} x${item.quantity} = ${rupiah(itemTotal)}`;
        }).join("\n");

        const message = `
HALO, SAYA INGIN MEMESAN

Nama: ${name}
Jenis pesanan: ${type}

DAFTAR PESANAN:
${orderItems}

Subtotal: ${rupiah(subtotal)}
Ongkir: ${rupiah(delivery)}
TOTAL PEMBAYARAN: ${rupiah(total)}

Metode pembayaran: ${payment}
${type === "Delivery" ? `Alamat: ${address}` : ""}

${payment === "QRIS"
    ? "INFORMASI: Saya akan mengirimkan bukti pembayaran secara manual melalui WhatsApp."
    : ""}

Catatan:
${note || "-"}

Terima kasih.
        `.trim();

        const whatsappURL =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank");

        closeCheckout();
    });


/* =================================
   INISIALISASI WEBSITE
================================= */

qrisSection.hidden = paymentMethod.value !== "QRIS";
addressGroup.hidden = orderType.value !== "Delivery";

renderMenus();
renderCart();
updatePriceDetails();

const SUPABASE_URL =
  "https://tkjrrqpufbfmqxeylpqn.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_opa0V471t-Vvi0v8hW9Hrw_tPLstVxz";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let cart = [];


// ==========================
// CART
// ==========================

function addToCart(name, price) {
  cart.push({
    name: name,
    price: price
  });

  renderCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const checkoutTotal = document.getElementById("checkout-total");

  if (!cartItems) return;

  let total = 0;

  cartItems.innerHTML = "";

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
  }

  cart.forEach((item, index) => {
    total += item.price;

    const div = document.createElement("div");

    div.className = "cart-item";

    div.innerHTML = `
      <span>${escapeHTML(item.name)}</span>
      <span>
        ₹${item.price}
        <button type="button" onclick="removeFromCart(${index})">×</button>
      </span>
    `;

    cartItems.appendChild(div);
  });

  if (cartTotal) {
    cartTotal.textContent = total;
  }

  if (checkoutTotal) {
    checkoutTotal.textContent = total;
  }
}


// ==========================
// LOGIN POPUP
// ==========================

function openLogin() {
  const modal = document.getElementById("login-modal");

  if (modal) {
    modal.style.display = "flex";
  }
}

function closeLogin() {
  const modal = document.getElementById("login-modal");

  if (modal) {
    modal.style.display = "none";
  }
}


// ==========================
// LOGIN
// ==========================

async function loginUser() {
  const ign =
    document.getElementById("login-ign").value.trim();

  const passwordBox =
    document.getElementById("admin-password-box");

  const password =
    document.getElementById("admin-password").value;

  const message =
    document.getElementById("login-message");

  if (!ign) {
    message.textContent =
      "❌ Enter your Minecraft username.";
    return;
  }

  message.textContent = "Checking...";

  const {
    data: admin,
    error
  } = await supabaseClient
    .from("admins")
    .select("id, username, is_super_admin")
    .eq("username", ign)
    .maybeSingle();

  if (error) {
    console.error(error);
    message.textContent =
      "❌ Login check failed.";
    return;
  }

  // ADMIN
  if (admin) {

    passwordBox.style.display = "block";

    if (!password) {
      message.textContent =
        "🔐 Admin password required.";
      return;
    }

    const email = prompt(
      "Enter your admin email:"
    );

    if (!email) {
      message.textContent =
        "❌ Admin email required.";
      return;
    }

    const {
      data,
      error: loginError
    } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (loginError) {
      message.textContent =
        "❌ Incorrect admin password.";
      return;
    }

    if (!data.user || data.user.id !== admin.id) {
      await supabaseClient.auth.signOut();

      message.textContent =
        "❌ Admin account mismatch.";

      return;
    }

    location.href = "admin-panel.html";

    return;
  }

  // PLAYER
  sessionStorage.setItem(
    "player_ign",
    ign
  );

  const playerInput =
    document.getElementById("player-name");

  if (playerInput) {
    playerInput.value = ign;
  }

  message.textContent =
    "✅ Player login successful!";

  setTimeout(() => {
    closeLogin();
    updateLoginButton();
  }, 500);
}


// ==========================
// LOGIN BUTTON
// ==========================

function updateLoginButton() {
  const button =
    document.querySelector(".login-btn");

  const player =
    sessionStorage.getItem("player_ign");

  if (!button) return;

  if (player) {

    button.textContent = player;

    button.onclick = () => {

      if (confirm("Logout from Player MC?")) {

        sessionStorage.removeItem(
          "player_ign"
        );

        location.reload();
      }
    };

  } else {

    button.textContent = "LOGIN";
    button.onclick = openLogin;
  }
}


// ==========================
// UPI PAYMENT
// ==========================

function setupUPI() {
  const button = document.getElementById("upi-button");

  if (!button) return;

  button.addEventListener("click", function () {

    const player = sessionStorage.getItem("player_ign");

    if (!player) {
      alert("Please login first.");
      openLogin();
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + Number(item.price),
      0
    );

    // Show screenshot section
    const upload = document.getElementById("payment-upload");

    if (upload) {
      upload.style.display = "block";
    }

    // Create UPI payment URL
    const upiURL =
      "upi://pay" +
      "?pa=ankita865739%40okicici" +
      "&pn=Ankita" +
      "&am=" + total.toFixed(2) +
      "&cu=INR" +
      "&aid=uGICAgMC896i-lw";

    // IMPORTANT:
    // Launch immediately inside the user's click.
    window.location.href = upiURL;
  });
}


// ==========================
// SUBMIT ORDER
// ==========================

async function submitOrder(event) {

  event.preventDefault();

  const player =
    sessionStorage.getItem("player_ign");

  if (!player) {
    alert("Please login first.");
    openLogin();
    return;
  }

  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const email =
    document.getElementById("email").value.trim();

  const discord =
    document.getElementById("discord").value.trim();

  const screenshot =
    document.getElementById(
      "payment-screenshot"
    ).files[0];

  if (!email) {
    alert("Please enter your email.");
    return;
  }

  if (!discord) {
    alert("Please enter your Discord username.");
    return;
  }

  if (!screenshot) {
    alert("Please upload your payment screenshot.");
    return;
  }

  const total =
    cart.reduce(
      (sum, item) => sum + item.price,
      0
    );

  const orderID =
    crypto.randomUUID();

  const extension =
    screenshot.name
      .split(".")
      .pop()
      .toLowerCase();

  const filePath =
    orderID + "." + extension;

  const submitButton =
    event.target.querySelector(
      'button[type="submit"]'
    );

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "UPLOADING...";
  }

  try {

    // Upload screenshot
    const {
      error: uploadError
    } = await supabaseClient.storage
      .from("payment-screenshots")
      .upload(
        filePath,
        screenshot,
        {
          contentType: screenshot.type,
          upsert: false
        }
      );

    if (uploadError) {
      throw uploadError;
    }

    // Screenshot URL
    const {
      data: publicData
    } = supabaseClient.storage
      .from("payment-screenshots")
      .getPublicUrl(filePath);

    // Create order
    const {
      error: orderError
    } = await supabaseClient
      .from("orders")
      .insert({
        id: orderID,

        minecraft_username:
          player,

        email:
          email,

        discord_username:
          discord,

        items:
          cart,

        total:
          total,

        payment_screenshot:
          publicData.publicUrl,

        payment_status:
          "verifying",

        status:
          "Payment Submitted - Verifying"
      });

    if (orderError) {
      throw orderError;
    }

    document.getElementById(
      "order-success"
    ).innerHTML = `

      <div>

        <h3>
          ✅ Order Placed Successfully!
        </h3>

        <p>
          <strong>Order ID:</strong>
        </p>

        <p>
          ${escapeHTML(orderID)}
        </p>

        <p>
          Your payment screenshot has been received.
        </p>

        <p>
          <strong>
            We are verifying your payment manually.
          </strong>
        </p>

        <p>
          After verification, your purchase
          will be credited to your Minecraft account.
        </p>

        <p>
          For any query, raise a ticket on Discord.
        </p>

        <a
          href="https://discord.com/"
          target="_blank"
          rel="noopener"
        >
          <button type="button">
            OPEN DISCORD
          </button>
        </a>

      </div>
    `;

    cart = [];

    renderCart();

    event.target.reset();

    const playerInput =
      document.getElementById("player-name");

    if (playerInput) {
      playerInput.value = player;
    }

    const upload =
      document.getElementById("payment-upload");

    if (upload) {
      upload.style.display = "none";
    }

  } catch (error) {

    console.error(
      "Order error:",
      error
    );

    alert(
      "Order failed: " +
      error.message
    );

  } finally {

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent =
        "SUBMIT PAYMENT";
    }
  }
}


// ==========================
// HTML SECURITY
// ==========================

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ==========================
// START
// ==========================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    renderCart();

    updateLoginButton();

    setupUPI();

    const player =
      sessionStorage.getItem("player_ign");

    if (player) {

      const playerInput =
        document.getElementById("player-name");

      if (playerInput) {
        playerInput.value = player;
      }
    }

    const checkoutForm =
      document.getElementById("checkout-form");

    if (checkoutForm) {

      checkoutForm.addEventListener(
        "submit",
        submitOrder
      );
    }

  }
);

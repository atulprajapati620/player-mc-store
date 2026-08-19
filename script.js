const SUPABASE_URL = "https://pncgujgpbapsatrdhmjl.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

let cart = [];

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();

  document.getElementById("cart").scrollIntoView({
    behavior: "smooth"
  });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0";
    updateCheckoutTotal();
    return;
  }

  let total = 0;

  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    total += item.price;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <span>${item.name}</span>
      <span>
        ₹${item.price}
        <span class="remove"> × </span>
      </span>
    `;

    div.querySelector(".remove").onclick = () => {
      removeFromCart(index);
    };

    cartItems.appendChild(div);
  });

  cartTotal.textContent = total;
  updateCheckoutTotal();
}

function updateCheckoutTotal() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("checkout-total").textContent = total;
}

document.querySelectorAll(".add-cart").forEach(button => {
  button.addEventListener("click", () => {
    addToCart(
      button.dataset.name,
      Number(button.dataset.price)
    );
  });
});

document.getElementById("checkout-form").addEventListener("submit", async function(event) {
  event.preventDefault();

  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const username = document.getElementById("player-name").value;
  const email = document.getElementById("email").value;
  const discord = document.getElementById("discord").value;

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const { error } = await supabaseClient
    .from("orders")
    .insert({
      minecraft_username: username,
      email: email,
      discord_username: discord,
      items: cart,
      total: total
    });

  if (error) {
    console.error(error);
    alert("Order failed. Please try again.");
    return;
  }

  document.getElementById("order-success").innerHTML = `
    ✅ Order received!<br><br>
    Player: ${username}<br>
    Total: ₹${total}
  `;

  cart = [];
  renderCart();
  this.reset();
});

renderCart();

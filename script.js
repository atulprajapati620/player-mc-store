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

  if (!cartItems || !cartTotal) return;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0";
    return;
  }

  let total = 0;

  cartItems.innerHTML = "";

  cart.forEach((item, index) => {
    total += item.price;

    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";

    itemElement.innerHTML = `
      <span>${item.name}</span>
      <span>
        ₹${item.price}
        <span class="remove"> × </span>
      </span>
    `;

    itemElement.querySelector(".remove").addEventListener("click", () => {
      removeFromCart(index);
    });

    cartItems.appendChild(itemElement);
  });

  cartTotal.textContent = total;
}

document.addEventListener("DOMContentLoaded", renderCart);
function updateCheckoutTotal() {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("checkout-total").textContent = total;
}

const originalRenderCart = renderCart;

renderCart = function () {
  originalRenderCart();
  updateCheckoutTotal();
};

document
  .getElementById("checkout-form")
  .addEventListener("submit", function (event) {

    event.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const username = document.getElementById("player-name").value;
    const email = document.getElementById("email").value;
    const discord = document.getElementById("discord").value;

    document.getElementById("order-success").innerHTML = `
      ✅ Order created successfully!<br><br>
      Player: ${username}<br>
      Email: ${email}<br>
      Discord: ${discord}<br>
      Total: ₹${cart.reduce((sum, item) => sum + item.price, 0)}
      <br><br>
      <small>Payment system will be connected later.</small>
    `;

    cart = [];
    renderCart();
    this.reset();
  });
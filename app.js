const translations = { 
  en: {
    header_line1: "The Friendly Way to Tour La Paz",
    header_line2: "Modern E-Rentals for Modern Explorers",    
    title_select_vehicle: "Rent an Electronic Vehicle",
    scooter_title: "E-Scooter",
    scooter_desc: "Perfect for city rides",
    ebike_title: "E-Bike",
    ebike_desc: "Comfort & longer distances",
    label_name: "Your Name",
    label_start: "Start Date",
    label_end: "End Date",
    label_quantity: "Quantity",
    label_delivery: "Delivery Location",
    delivery_info: "Delivery or pick up within the city is included. Additional fees apply for the outskirts.",
    btn_whatsapp: "Send Booking via WhatsApp",
    price_list_title: "Prices (1–7 Days)"
  },
  es: {
    header_line1: "La manera más facil de recorrer La Paz",
    header_line2: "Movilidad moderna para explorar con libertad",
    title_select_vehicle: "Renta un vehículo electronico",
    scooter_title: "E-Scooter",
    scooter_desc: "Perfecto para la ciudad",
    ebike_title: "E-Bike",
    ebike_desc: "Comodidad y distancias largas",
    label_name: "Tu Nombre",
    label_start: "Fecha de Inicio",
    label_end: "Fecha Final",
    label_quantity: "Cantidad",
    label_delivery: "Ubicación de Entrega",
    delivery_info: "La entrega dentro de La Paz está incluida. Se aplican cargos adicionales fuera de la ciudad.",
    btn_whatsapp: "Enviar reserva por WhatsApp",
    price_list_title: "Precios (1–7 Días)"
  }
};

function detectLanguage() {
  const userLang = navigator.language || navigator.userLanguage;
  return userLang.startsWith("es") ? "es" : "en";
}

function applyTranslations(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });

  // Preislistentitel aktualisieren
  const priceTitle = document.getElementById("priceListTitle");
  if (priceTitle) {
    priceTitle.innerText = translations[lang].price_list_title;
  }
}

let selectedVehicle = "";
let selectedVehicleImage = "";
let priceData = [];
let surchargeData = [];

// ---------- LOAD DATA ----------

async function loadPrices() {
  const response = await fetch(
    "https://opensheet.elk.sh/1XPxsPc4Mo5Wu-tdfXUPm78JKEdJsK-57cN4cuoPqgEE/Tabellenblatt1"
  );
  priceData = await response.json();
}

async function loadSurcharges() {
  const response = await fetch(
    "https://opensheet.elk.sh/1k5bX1Rhernmhu3JuUVLKKx1v0EW_H1jpWwgCc7k4O3I/Tabellenblatt1"
  );
  surchargeData = await response.json();
  populateDeliveryZones();
}

// ---------- VEHICLE SELECTION ----------

function selectVehicle(type, imagePath) {

  selectedVehicle = type;

  document.getElementById("vehicleSelection").style.display = "none";
  document.getElementById("bookingSection").classList.remove("hidden");

  if (!imagePath) {
    imagePath = type === "scooter" ? "scooter.jpeg" : "ebike.jpeg";
  }

  document.getElementById("formVehicleImage").src = imagePath;

  // Preise erst rendern wenn geladen
  if (priceData.length) {
    renderPriceList();
  } else {
    loadPrices().then(renderPriceList);
  }
}

// ---------- BACK BUTTON ----------

function closeForm() {
  document.getElementById("bookingSection").style.display = "none";
  document.getElementById("vehicleSelection").style.display = "block";
}

// ---------- PRICE LIST 1–7 DAYS ----------

function renderPriceList() {

  if (!priceData.length || !selectedVehicle) return;

  const container = document.getElementById("priceList");
  container.innerHTML = "";

  for (let i = 1; i <= 7; i++) {

    const price = getPrice(i, selectedVehicle);

    const row = document.createElement("div");
    row.className = "price-row";
    row.innerHTML = `
      <span>${i} Day${i > 1 ? "s" : ""}</span>
      <span>$${price}</span>
    `;

    container.appendChild(row);
  }
}

// ---------- DELIVERY ----------

function populateDeliveryZones() {
  const select = document.getElementById("deliveryZone");
  select.innerHTML = "";

  surchargeData.forEach(zone => {
    let option = document.createElement("option");
    option.value = zone.zone;
    option.text =
      zone.zone +
      (parseInt(zone.surcharge) > 0
        ? " (+$" + zone.surcharge + ")"
        : " (included)");
    select.appendChild(option);
  });
}

function getSurcharge(zoneName) {
  const match = surchargeData.find(z => z.zone === zoneName);
  return match ? parseInt(match.surcharge) : 0;
}

// ---------- PRICE CALCULATION ----------

function calculateDays(start, end) {
  const startDate = new Date(start + "T00:00:00");
  const endDate = new Date(end + "T00:00:00");
  const diffTime = endDate - startDate;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function getPrice(days, vehicle) {
  const match = priceData.find(p => parseInt(p.days) === days);
  if (!match) return 0;
  return parseInt(match[vehicle]);
}

function calculate() {
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  const quantity = parseInt(document.getElementById("quantity").value);
  const zone = document.getElementById("deliveryZone").value;

  if (!start || !end || !selectedVehicle) {
    document.getElementById("totalPrice").innerText = "$0";
    return;
  }

  const days = calculateDays(start, end);

  if (days < 1 || days > 14) {
    document.getElementById("totalPrice").innerText = "Invalid duration";
    return;
  }

  const basePrice = getPrice(days, selectedVehicle) * quantity;
  const surcharge = getSurcharge(zone);
  const total = basePrice + surcharge;

  document.getElementById("totalPrice").innerText = "$" + total;
}

// ---------- WHATSAPP ----------

function sendWhatsApp() {
  const name = document.getElementById("customerName").value.trim();
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  const quantity = document.getElementById("quantity").value;
  const zone = document.getElementById("deliveryZone").value;
  const total = document.getElementById("totalPrice").innerText;

  if (!name || !start || !end || !selectedVehicle) {
    alert("Please complete booking details first.");
    return;
  }

  const message = `
Hi Baja Wheels, I would like to rent ${quantity} ${selectedVehicle}(s) 
from ${start} to ${end} in ${zone}. 
Total: MXN ${total}. 
Thanks, ${name}
  `;

  const phoneNumber = "41797943212";

  const url =
    "https://wa.me/" +
    phoneNumber +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}

// ---------- INIT ----------

document.addEventListener("DOMContentLoaded", function () {

  const lang = detectLanguage();
  applyTranslations(lang);

  document.getElementById("startDate").addEventListener("change", calculate);
  document.getElementById("endDate").addEventListener("change", calculate);
  document.getElementById("quantity").addEventListener("input", calculate);
  document.getElementById("deliveryZone").addEventListener("change", calculate);

  loadPrices();
  loadSurcharges();
});

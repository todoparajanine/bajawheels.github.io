const translations = {

en: {

page_title: "Baja Wheels – Scooter & E-Bike Rental",

header_line1: "The Friendly Way to Tour La Paz",
header_line2: "Modern Mobility for Modern Explorers",
hero_text: "Enjoy a powerful premium vehicle paired with personalized service and attention to detail.",

boutique_title: "Boutique Rental Experience",
boutique_text: "We pick you up or deliver your vehicle directly to your hotel or accommodation — fully prepared and ready to ride.Explore La Paz at your own pace: quiet, smooth, and effortless. <br><br>Booking is easy: choose your vehicle, select your dates, and send your request — we take care of the rest.",

vehicle_question: "Which vehicle should you choose?",

scooter_title: "Electric Scooter",
scooter_desc: "Powerful urban scooter for quick city exploration.",

ebike_title: "Electric Bike",
ebike_desc: "Comfortable and powerful eBike for longer rides.",

btn_select: "Select",
btn_back: "← Back",

vehicle_scooter: "scooters",
vehicle_ebike: "electric bikes",

label_name: "Your Name",
label_start: "Start Date",
label_end: "End Date",
label_quantity: "Quantity",
label_delivery: "Delivery Zone",

delivery_info: "Delivery within La Paz area.",

btn_whatsapp: "Send via WhatsApp",

price_list_title: "Prices (1–7 Days)",

legal_title: "Legal Disclaimer",
legal_accept: "I accept the legal conditions",
legal_text: "...",

whatsapp_message:
"Hi Baja Wheels, I would like to rent {quantity} {vehicle}(s)\nfrom {start} to {end} in {zone}.\nTotal: MXN {price}.\nThanks, {customerName}"
},

es: {

page_title: "Baja Wheels – Alquiler de Scooters y Bicicletas Eléctricas",

header_line1: "La forma amigable de explorar La Paz",
header_line2: "Movilidad moderna para exploradores modernos",
hero_text: "Disfruta de un vehículo potente acompañado de un servicio personalizado.",

boutique_title: "Experiencia de alquiler boutique",
boutique_text: "Te recogemos o entregamos tu vehículo directamente en tu hotel o alojamiento — completamente preparado y listo para conducir.Explora La Paz a tu propio ritmo: silencioso, suave y sin esfuerzo. <br><br>Reservar es fácil: elige tu vehículo, selecciona tus fechas y envía tu solicitud — nosotros nos encargamos del resto.",

vehicle_question: "¿Qué vehículo quieres elegir?",

scooter_title: "Scooter Eléctrico",
scooter_desc: "Scooter potente para explorar la ciudad rápidamente.",

ebike_title: "Bicicleta Eléctrica",
ebike_desc: "eBike cómoda y potente para recorridos más largos.",

btn_select: "Seleccionar",
btn_back: "← Volver",

vehicle_scooter: "scooters eléctricos",
vehicle_ebike: "bicicletas eléctricas",

label_name: "Tu nombre",
label_start: "Fecha de inicio",
label_end: "Fecha de fin",
label_quantity: "Cantidad",
label_delivery: "Zona de entrega",

delivery_info: "Entrega dentro del área de La Paz.",

btn_whatsapp: "Enviar por WhatsApp",

price_list_title: "Precios (1–7 días)",

legal_title: "Aviso legal",
legal_accept: "Acepto las condiciones legales",
legal_text: "...",

whatsapp_message:
"Hola Baja Wheels, me gustaría alquilar {quantity} {vehicle}(s)\ndesde {start} hasta {end} en {zone}.\nTotal: MXN {price}.\nGracias, {customerName}"

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
      el.innerHTML = translations[lang][key];
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

  const vehicles = document.getElementById("vehicleSelection");
  const booking = document.getElementById("bookingSection");

  vehicles.style.display = "none";
  booking.style.display = "block";
  booking.classList.remove("hidden");

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

  const booking = document.getElementById("bookingSection");
  const vehicles = document.getElementById("vehicleSelection");

  booking.classList.add("hidden");
  booking.style.display = "none";

  vehicles.style.display = "";

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
      <span class="price">MXN ${formatMXN(price)}</span>
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
        ? " (+MXN " + formatMXN(zone.surcharge) + ")"
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

function formatMXN(amount) {
  return new Intl.NumberFormat("en-US").format(amount);
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

  document.getElementById("totalPrice").innerText = "MXN " + formatMXN(total);
}

// ---------- WHATSAPP ----------

function sendWhatsApp() {

  const lang = detectLanguage();

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

  let message = translations[lang].whatsapp_message;

  message = message
    .replace("{vehicle}", translations[lang]["vehicle_" + selectedVehicle])
    .replace("{start}", start)
    .replace("{end}", end)
    .replace("{quantity}", quantity)
    .replace("{price}", total.replace("MXN ",""))
    .replace("{zone}", zone)
    .replace("{customerName}", name);

  const phoneNumber = "41797943212";

  const url =
  "https://wa.me/" +
  phoneNumber +
  "?text=" +
  encodeURIComponent(message);

  window.open(url, "_blank");
}


/// ---------- INIT ----------

document.addEventListener("DOMContentLoaded", function () {

  const lang = detectLanguage();
  applyTranslations(lang);

  const startDate = document.getElementById("startDate");
  const endDate = document.getElementById("endDate");
  const quantity = document.getElementById("quantity");
  const deliveryZone = document.getElementById("deliveryZone");

  if (startDate) startDate.addEventListener("change", calculate);
  if (endDate) endDate.addEventListener("change", calculate);
  if (quantity) quantity.addEventListener("input", calculate);
  if (deliveryZone) deliveryZone.addEventListener("change", calculate);

  const checkbox = document.getElementById("acceptLegal");
  const whatsappBtn = document.getElementById("whatsappBtn");

  if (checkbox && whatsappBtn) {
    checkbox.addEventListener("change", function () {
      whatsappBtn.disabled = !this.checked;
    });
  }

  loadPrices();
  loadSurcharges();

});


// Legal checkbox activation
document.addEventListener("DOMContentLoaded", function () {

  const checkbox = document.getElementById("acceptLegal");
  const whatsappBtn = document.getElementById("whatsappBtn");

  if (checkbox && whatsappBtn) {
    whatsappBtn.disabled = true;

    checkbox.addEventListener("change", function () {
      whatsappBtn.disabled = !this.checked;
    });
  }

});
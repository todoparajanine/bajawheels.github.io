const translations = { 
  en: {
    header_line1: "The Friendly Way to Tour La Paz",
    header_line2: "Modern E-Rentals for Modern Explorers",    
    title_select_vehicle: "Rent an Electronic Vehicle",
    scooter_title: "E-Scooter",
    scooter_desc: "Perfect for city rides",
    ebike_title: "E-Bike",
    ebike_desc: "For short & longer rides",
    label_name: "Your Name",
    label_start: "Start Date",
    label_end: "End Date",
    label_quantity: "Quantity",
    label_delivery: "Delivery Location",
    delivery_info: "Customer pick up or vehicle delivery within the city is included. Additional fees apply for the outskirts.",
    btn_whatsapp: "Send Booking Request via WhatsApp",
    price_list_title: "Prices (1–7 days @ 24 hours)",
    legal_title: "Legal Disclaimer & Privacy Notice",

    legal_accept: "By using our services you acknowledge and accept these terms.",

    legal_title: "Legal Disclaimer & Privacy Notice",

legal_accept: "By using our services you acknowledge and accept these terms.",

legal_text: `
Rental Conditions
Minimum age: 18 years. Valid ID or passport required. Vehicles must be used responsibly and in accordance with local traffic laws.

Liability
Use of the vehicle is entirely at the renter’s own risk. Baja Wheels does not provide insurance for riders, passengers, or third parties.

Mechanical Issues
If a mechanical problem occurs not caused by misuse, we will provide assistance or a replacement vehicle when available.

Privacy Notice
We may collect basic personal data such as name, contact information, rental dates, and delivery location solely to process rental requests.

Personal data is never sold or shared with third parties except when required by law.

Contact: bajawheelslapaz@gmail.com

Governing Law
This service is governed by the laws of Mexico. Jurisdiction: Baja California Sur.
`
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
    delivery_info: "La recogida de personas o entrega de vehiculos dentro de La Paz está incluida. Se aplican cargos adicionales fuera      de la ciudad.",
    btn_whatsapp: "Enviar solicitud de reserva por WhatsApp",
    price_list_title: "Precios (1–7 días @ 24 horas)",

    legal_title: "Aviso Legal y Aviso de Privacidad",

legal_accept: "Al utilizar nuestros servicios usted acepta estos términos.",

legal_text: `
Condiciones de Renta
Edad mínima: 18 años. Se requiere identificación oficial o pasaporte. Los vehículos deben utilizarse de forma responsable y conforme a las leyes de tránsito.

Responsabilidad
El uso del vehículo se realiza bajo el propio riesgo del arrendatario. Baja Wheels no proporciona seguro para conductores, pasajeros o terceros.

Problemas Mecánicos
En caso de falla mecánica no causada por uso indebido, Baja Wheels proporcionará asistencia o un vehículo de reemplazo si está disponible.

Aviso de Privacidad
Podemos recopilar datos personales básicos como nombre, contacto, fechas de renta y ubicación de entrega únicamente para procesar la solicitud de renta.

Los datos personales no se venden ni se comparten con terceros salvo obligación legal.

Contacto: bajawheelslapaz@gmail.com

Legislación Aplicable
Este servicio se rige por las leyes de México. Jurisdicción: Baja California Sur.
`
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

  document.getElementById("startDate")?.addEventListener("change", calculate);
  document.getElementById("endDate")?.addEventListener("change", calculate);
  document.getElementById("quantity")?.addEventListener("input", calculate);
  document.getElementById("deliveryZone")?.addEventListener("change", calculate);

  const checkbox = document.getElementById("acceptLegal");
  const whatsappBtn = document.getElementById("whatsappBtn");

  if (checkbox && whatsappBtn) {
    checkbox.addEventListener("change", function () {
      whatsappBtn.disabled = !this.checked;
    });
  }

  loadPrices();
  loadSurcharges();

});// ---------- INIT ----------

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


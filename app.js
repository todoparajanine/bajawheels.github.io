const translations = {
  en: {
    header_line1: "The Friendly Way to Tour La Paz",
    header_line2: "Modern E-Rentals for Modern Explorers",    
    title_select_vehicle: "Rent an Eletronic Vehicle",
    scooter_title: "E-Scooter",
    scooter_desc: "Perfect for city rides",
    ebike_title: "E-Bike",
    ebike_desc: "Comfort & longer distances",
    label_name: "Your Name",
    label_start: "Start Date",
    label_end: "End Date",
    label_quantity: "Quantity",
    label_delivery: "Delivery Location",
    delivery_info: "Delivery within La Paz city is included. Additional fees apply outside city limits.",
    btn_whatsapp: "Send Booking via WhatsApp", 
    intro_paragraph_1: "A Boutique Electric Rental Experience in La Paz.\n\nEnjoy a powerful premium vehicle paired with personalized    service and attention to detail.",

    intro_paragraph_2: "We deliver your eBike or seated eScooter directly to your hotel or accommodation — fully prepared and ready to ride. Explore La Paz at your own pace: quiet, smooth, and effortless. When you're finished, we simply pick it up.",

    intro_booking: "Booking is easy: Choose your vehicle, select your dates, and send your request — we take care of the rest.",

    intro_choose_title: "Which one should you choose?",

    intro_scooter: "If you’d like to explore downtown La Paz and nearby beaches in the safest and most relaxed way, the seated eScooter is a perfect fit.",

    intro_ebike: "If you want to ride farther, reach scenic viewpoints, or explore beyond the city — including light off-road terrain — the eBike is your best choice.",

    intro_cta: "Make your selection and reserve today.",
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
    intro_paragraph_1: "Una experiencia boutique de renta eléctrica en La Paz.\n\nDisfruta de un vehículo premium potente, acompañado de un servicio personalizado y atención a cada detalle.",

    intro_paragraph_2: "Entregamos tu eBike o eScooter con asiento directamente en tu hotel o alojamiento — listo para usar. Recorre La Paz a tu propio ritmo: silencioso, suave y sin esfuerzo. Cuando termines, simplemente lo recogemos.",

    intro_booking: "Reservar es muy fácil: Elige tu vehículo, selecciona tus fechas y envía tu solicitud — nosotros nos encargamos del resto.",

    intro_choose_title: "¿Cuál deberías elegir?",

    intro_scooter: "Si deseas recorrer el centro de La Paz y las playas cercanas de la forma más segura y relajada, el eScooter con asiento es ideal para ti.",

    intro_ebike: "Si prefieres llegar más lejos, subir a miradores panorámicos o explorar fuera de la ciudad — incluso en caminos ligeros fuera de pavimento — la eBike es tu mejor opción.",

    intro_cta: "Haz tu elección y reserva hoy mismo.",

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
}



let selectedVehicle = "";
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

// ---------- UI FUNCTIONS ----------

function selectVehicle(type) {
  selectedVehicle = type;
  document.getElementById("vehicleSelection").style.display = "none";
  document.getElementById("bookingSection").style.display = "block";
}

// ---------- DELIVERY DROPDOWN ----------

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

function sendWhatsApp() {
  const name = document.getElementById("customerName").value.trim();const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  const quantity = document.getElementById("quantity").value;
  const zone = document.getElementById("deliveryZone").value;
  const total = document.getElementById("totalPrice").innerText;

  if (!name || !start || !end || !selectedVehicle) {
    alert("Please complete booking details first.");
    return;
  }

  const message = `
Hi Baja Wheels, I would like to rent ${quantity} ${selectedVehicle}(s) from: ${start}
to ${end} in ${zone} at MXN ${total}. Please confirm availability. Thanks, ${name} 
  `;

  const phoneNumber = "41797943212"; // ← Deine WhatsApp Nummer hier einsetzen

  const url =
    "https://wa.me/" +
    phoneNumber +
    "?text=" +
    encodeURIComponent(message);

  window.open(url, "_blank");
}
// ---------- INIT AFTER PAGE LOAD ----------

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
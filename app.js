/**
 * Dosis-Ya! - Lógica de Cálculo, Vademécum Pediátrico e Integración Firestore
 * Código didáctico comentado para estudiantes y docentes de enfermería.
 */

// Lista activa de medicamentos (inicialmente cargada desde el archivo local como respaldo)
let listaMedicamentosActiva = [...MEDICAMENTOS];
let medicamentoActual = null;

// Inicialización cuando carga la página
document.addEventListener("DOMContentLoaded", () => {
  // 1. Cargar interfaz con datos locales iniciales
  inicializarSelectorMedicamentos();
  inicializarVademecum();
  seleccionarMedicamentoPorId("paracetamol");
  calcularDosis();
  
  // 2. Intentar conectar a Firebase Firestore en segundo plano
  conectarFirestore();
});

/**
 * INTEGRACIÓN CON FIREBASE FIRESTORE
 * Lee los medicamentos de la nube. Si la colección está vacía, la inicializa automáticamente.
 */
async function conectarFirestore() {
  const badgeEstado = document.getElementById("firebase-status-badge");
  
  if (!db) {
    actualizarBadgeFirebase("local", "📱 Modo Local (Sin conexión a Firebase)");
    return;
  }
  
  actualizarBadgeFirebase("cargando", "⏳ Conectando con Firestore...");
  
  try {
    const snapshot = await db.collection("medicamentos").get();
    
    if (snapshot.empty) {
      console.log("Firestore vacío. Inicializando medicamentos en la nube...");
      actualizarBadgeFirebase("cargando", "⏳ Inicializando 12 medicamentos en Firestore...");
      
      const batch = db.batch();
      MEDICAMENTOS.forEach((med) => {
        const docRef = db.collection("medicamentos").doc(med.id);
        batch.set(docRef, med);
      });
      await batch.commit();
      
      listaMedicamentosActiva = [...MEDICAMENTOS];
      actualizarBadgeFirebase("online", `☁️ Firestore Conectado (${listaMedicamentosActiva.length} fármacos sincronizados)`);
    } else {
      const medicamentosNube = [];
      snapshot.forEach((doc) => {
        medicamentosNube.push(doc.data());
      });
      
      listaMedicamentosActiva = medicamentosNube;
      console.log(`Cargados ${listaMedicamentosActiva.length} medicamentos desde Firestore.`);
      actualizarBadgeFirebase("online", `☁️ Firestore Conectado (${listaMedicamentosActiva.length} fármacos en la nube)`);
    }
    
    // Refrescar selector y vademécum preservando selección actual si existe
    const medIdActual = medicamentoActual ? medicamentoActual.id : null;
    inicializarSelectorMedicamentos();
    renderizarTarjetasVademecum(listaMedicamentosActiva);
    if (medIdActual) {
      seleccionarMedicamentoPorId(medIdActual);
    }
    
  } catch (error) {
    console.warn("Aviso al consultar Firestore (usando respaldo local):", error);
    actualizarBadgeFirebase("local", "📱 Respaldo Local Activo (Firestore sin permisos o sin red)");
  }
}

function actualizarBadgeFirebase(estado, mensaje) {
  const badge = document.getElementById("firebase-status-badge");
  if (!badge) return;
  
  badge.textContent = mensaje;
  
  if (estado === "online") {
    badge.className = "px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-full flex items-center gap-1.5 shadow-sm";
  } else if (estado === "cargando") {
    badge.className = "px-3 py-1 bg-amber-50 text-amber-800 border border-amber-300 font-semibold text-xs rounded-full flex items-center gap-1.5 shadow-sm";
  } else {
    badge.className = "px-3 py-1 bg-surface-container text-on-surface-variant border border-outline-variant font-semibold text-xs rounded-full flex items-center gap-1.5 shadow-sm";
  }
}

/**
 * FUNCIÓN 1: Ingreso de peso y selección de medicamento
 */
function inicializarSelectorMedicamentos() {
  const select = document.getElementById("drug-select");
  if (!select) return;
  
  const valorAnterior = select.value;
  select.innerHTML = '<option value="" disabled selected>Seleccione un medicamento</option>';
  
  listaMedicamentosActiva.forEach((med) => {
    const option = document.createElement("option");
    option.value = med.id;
    option.textContent = `${med.nombre} (${med.formaFarmaceutica} ${med.concentracionTexto})`;
    if (valorAnterior && med.id === valorAnterior) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  
  select.onchange = (e) => {
    if (e.target.value) {
      seleccionarMedicamentoPorId(e.target.value);
    } else {
      limpiarEspecificacionesMedicamento();
      calcularDosis();
    }
  };
}

function seleccionarMedicamentoPorId(id) {
  if (!id) {
    limpiarEspecificacionesMedicamento();
    calcularDosis();
    return;
  }
  
  const med = listaMedicamentosActiva.find((m) => m.id === id);
  if (!med) return;
  medicamentoActual = med;
  
  // Sincronizar select
  const select = document.getElementById("drug-select");
  if (select && select.value !== med.id) {
    select.value = med.id;
  }
  
  // 1. Tarjeta de especificación
  const elConcentracion = document.getElementById("spec-concentration");
  const elEstandar = document.getElementById("spec-standard");
  const elMax = document.getElementById("spec-max");
  
  if (elConcentracion) {
    elConcentracion.textContent = `${med.concentracionTexto} (${med.mgPorMl} mg/ml)`;
  }
  if (elEstandar) {
    elEstandar.textContent = `${med.dosisMinMgKg} - ${med.dosisMaxMgKg} mg/kg/toma`;
  }
  if (elMax) {
    elMax.textContent = `Máx. ${med.dosisMaxMgKg} mg/kg/toma (Tope: ${med.dosisMaximaPorTomaMg} mg/toma)`;
  }
  
  // 2. Campo de dosis indicada por defecto
  const inputDoseTarget = document.getElementById("dose-target");
  const labelIndicator = document.getElementById("target-indicator");
  if (inputDoseTarget) {
    inputDoseTarget.value = med.dosisPorDefectoMgKg;
    inputDoseTarget.min = Math.max(0.01, (med.dosisMinMgKg * 0.5).toFixed(2));
    inputDoseTarget.max = (med.dosisMaxMgKg * 2).toFixed(2);
  }
  if (labelIndicator) {
    labelIndicator.textContent = `${med.dosisPorDefectoMgKg} mg/kg`;
  }
  
  // 3. Frecuencia horaria sugerida
  const selectFrecuencia = document.getElementById("frequency-select");
  if (selectFrecuencia && med.frecuenciaHoras) {
    selectFrecuencia.value = String(med.frecuenciaHoras);
  }
  
  // 4. Ficha rápida de referencia inferior
  const refName = document.getElementById("ref-name");
  const refIndication = document.getElementById("ref-indication");
  const refSource = document.getElementById("ref-source");
  const refBadge = document.getElementById("ref-category-badge");
  
  if (refName) refName.textContent = `${med.nombre} - ${med.concentracionTexto}`;
  if (refIndication) refIndication.textContent = med.indicaciones;
  if (refSource) refSource.textContent = `Fuente: ${med.fuenteOficial}`;
  if (refBadge) refBadge.textContent = med.categoria;
  
  calcularDosis();
}

function limpiarEspecificacionesMedicamento() {
  medicamentoActual = null;
  const select = document.getElementById("drug-select");
  if (select) select.value = "";
  
  const elConcentracion = document.getElementById("spec-concentration");
  const elEstandar = document.getElementById("spec-standard");
  const elMax = document.getElementById("spec-max");
  if (elConcentracion) elConcentracion.textContent = "--";
  if (elEstandar) elEstandar.textContent = "--";
  if (elMax) elMax.textContent = "--";
  
  const refName = document.getElementById("ref-name");
  const refIndication = document.getElementById("ref-indication");
  const refSource = document.getElementById("ref-source");
  const refBadge = document.getElementById("ref-category-badge");
  if (refName) refName.textContent = "--";
  if (refIndication) refIndication.textContent = "--";
  if (refSource) refSource.textContent = "Fuente: AEPED Pediamécum / Fichas Oficiales";
  if (refBadge) refBadge.textContent = "--";
}

function setWeight(peso) {
  const inputPeso = document.getElementById("patient-weight");
  if (!inputPeso) return;
  
  inputPeso.value = peso;
  
  const botonesRapidos = document.querySelectorAll(".btn-quick-weight");
  botonesRapidos.forEach((btn) => {
    const val = parseFloat(btn.dataset.weight);
    if (val === peso) {
      btn.className = "btn-quick-weight px-3 py-1 bg-primary text-on-primary border border-primary rounded font-semibold text-xs transition-colors";
    } else {
      btn.className = "btn-quick-weight px-3 py-1 bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded text-on-surface font-medium text-xs transition-colors";
    }
  });
  
  calcularDosis();
}

/**
 * FUNCIÓN 2 y 4: Cálculo de dosis en mg y ml + Alerta de dosis máxima
 */
function calcularDosis() {
  const inputPeso = document.getElementById("patient-weight");
  const inputDoseTarget = document.getElementById("dose-target");
  const selectFrecuencia = document.getElementById("frequency-select");
  const labelIndicator = document.getElementById("target-indicator");
  
  const pesoKg = parseFloat(inputPeso?.value) || 0;
  const dosisMgKg = parseFloat(inputDoseTarget?.value) || 0;
  const frecuenciaVal = selectFrecuencia?.value;
  const frecuenciaHoras = parseInt(frecuenciaVal) || 0;
  
  if (labelIndicator) {
    labelIndicator.textContent = dosisMgKg > 0 ? `${dosisMgKg} mg/kg` : "-- mg/kg";
  }
  
  // Si falta el medicamento, el peso, la dosis indicada o la frecuencia, se limpian los resultados
  if (!medicamentoActual || pesoKg <= 0 || dosisMgKg <= 0 || frecuenciaHoras <= 0) {
    mostrarResultadosEnCero();
    return;
  }
  
  // 1. Dosis en masa (mg) por cada toma
  const dosisMgPorToma = pesoKg * dosisMgKg;
  
  // 2. Pauta diaria
  const tomasAlDia = 24 / frecuenciaHoras;
  const dosisMgDiaria = dosisMgPorToma * tomasAlDia;
  
  // 3. Volumen líquido en ml = mg_dosis / mg_por_ml
  const dosisMlPorToma = dosisMgPorToma / medicamentoActual.mgPorMl;
  const dosisMlDiaria = dosisMlPorToma * tomasAlDia;
  
  // FUNCIÓN 4: Comprobación de límites toxicológicos
  const superaDosisMaxToma = dosisMgPorToma > medicamentoActual.dosisMaximaPorTomaMg;
  const superaDosisMaxKg = dosisMgKg > medicamentoActual.dosisMaxMgKg;
  const dosisMaximaDiariaPermitida = pesoKg * medicamentoActual.dosisMaximaDiariaMgKg;
  const superaDosisMaxDiaria = dosisMgDiaria > dosisMaximaDiariaPermitida;
  
  const hayPeligro = superaDosisMaxToma || superaDosisMaxKg || superaDosisMaxDiaria;
  
  // Renderizar valores
  const elResultMg = document.getElementById("resultMg");
  const elResultMgDaily = document.getElementById("resultMgDaily");
  const elResultMl = document.getElementById("resultMl");
  const elResultMlDaily = document.getElementById("resultMlDaily");
  
  const textoMgToma = dosisMgPorToma >= 10 ? Math.round(dosisMgPorToma) : dosisMgPorToma.toFixed(1);
  const textoMgDiario = dosisMgDiaria >= 10 ? Math.round(dosisMgDiaria) : dosisMgDiaria.toFixed(1);
  const textoMlToma = dosisMlPorToma >= 10 ? dosisMlPorToma.toFixed(1) : dosisMlPorToma.toFixed(2);
  const textoMlDiario = dosisMlDiaria >= 10 ? dosisMlDiaria.toFixed(1) : dosisMlDiaria.toFixed(2);
  
  if (elResultMg) elResultMg.textContent = textoMgToma;
  if (elResultMgDaily) elResultMgDaily.textContent = `${textoMgDiario} mg / día`;
  if (elResultMl) elResultMl.textContent = textoMlToma;
  if (elResultMlDaily) elResultMlDaily.textContent = `${textoMlDiario} ml / día`;
  
  actualizarJeringaVisual(dosisMlPorToma);
  
  actualizarDesgloseMatematico({
    pesoKg,
    dosisMgKg,
    dosisMgPorToma,
    mgPorMl: medicamentoActual.mgPorMl,
    dosisMlPorToma,
    concentracionTexto: medicamentoActual.concentracionTexto,
    tomasAlDia,
    frecuenciaHoras
  });
  
  actualizarEstadoAlerta({
    hayPeligro,
    superaDosisMaxToma,
    superaDosisMaxKg,
    superaDosisMaxDiaria,
    dosisMgPorToma,
    dosisMaximaPorTomaMg: medicamentoActual.dosisMaximaPorTomaMg,
    dosisMgKg,
    dosisMaxMgKg: medicamentoActual.dosisMaxMgKg
  });
}

function actualizarJeringaVisual(ml) {
  const bar = document.getElementById("syringeFluidBar");
  const fillText = document.getElementById("syringeFillText");
  const gaugeLabel = document.getElementById("gaugeLabel");
  
  if (!bar) return;
  
  const maxCapacidadMl = 10;
  const porcentaje = Math.min(100, Math.max(5, (ml / maxCapacidadMl) * 100));
  
  bar.style.width = `${porcentaje}%`;
  if (fillText) fillText.textContent = `${ml.toFixed(1)} ml`;
  if (gaugeLabel) {
    if (ml > maxCapacidadMl) {
      gaugeLabel.textContent = `${ml.toFixed(2)} mL (Requiere repartir en más de una jeringa de 10 mL)`;
      gaugeLabel.className = "font-bold text-error";
    } else {
      gaugeLabel.textContent = `${ml.toFixed(2)} mL (Jeringa dosificadora oral de 10 mL)`;
      gaugeLabel.className = "font-bold text-primary";
    }
  }
}

function actualizarDesgloseMatematico(datos) {
  const elFormula1 = document.getElementById("math-step-1");
  const elFormula2 = document.getElementById("math-step-2");
  const elFormula3 = document.getElementById("math-step-3");
  
  if (elFormula1) {
    elFormula1.innerHTML = `<strong>Paso 1 (Masa en mg):</strong> ${datos.pesoKg} kg × ${datos.dosisMgKg} mg/kg = <strong class="text-primary">${datos.dosisMgPorToma.toFixed(1)} mg por toma</strong>`;
  }
  if (elFormula2) {
    elFormula2.innerHTML = `<strong>Paso 2 (Volumen en ml):</strong> ${datos.dosisMgPorToma.toFixed(1)} mg ÷ ${datos.mgPorMl} mg/ml (${datos.concentracionTexto}) = <strong class="text-primary">${datos.dosisMlPorToma.toFixed(2)} ml</strong>`;
  }
  if (elFormula3) {
    elFormula3.innerHTML = `<strong>Paso 3 (Pauta diaria):</strong> Cada ${datos.frecuenciaHoras} horas (${datos.tomasAlDia} tomas en 24 h). Total: <strong>${(datos.dosisMlPorToma * datos.tomasAlDia).toFixed(2)} ml al día</strong>`;
  }
}

function actualizarEstadoAlerta(alerta) {
  const alertContainer = document.getElementById("clinicalAlertBanner");
  const badgeStatus = document.getElementById("badgeStatus");
  const alertText = document.getElementById("clinicalAlertText");
  const resultsCard = document.getElementById("resultsCard");
  
  if (!alertContainer || !badgeStatus) return;
  
  if (alerta.hayPeligro) {
    alertContainer.classList.remove("hidden");
    
    let motivo = "La dosis calculada supera el rango de seguridad recomendado.";
    if (alerta.superaDosisMaxToma) {
      motivo = `La dosis calculada (${alerta.dosisMgPorToma.toFixed(1)} mg) rebasa el TOPE MÁXIMO ABSOLUTO de ${alerta.dosisMaximaPorTomaMg} mg por toma para este medicamento.`;
    } else if (alerta.superaDosisMaxKg) {
      motivo = `La dosificación indicada (${alerta.dosisMgKg} mg/kg) supera la dosis máxima recomendada por ficha técnica (${alerta.dosisMaxMgKg} mg/kg/toma).`;
    }
    
    if (alertText) alertText.textContent = motivo;
    
    badgeStatus.className = "font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 bg-red-100 text-red-800 border border-red-300";
    badgeStatus.innerHTML = `<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">warning</span> Dosis Máxima Superada`;
    
    if (resultsCard) {
      resultsCard.classList.remove("border-outline-variant");
      resultsCard.classList.add("border-red-400", "ring-2", "ring-red-200");
    }
  } else {
    alertContainer.classList.add("hidden");
    
    badgeStatus.className = "font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300";
    badgeStatus.innerHTML = `<span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">check_circle</span> Dosis Verificada Segura`;
    
    if (resultsCard) {
      resultsCard.classList.remove("border-red-400", "ring-2", "ring-red-200");
      resultsCard.classList.add("border-outline-variant");
    }
  }
}

// Limpia resultados y restablece mensajes informativos sin alterar la capacidad de alerta futura
function mostrarResultadosEnCero() {
  const elResultMg = document.getElementById("resultMg");
  const elResultMgDaily = document.getElementById("resultMgDaily");
  const elResultMl = document.getElementById("resultMl");
  const elResultMlDaily = document.getElementById("resultMlDaily");
  const gaugeLabel = document.getElementById("gaugeLabel");
  const bar = document.getElementById("syringeFluidBar");
  const fillText = document.getElementById("syringeFillText");
  const badgeStatus = document.getElementById("badgeStatus");
  const alertContainer = document.getElementById("clinicalAlertBanner");
  const resultsCard = document.getElementById("resultsCard");
  
  if (elResultMg) elResultMg.textContent = "--";
  if (elResultMgDaily) elResultMgDaily.textContent = "-- mg / día";
  if (elResultMl) elResultMl.textContent = "--";
  if (elResultMlDaily) elResultMlDaily.textContent = "-- ml / día";
  if (gaugeLabel) {
    gaugeLabel.textContent = "-- mL";
    gaugeLabel.className = "font-bold text-on-surface-variant";
  }
  if (bar) bar.style.width = "0%";
  if (fillText) fillText.textContent = "0 ml";
  
  // Limpieza didáctica del desglose matemático
  const elFormula1 = document.getElementById("math-step-1");
  const elFormula2 = document.getElementById("math-step-2");
  const elFormula3 = document.getElementById("math-step-3");
  if (elFormula1) elFormula1.innerHTML = "<strong>Paso 1:</strong> Ingrese el peso y seleccione un medicamento.";
  if (elFormula2) elFormula2.innerHTML = "<strong>Paso 2:</strong> Ingrese la dosis y frecuencia indicadas.";
  if (elFormula3) elFormula3.innerHTML = "<strong>Paso 3:</strong> El cálculo y volumen aparecerán aquí.";
  
  // Ocultar alerta anterior y regresar badge a estado neutral
  if (alertContainer) alertContainer.classList.add("hidden");
  if (resultsCard) {
    resultsCard.classList.remove("border-red-400", "ring-2", "ring-red-200");
    resultsCard.classList.add("border-outline-variant");
  }
  if (badgeStatus) {
    badgeStatus.className = "font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 bg-surface-container text-on-surface-variant border border-outline-variant";
    badgeStatus.innerHTML = `<span class="material-symbols-outlined text-sm">hourglass_empty</span><span>En espera de parámetros</span>`;
  }
}

/**
 * FUNCIÓN 3: Buscador y Fichas / Vademécum
 */
function inicializarVademecum() {
  const container = document.getElementById("vademecum-cards-container");
  const searchInput = document.getElementById("vademecum-search");
  
  if (!container) return;
  
  renderizarTarjetasVademecum(listaMedicamentosActiva);
  
  if (searchInput) {
    searchInput.oninput = (e) => {
      const termino = e.target.value.toLowerCase().trim();
      const filtrados = listaMedicamentosActiva.filter((med) => {
        return (
          med.nombre.toLowerCase().includes(termino) ||
          med.categoria.toLowerCase().includes(termino) ||
          med.indicaciones.toLowerCase().includes(termino) ||
          med.concentracionTexto.toLowerCase().includes(termino)
        );
      });
      renderizarTarjetasVademecum(filtrados);
    };
  }
}

function renderizarTarjetasVademecum(lista) {
  const container = document.getElementById("vademecum-cards-container");
  const countBadge = document.getElementById("vademecum-count-badge");
  
  if (!container) return;
  container.innerHTML = "";
  
  if (countBadge) {
    countBadge.textContent = `${lista.length} medicamentos`;
  }
  
  if (lista.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-on-surface-variant">
        <span class="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
        <p class="font-semibold text-body-lg">No se encontraron medicamentos</p>
        <p class="text-body-sm text-outline">Intenta con otro término (ej. "Paracetamol", "Antibiótico", "Gotas")</p>
      </div>
    `;
    return;
  }
  
  lista.forEach((med) => {
    const card = document.createElement("div");
    card.className = "bg-surface-container-lowest border border-outline-variant hover:border-primary rounded-xl p-4 shadow-sm transition-all flex flex-col justify-between gap-3";
    card.innerHTML = `
      <div>
        <div class="flex items-start justify-between gap-2 border-b border-outline-variant pb-2">
          <div>
            <h3 class="font-bold text-headline-sm text-on-surface">${med.nombre}</h3>
            <span class="text-xs font-semibold text-primary block mt-0.5">${med.formaFarmaceutica} • ${med.concentracionTexto}</span>
          </div>
          <span class="px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant shrink-0">
            ${med.categoria}
          </span>
        </div>
        
        <div class="mt-2 text-xs space-y-1.5">
          <div>
            <strong class="text-on-surface-variant">Uso clínico:</strong>
            <p class="text-on-surface text-body-sm leading-snug mt-0.5">${med.indicaciones}</p>
          </div>
          
          <div class="grid grid-cols-2 gap-2 pt-2 border-t border-outline-variant">
            <div class="bg-surface-container-low p-2 rounded">
              <span class="text-on-surface-variant block text-[11px]">Dosis habitual:</span>
              <strong class="text-on-surface">${med.dosisMinMgKg} - ${med.dosisMaxMgKg} mg/kg/toma</strong>
            </div>
            <div class="bg-surface-container-low p-2 rounded">
              <span class="text-on-surface-variant block text-[11px]">Límite por toma:</span>
              <strong class="text-error">Máx ${med.dosisMaximaPorTomaMg} mg</strong>
            </div>
          </div>
          
          <div class="pt-2 text-[11px] text-on-surface-variant">
            <span class="font-semibold text-primary">Fuente:</span> ${med.fuenteOficial}
          </div>
        </div>
      </div>
      
      <button 
        onclick="seleccionarDesdeVademecum('${med.id}')"
        class="w-full mt-2 py-1.5 px-3 bg-surface-container hover:bg-primary hover:text-on-primary text-primary font-semibold text-xs rounded-lg border border-outline-variant transition-colors flex items-center justify-center gap-1 cursor-pointer"
        type="button"
      >
        <span class="material-symbols-outlined text-sm">calculate</span>
        <span>Calcular dosis con este fármaco</span>
      </button>
    `;
    container.appendChild(card);
  });
}

function seleccionarDesdeVademecum(medId) {
  cambiarPestana("calculadora");
  seleccionarMedicamentoPorId(medId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function cambiarPestana(pestana) {
  const seccionCalc = document.getElementById("seccion-calculadora");
  const seccionVademecum = document.getElementById("seccion-vademecum");
  const tabCalc = document.getElementById("tab-link-calculadora");
  const tabVademecum = document.getElementById("tab-link-vademecum");
  
  if (pestana === "calculadora") {
    seccionCalc?.classList.remove("hidden");
    seccionVademecum?.classList.add("hidden");
    
    tabCalc?.classList.add("border-primary", "text-primary");
    tabCalc?.classList.remove("text-on-surface-variant");
    
    tabVademecum?.classList.remove("border-primary", "text-primary");
    tabVademecum?.classList.add("text-on-surface-variant");
  } else {
    seccionCalc?.classList.add("hidden");
    seccionVademecum?.classList.remove("hidden");
    
    tabVademecum?.classList.add("border-primary", "text-primary");
    tabVademecum?.classList.remove("text-on-surface-variant");
    
    tabCalc?.classList.remove("border-primary", "text-primary");
    tabCalc?.classList.add("text-on-surface-variant");
  }
}

/**
 * MODIFICACIÓN SOLICITADA: Ajustes al Botón «Restablecer»
 * 1. Peso del paciente: queda vacío.
 * 2. Medicamento: muestra «Seleccione un medicamento».
 * 3. Dosis indicada: queda vacía.
 * 4. Frecuencia de toma: muestra «Seleccione la frecuencia».
 * 5. Resultados: desaparecen los cálculos anteriores en mg y ml.
 * 6. Alertas: se limpian los mensajes de alerta anteriores y se conservan para los próximos cálculos.
 */
function resetForm() {
  // 1. Peso del paciente: queda vacío
  const inputPeso = document.getElementById("patient-weight");
  if (inputPeso) inputPeso.value = "";
  
  // Desmarcar todos los botones rápidos de peso
  const botonesRapidos = document.querySelectorAll(".btn-quick-weight");
  botonesRapidos.forEach((btn) => {
    btn.className = "btn-quick-weight px-3 py-1 bg-surface-container-low hover:bg-surface-container border border-outline-variant rounded text-on-surface font-medium text-xs transition-colors";
  });
  
  // 2. Medicamento: muestra «Seleccione un medicamento»
  limpiarEspecificacionesMedicamento();
  
  // 3. Dosis indicada: queda vacía
  const inputDoseTarget = document.getElementById("dose-target");
  const labelIndicator = document.getElementById("target-indicator");
  if (inputDoseTarget) inputDoseTarget.value = "";
  if (labelIndicator) labelIndicator.textContent = "-- mg/kg";
  
  // 4. Frecuencia de toma: muestra «Seleccione la frecuencia»
  const selectFrecuencia = document.getElementById("frequency-select");
  if (selectFrecuencia) selectFrecuencia.value = "";
  
  // 5 y 6. Resultados y Alertas: se limpian resultados y alertas anteriores
  mostrarResultadosEnCero();
}

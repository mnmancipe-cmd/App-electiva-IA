/**
 * Base de Datos Estática de Medicamentos Pediátricos - Dosis-Ya!
 * 
 * Todos los datos están extraídos directamente de fichas técnicas oficiales:
 * - AEPED (Asociación Española de Pediatría - Pediamécum)
 * - Fichas técnicas oficiales AEMPS (Agencia Española de Medicamentos y Productos Sanitarios)
 * 
 * Regla: No inventar dosis. Datos estrictamente validados.
 */

const MEDICAMENTOS = [
  {
    id: "paracetamol",
    nombre: "Paracetamol",
    formaFarmaceutica: "Jarabe / Solución oral",
    concentracionTexto: "120 mg / 5 ml",
    concentracionMg: 120,
    concentracionMl: 5,
    mgPorMl: 24, // 120 / 5 = 24 mg/ml
    dosisMinMgKg: 10,
    dosisMaxMgKg: 15,
    dosisPorDefectoMgKg: 15,
    dosisMaximaPorTomaMg: 1000, // Máximo 1 g por toma en niños mayores
    dosisMaximaDiariaMgKg: 60,  // Máx 60 mg/kg/día
    frecuenciaHoras: 6,
    frecuenciaTexto: "Cada 6 a 8 horas (máximo 4 tomas al día)",
    categoria: "Antipirético / Analgésico",
    indicaciones: "Tratamiento sintomático de la fiebre y dolor leve a moderado en lactantes y niños.",
    fuenteOficial: "AEPED Pediamécum (Ed. 2024) / Ficha técnica AEMPS"
  },
  {
    id: "ibuprofeno",
    nombre: "Ibuprofeno",
    formaFarmaceutica: "Suspensión oral",
    concentracionTexto: "100 mg / 5 ml",
    concentracionMg: 100,
    concentracionMl: 5,
    mgPorMl: 20, // 100 / 5 = 20 mg/ml
    dosisMinMgKg: 5,
    dosisMaxMgKg: 10,
    dosisPorDefectoMgKg: 10,
    dosisMaximaPorTomaMg: 400, // Máximo 400 mg por toma
    dosisMaximaDiariaMgKg: 40,  // Máx 40 mg/kg/día
    frecuenciaHoras: 8,
    frecuenciaTexto: "Cada 6 a 8 horas (administrar con alimentos)",
    categoria: "AINE / Antipirético / Antiinflamatorio",
    indicaciones: "Alivio sintomático del dolor leve a moderado, cuadros inflamatorios y fiebre.",
    fuenteOficial: "AEPED Pediamécum / Ficha técnica AEMPS"
  },
  {
    id: "amoxicilina",
    nombre: "Amoxicilina",
    formaFarmaceutica: "Suspensión oral",
    concentracionTexto: "250 mg / 5 ml",
    concentracionMg: 250,
    concentracionMl: 5,
    mgPorMl: 50, // 250 / 5 = 50 mg/ml
    dosisMinMgKg: 15,
    dosisMaxMgKg: 30, // por toma cada 8h (40-90 mg/kg/día)
    dosisPorDefectoMgKg: 25,
    dosisMaximaPorTomaMg: 1000, // 1 g por toma
    dosisMaximaDiariaMgKg: 90,  // 90 mg/kg/día en otitis media aguda
    frecuenciaHoras: 8,
    frecuenciaTexto: "Cada 8 horas",
    categoria: "Antibiótico Betalactámico",
    indicaciones: "Infecciones bacterianas del tracto respiratorio superior e inferior (faringoamigdalitis, OMA, neumonía).",
    fuenteOficial: "AEPED Pediamécum / Guía de Terapéutica Antimicrobiana"
  },
  {
    id: "amoxicilina_clavulanico",
    nombre: "Amoxicilina + Ácido Clavulánico",
    formaFarmaceutica: "Suspensión oral",
    concentracionTexto: "250 mg / 62.5 mg en 5 ml",
    concentracionMg: 250,
    concentracionMl: 5,
    mgPorMl: 50, // Calculado sobre el componente de amoxicilina
    dosisMinMgKg: 15,
    dosisMaxMgKg: 30,
    dosisPorDefectoMgKg: 20,
    dosisMaximaPorTomaMg: 1000,
    dosisMaximaDiariaMgKg: 80,
    frecuenciaHoras: 8,
    frecuenciaTexto: "Cada 8 horas con las comidas para reducir intolerancia digestiva",
    categoria: "Antibiótico con inhibidor de betalactamasas",
    indicaciones: "Infecciones recurrentes o resistentes: sinusitis bacteriana aguda, mordeduras, OMA complicada.",
    fuenteOficial: "AEPED Pediamécum / Ficha AEMPS"
  },
  {
    id: "azitromicina",
    nombre: "Azitromicina",
    formaFarmaceutica: "Suspensión oral",
    concentracionTexto: "200 mg / 5 ml",
    concentracionMg: 200,
    concentracionMl: 5,
    mgPorMl: 40, // 200 / 5 = 40 mg/ml
    dosisMinMgKg: 10,
    dosisMaxMgKg: 10,
    dosisPorDefectoMgKg: 10,
    dosisMaximaPorTomaMg: 500, // 500 mg dosis máxima diaria única
    dosisMaximaDiariaMgKg: 10,
    frecuenciaHoras: 24,
    frecuenciaTexto: "Cada 24 horas (dosis única diaria) por 3 a 5 días",
    categoria: "Antibiótico Macrólido",
    indicaciones: "Neumonía atípica, infecciones respiratorias, faringitis en alérgicos a penicilinas.",
    fuenteOficial: "AEPED Pediamécum / Ficha técnica AEMPS"
  },
  {
    id: "cefalexina",
    nombre: "Cefalexina",
    formaFarmaceutica: "Suspensión oral",
    concentracionTexto: "250 mg / 5 ml",
    concentracionMg: 250,
    concentracionMl: 5,
    mgPorMl: 50,
    dosisMinMgKg: 8,
    dosisMaxMgKg: 15,
    dosisPorDefectoMgKg: 12.5,
    dosisMaximaPorTomaMg: 1000,
    dosisMaximaDiariaMgKg: 50, // hasta 100 mg/kg/día en infecciones graves
    frecuenciaHoras: 6,
    frecuenciaTexto: "Cada 6 horas",
    categoria: "Cefalosporina de 1ª generación",
    indicaciones: "Infecciones de piel y tejidos blandos (impétigo, celulitis), infecciones urinarias no complicadas.",
    fuenteOficial: "AEPED Pediamécum"
  },
  {
    id: "dipirona",
    nombre: "Dipirona / Metamizol",
    formaFarmaceutica: "Gotas orales",
    concentracionTexto: "500 mg / 1 ml",
    concentracionMg: 500,
    concentracionMl: 1,
    mgPorMl: 500,
    dosisMinMgKg: 10,
    dosisMaxMgKg: 15,
    dosisPorDefectoMgKg: 12,
    dosisMaximaPorTomaMg: 1000,
    dosisMaximaDiariaMgKg: 40,
    frecuenciaHoras: 8,
    frecuenciaTexto: "Cada 6 a 8 horas",
    categoria: "Analgésico / Antipirético",
    indicaciones: "Dolor agudo moderado a intenso y fiebre refractaria que no responde a otras medidas.",
    fuenteOficial: "Ficha Técnica AEMPS / Guía Pediátrica de Urgencias"
  },
  {
    id: "salbutamol",
    nombre: "Salbutamol",
    formaFarmaceutica: "Jarabe oral",
    concentracionTexto: "2 mg / 5 ml",
    concentracionMg: 2,
    concentracionMl: 5,
    mgPorMl: 0.4, // 2 / 5 = 0.4 mg/ml
    dosisMinMgKg: 0.1,
    dosisMaxMgKg: 0.15,
    dosisPorDefectoMgKg: 0.12,
    dosisMaximaPorTomaMg: 4, // 4 mg por toma
    dosisMaximaDiariaMgKg: 0.4,
    frecuenciaHoras: 8,
    frecuenciaTexto: "Cada 8 horas",
    categoria: "Broncodilatador Beta-2 agonista",
    indicaciones: "Alivio del broncoespasmo en asma o bronquitis obstructiva cuando la vía inhalada no es viable.",
    fuenteOficial: "AEPED Pediamécum / Ficha técnica AEMPS"
  },
  {
    id: "loratadina",
    nombre: "Loratadina",
    formaFarmaceutica: "Jarabe oral",
    concentracionTexto: "5 mg / 5 ml",
    concentracionMg: 5,
    concentracionMl: 5,
    mgPorMl: 1, // 5 / 5 = 1 mg/ml
    dosisMinMgKg: 0.2,
    dosisMaxMgKg: 0.2,
    dosisPorDefectoMgKg: 0.2,
    dosisMaximaPorTomaMg: 10, // 5 mg si <30kg, 10 mg si >30kg
    dosisMaximaDiariaMgKg: 0.2,
    frecuenciaHoras: 24,
    frecuenciaTexto: "Cada 24 horas (dosis única diaria)",
    categoria: "Antihistamínico H1 no sedante",
    indicaciones: "Rinitis alérgica estacional y urticaria idiopática crónica en niños mayores de 2 años.",
    fuenteOficial: "AEPED Pediamécum / FDA Pediatric Guidelines"
  },
  {
    id: "cetirizina",
    nombre: "Cetirizina",
    formaFarmaceutica: "Solución oral",
    concentracionTexto: "5 mg / 5 ml",
    concentracionMg: 5,
    concentracionMl: 5,
    mgPorMl: 1,
    dosisMinMgKg: 0.25,
    dosisMaxMgKg: 0.25,
    dosisPorDefectoMgKg: 0.25,
    dosisMaximaPorTomaMg: 10,
    dosisMaximaDiariaMgKg: 0.5,
    frecuenciaHoras: 12,
    frecuenciaTexto: "Cada 12 o 24 horas según edad del paciente",
    categoria: "Antihistamínico H1 de segunda generación",
    indicaciones: "Alivio de síntomas nasales y oculares de rinitis alérgica y urticaria en niños > 2 años.",
    fuenteOficial: "AEPED Pediamécum"
  },
  {
    id: "prednisolona",
    nombre: "Prednisolona",
    formaFarmaceutica: "Solución oral",
    concentracionTexto: "15 mg / 5 ml",
    concentracionMg: 15,
    concentracionMl: 5,
    mgPorMl: 3, // 15 / 5 = 3 mg/ml
    dosisMinMgKg: 1,
    dosisMaxMgKg: 2,
    dosisPorDefectoMgKg: 1,
    dosisMaximaPorTomaMg: 60, // 60 mg máximo diario
    dosisMaximaDiariaMgKg: 2,
    frecuenciaHoras: 24,
    frecuenciaTexto: "Cada 24 horas por la mañana con desayuno (durante 3 a 5 días)",
    categoria: "Corticoide sistémico",
    indicaciones: "Crisis asmática moderada a severa, laringitis estridulosa (crup), procesos alérgicos agudos.",
    fuenteOficial: "AEPED Pediamécum / GINA Guidelines"
  },
  {
    id: "trimetoprima_sulfametoxazol",
    nombre: "Trimetoprima + Sulfametoxazol",
    formaFarmaceutica: "Suspensión oral",
    concentracionTexto: "40 mg TMP + 200 mg SMX en 5 ml",
    concentracionMg: 40,
    concentracionMl: 5,
    mgPorMl: 8, // Basado en 8 mg/ml de TMP
    dosisMinMgKg: 4,
    dosisMaxMgKg: 5, // por toma cada 12h (8-10 mg TMP/kg/día)
    dosisPorDefectoMgKg: 4,
    dosisMaximaPorTomaMg: 160, // 160 mg de TMP por toma
    dosisMaximaDiariaMgKg: 10,
    frecuenciaHoras: 12,
    frecuenciaTexto: "Cada 12 horas",
    categoria: "Antibacteriano Sulfamida + Diaminopirimidina",
    indicaciones: "Infecciones del tracto urinario, otitis media recurrente por patógenos susceptibles.",
    fuenteOficial: "AEPED Pediamécum / Ficha técnica AEMPS"
  }
];

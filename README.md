# Dosis-Ya! - Calculadora de Dosis Pediátricas para Enfermería

Aplicación web desarrollada como apoyo académico y de verificación rápida para estudiantes de enfermería durante sus prácticas clínicas en áreas de pediatría y urgencias.

---

## 🎯 Objetivo y Problema Resuelto
Calcular con rapidez y precisión la dosificación por peso (mg/kg) y la conversión a volumen en jarabes o suspensiones orales (ml), reduciendo el riesgo de errores en turnos clínicos.

---

## ☁️ Base de Datos en la Nube (Firebase Firestore)
- **Proyecto Firebase:** `dosis-ya-pediatria`
- **Colección:** `medicamentos`
- **Arquitectura Resiliente Híbrida:** 
  - La aplicación consulta los medicamentos directamente desde Google Cloud Firestore.
  - En caso de pérdida de conexión (por ejemplo, en sótanos de urgencias u hospitales sin señal), la aplicación activa de inmediato el respaldo de fichas técnicas locales para garantizar disponibilidad 24/7.
  - Inicialización automática: Los 12 fármacos estándar se sincronizan con la nube sin necesidad de subirlos manualmente.

---

## ✨ Funcionalidades (PRD)

1. **Ingreso de peso y selección de medicamento**:
   - Botones rápidos de peso pediátrico común (5 kg, 10 kg, 12.5 kg, 15 kg, 20 kg, 25 kg).
   - Menú desplegable con medicamentos pediátricos comunes de fichas técnicas oficiales.
2. **Cálculo automático en mg y en ml**:
   - Visualización clara de la dosis por toma y total diario.
   - Desglose matemático paso a paso para el aprendizaje del estudiante.
   - Simulación visual de jeringa dosificadora oral graduada.
3. **Vademécum y Fichas Técnicas**:
   - Buscador rápido por nombre, categoría o síntoma/indicación.
   - Detalle de concentraciones, dosis recomendadas y fuentes médicas oficiales (AEPED / AEMPS).
   - Botón directo para calcular con el fármaco consultado.
4. **Alerta de Dosis Máxima Superada**:
   - Detección inmediata en tiempo real si la dosis por toma o por kilo excede el límite toxicológico de seguridad.

---

## 🛡️ Políticas de Privacidad y Alcance
- **Sin cuentas ni login de pacientes**: Funciona sin solicitar datos personales.
- **Sin recopilación de datos clínicos de pacientes**: Respeto total a la confidencialidad médica.
- **Apoyo pedagógico**: No prescribe ni sustituye el criterio médico ni el vademécum oficial.

---

## 📚 Fuentes Bibliográficas
- **AEPED**: Asociación Española de Pediatría - Guía Pediamécum.
- **AEMPS**: Agencia Española de Medicamentos y Productos Sanitarios - Centro de Información de Medicamentos.

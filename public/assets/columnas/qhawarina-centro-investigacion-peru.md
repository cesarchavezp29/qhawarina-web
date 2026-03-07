---
title: "Qhawarina: datos económicos de alta frecuencia para el Perú"
date: 2026-03-07
author: Carlos César Chávez Padilla
tags: [qhawarina, lanzamiento, metodología]
---

Qhawarina es un centro de investigación dedicado a la producción de datos económicos de alta frecuencia para el Perú. Combinando web scraping de supermercados, modelos econométricos y procesamiento de lenguaje natural, producimos indicadores diarios de inflación, riesgo político, crecimiento del PBI y pobreza monetaria.

## ¿Por qué alta frecuencia?

Las estadísticas oficiales en el Perú tienen rezagos importantes. El INEI publica el IPC mensualmente y el PBI trimestral con un rezago de 45 días. Las tasas de pobreza se conocen una vez al año, con datos que corresponden al año anterior. Esto genera una brecha de información que afecta a periodistas, analistas, empresas e instituciones que necesitan tomar decisiones en tiempo real.

Qhawarina cierra esa brecha con tres herramientas:

- **Índice BPP diario**: precios de 42,000+ productos en Plaza Vea, Metro y Wong, construidos con la metodología del Billion Prices Project (Alberto Cavallo, MIT). Disponible cada mañana.
- **Nowcast del PBI**: modelo DFM (Dynamic Factor Model) que combina 58 series económicas de BCRP, INEI y MIDAGRI para estimar el crecimiento trimestral en tiempo real.
- **Índice de riesgo político**: clasificación diaria de 65+ artículos de 11 fuentes de noticias usando Claude Haiku de Anthropic.

## Metodología abierta

Toda la metodología está documentada en [/metodologia](/metodologia). Los datos están disponibles bajo licencia CC BY 4.0 en [/datos](/datos). El código está en GitHub.

No somos una caja negra. Si hay un error en nuestros modelos, queremos que lo encuentren.

## Para qué usar Qhawarina

- **Periodistas**: referencia cuantitativa para artículos sobre precios, crecimiento o pobreza
- **Investigadores**: panel mensual de 58 series económicas en formato largo
- **Empresas**: nowcast de PBI e inflación para planificación
- **Instituciones públicas**: alertas tempranas de riesgo político y presiones de precios

---

*Carlos César Chávez Padilla es director de Qhawarina, centro de investigación en datos económicos de alta frecuencia para el Perú.*

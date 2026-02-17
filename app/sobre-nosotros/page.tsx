export default function SobreNosotrosPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sobre <span className="text-blue-700">Qhawarina</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Democratizando el acceso a información económica en tiempo real para todos los peruanos
          </p>
        </div>

        {/* Origin Story */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-3xl mr-3">🌱</span>
            ¿Cómo nació Qhawarina?
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            <strong>Qhawarina</strong> nace de una pregunta simple pero poderosa: <em>¿Por qué los peruanos tenemos que
            esperar semanas o meses para saber cómo va nuestra economía?</em>
          </p>
          <p className="text-gray-700 mb-4 leading-relaxed">
            En 2024, mientras analistas de bancos de inversión y organismos internacionales tenían acceso a modelos
            sofisticados de nowcasting económico, el peruano promedio —el emprendedor en Gamarra, la agricultora en
            Ayacucho, el estudiante planeando su futuro— navegaba con información desactualizada.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Creemos que la información económica es un bien público. <strong>Qhawarina</strong> existe para nivelar
            el campo de juego: usar la misma tecnología que emplean los grandes fondos de inversión, pero ponerla
            al servicio de todos, gratuitamente, con transparencia total.
          </p>
        </div>

        {/* What does Qhawarina mean */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-3xl mr-3">🇵🇪</span>
            ¿Qué significa "Qhawarina"?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-700 mb-3 leading-relaxed">
                <strong className="text-blue-700">Qhawarina</strong> proviene del quechua <em>"qhaway"</em> (mirar, observar)
                con el sufijo <em>"-rina"</em> (instrumento para). Literalmente: <strong>"instrumento para mirar"</strong> o
                <strong>"lugar desde donde se observa"</strong>.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Como el <em>qhawarina</em> tradicional —un mirador en las alturas desde donde se vigila el territorio—,
                nuestro proyecto ofrece una vista panorámica, anticipada y clara de la economía peruana.
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-lg p-6 border border-yellow-200">
              <div className="text-center">
                <div className="text-6xl mb-3">🏔️</div>
                <p className="text-sm text-gray-700 italic">
                  "Desde las alturas de los Andes, los antiguos peruanos observaban el territorio para anticipar
                  las cosechas, el clima, los movimientos. Hoy, desde nuestro qhawarina digital, observamos
                  la economía para anticipar tendencias antes de que lleguen."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-3xl mr-3">🎯</span>
              Nuestra Misión
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Proveer nowcasting económico de clase mundial para Perú, <strong>abierto y gratuito</strong>,
              con la misma rigurosidad técnica que los modelos privados pero con transparencia total.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Empoderar a ciudadanos, emprendedores, investigadores y tomadores de decisión con información
              económica <strong>oportuna, precisa y accesible</strong>.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="text-3xl mr-3">🌟</span>
              Nuestra Visión
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Convertirnos en la fuente de referencia para nowcasting económico en Perú, expandiendo cobertura a:
            </p>
            <ul className="text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>PBI sectorial (construcción, manufactura, servicios)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Empleo formal y mercado laboral</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span>Indicadores provinciales/distritales</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Who uses it / Impact */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">👥</span>
            ¿Quién usa Qhawarina?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2">Investigadores</h3>
              <p className="text-sm text-gray-600">
                Estudiantes y académicos analizando la economía peruana con datos de alta frecuencia
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-semibold text-gray-900 mb-2">Empresarios</h3>
              <p className="text-sm text-gray-600">
                Emprendedores y gerentes tomando decisiones informadas sobre inversión y expansión
              </p>
            </div>
            <div className="text-center p-4">
              <div className="text-4xl mb-3">📰</div>
              <h3 className="font-semibold text-gray-900 mb-2">Periodistas</h3>
              <p className="text-sm text-gray-600">
                Medios reportando tendencias económicas con datos actualizados y verificables
              </p>
            </div>
          </div>
        </div>

        {/* Principles */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="text-3xl mr-3">⚡</span>
            Nuestros Principios
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <span className="text-2xl mr-3">🔓</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">100% Abierto</h3>
                <p className="text-sm text-gray-700">
                  Código fuente público, datos descargables, metodología transparente. Sin paywalls ni suscripciones.
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-green-50 rounded-lg">
              <span className="text-2xl mr-3">🔬</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Rigor Científico</h3>
                <p className="text-sm text-gray-700">
                  Validación histórica, backtesting riguroso, comparación contra benchmarks, referencias académicas.
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-purple-50 rounded-lg">
              <span className="text-2xl mr-3">⚖️</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Independencia</h3>
                <p className="text-sm text-gray-700">
                  Sin afiliación política o comercial. Los datos hablan, nosotros solo los interpretamos.
                </p>
              </div>
            </div>
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <span className="text-2xl mr-3">🤝</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Colaborativo</h3>
                <p className="text-sm text-gray-700">
                  Abierto a contribuciones, mejoras y feedback de la comunidad. Construido con y para peruanos.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-3xl mr-3">🛠️</span>
            Tecnología y Fuentes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Modelos & Herramientas</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  <strong>Dynamic Factor Models (DFM)</strong> - statsmodels, scikit-learn
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  <strong>Machine Learning</strong> - Gradient Boosting, Ridge Regression
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  <strong>NLP</strong> - BERT multilingual, zero-shot classification
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  <strong>Satelital</strong> - NOAA-VIIRS nighttime lights
                </li>
                <li className="flex items-center">
                  <span className="text-blue-600 mr-2">▸</span>
                  <strong>Web Scraping</strong> - Beautiful Soup, Selenium, RSS parsing
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Fuentes de Datos</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>BCRP</strong> - Series monetarias, comercio, producción
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>INEI</strong> - PBI trimestral, IPC mensual, pobreza anual
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>MIDAGRI</strong> - Precios mayoristas agrícolas, pollo
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>Supermercados</strong> - Plaza Vea, Metro, Wong (42K SKUs)
                </li>
                <li className="flex items-center">
                  <span className="text-green-600 mr-2">✓</span>
                  <strong>Medios</strong> - La República, El Comercio, Gestión, RPP
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action - Collaborate */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-8 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">¿Quieres contribuir?</h2>
            <p className="text-lg mb-6 text-blue-100">
              Qhawarina es un proyecto de código abierto. Tu contribución puede marcar la diferencia.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl mb-2">💻</div>
                <h3 className="font-semibold mb-1">Código</h3>
                <p className="text-sm text-blue-100">
                  Mejora modelos, arregla bugs, agrega features
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold mb-1">Datos</h3>
                <p className="text-sm text-blue-100">
                  Sugiere nuevas fuentes o series relevantes
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-semibold mb-1">Docs</h3>
                <p className="text-sm text-blue-100">
                  Mejora documentación, traduce, escribe tutoriales
                </p>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com/btorressz/nexus"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Ver en GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-3xl mr-3">💬</span>
            Contacto
          </h2>
          <p className="text-gray-700 mb-4">
            ¿Tienes preguntas, sugerencias o quieres colaborar? Nos encantaría escucharte:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-3">📧</span>
              <div>
                <div className="text-sm text-gray-600 mb-1">Email</div>
                <a href="mailto:info@qhawarina.pe" className="text-blue-700 hover:underline font-medium">
                  info@qhawarina.pe
                </a>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-3">💻</span>
              <div>
                <div className="text-sm text-gray-600 mb-1">GitHub</div>
                <a
                  href="https://github.com/btorressz/nexus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline font-medium"
                >
                  github.com/btorressz/nexus
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            🇵🇪 Hecho con ❤️ para Perú • Open source, siempre gratis, siempre transparente
          </p>
        </div>
      </div>
    </div>
  );
}

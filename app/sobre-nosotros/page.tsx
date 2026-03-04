'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import BreadcrumbJsonLd from '../components/BreadcrumbJsonLd';

function ContactForm({ isEn }: { isEn: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('general');
  const [message, setMessage] = useState('');

  const topics = isEn ? [
    { value: 'general', label: 'General inquiry' },
    { value: 'datos', label: 'Data and API' },
    { value: 'metodologia', label: 'Methodology' },
    { value: 'colaboracion', label: 'Collaboration / Contribute' },
    { value: 'prensa', label: 'Press / Media' },
    { value: 'error', label: 'Bug report' },
  ] : [
    { value: 'general', label: 'Consulta general' },
    { value: 'datos', label: 'Datos y API' },
    { value: 'metodologia', label: 'Metodología' },
    { value: 'colaboracion', label: 'Colaboración / Contribuir' },
    { value: 'prensa', label: 'Prensa / Medios' },
    { value: 'error', label: 'Reporte de error' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Qhawarina - ${topic}] ${isEn ? 'Message from' : 'Mensaje de'} ${name}`);
    const body = encodeURIComponent(`${isEn ? 'Name' : 'Nombre'}: ${name}\nEmail: ${email}\n${isEn ? 'Subject' : 'Asunto'}: ${topic}\n\n${message}`);
    window.location.href = `mailto:info@qhawarina.pe?subject=${subject}&body=${body}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{isEn ? 'Name' : 'Nombre'}</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder={isEn ? 'Your name' : 'Tu nombre'}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{isEn ? 'Subject' : 'Asunto'}</label>
        <select value={topic} onChange={e => setTopic(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
          {topics.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{isEn ? 'Message' : 'Mensaje'}</label>
        <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={4}
          placeholder={isEn ? 'Write your message here...' : 'Escribe tu mensaje aquí...'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
      </div>
      <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-blue-800 text-white rounded-lg text-sm font-medium hover:bg-blue-900 transition-colors">
        {isEn ? 'Send message →' : 'Enviar mensaje →'}
      </button>
      <p className="text-xs text-gray-400">
        {isEn ? 'Your email client will open with the message pre-filled.' : 'Se abrirá tu cliente de correo con el mensaje pre-llenado.'}
      </p>
    </form>
  );
}

export default function SobreNosotrosPage() {
  const locale = useLocale();
  const isEn = locale === 'en';

  const T = isEn ? {
    title: 'About',
    brand: 'Qhawarina',
    subtitle: 'Democratizing access to real-time economic information for all Peruvians',
    originTitle: 'How was Qhawarina born?',
    originQuestion: 'Why do Peruvians have to wait weeks or months to know how our economy is doing?',
    origin1: 'In 2024, while analysts at investment banks and international organizations had access to sophisticated economic nowcasting models, the average Peruvian—the entrepreneur in Gamarra, the farmer in Ayacucho, the student planning their future—navigated with outdated information.',
    origin2: 'We believe economic information is a public good. Qhawarina exists to level the playing field: use the same technology employed by large investment funds, but put it at the service of everyone, for free, with complete transparency.',
    meaningTitle: 'What does "Qhawarina" mean?',
    etymology: 'Qhawarina comes from the Quechua "qhaway" (to watch, to observe) with the suffix "-rina" (instrument for). Literally: "instrument for watching" or "place from which to observe".',
    metaphor: 'Like the traditional qhawarina—a lookout in the heights from which the territory is watched—our project offers a panoramic, anticipatory, and clear view of the Peruvian economy.',
    quote: 'From the heights of the Andes, ancient Peruvians observed the territory to anticipate harvests, weather, movements. Today, from our digital qhawarina, we observe the economy to anticipate trends before they arrive.',
    missionTitle: 'Our Mission',
    mission1: 'Provide world-class economic nowcasting for Peru, open and free, with the same technical rigor as private models but with complete transparency.',
    mission2: 'Empower citizens, entrepreneurs, researchers and decision-makers with timely, accurate and accessible economic information.',
    visionTitle: 'Our Vision',
    vision: 'Become the reference source for economic nowcasting in Peru, expanding coverage to:',
    visionItems: ['Sectoral GDP (construction, manufacturing, services)', 'Formal employment and labor market', 'Provincial/district indicators'],
    whoTitle: 'Who uses Qhawarina?',
    users: [
      { icon: '🎓', title: 'Researchers', desc: 'Students and academics analyzing the Peruvian economy with high-frequency data' },
      { icon: '💼', title: 'Business leaders', desc: 'Entrepreneurs and managers making informed decisions about investment and expansion' },
      { icon: '📰', title: 'Journalists', desc: 'Media reporting economic trends with updated and verifiable data' },
    ],
    principlesTitle: 'Our Principles',
    principles: [
      { icon: '🔓', bg: 'bg-blue-50', title: '100% Open', desc: 'Public source code, downloadable data, transparent methodology. No paywalls or subscriptions.' },
      { icon: '🔬', bg: 'bg-green-50', title: 'Scientific Rigor', desc: 'Historical validation, rigorous backtesting, benchmark comparison, academic references.' },
      { icon: '⚖️', bg: 'bg-purple-50', title: 'Independence', desc: 'No political or commercial affiliation. The data speaks, we just interpret it.' },
      { icon: '🤝', bg: 'bg-yellow-50', title: 'Collaborative', desc: 'Open to contributions, improvements and community feedback. Built with and for Peruvians.' },
    ],
    techTitle: 'Technology & Sources',
    modelsTitle: 'Models & Tools',
    sourcesTitle: 'Data Sources',
    models: ['Dynamic Factor Models (DFM) - statsmodels, scikit-learn', 'Machine Learning - Gradient Boosting, Ridge Regression', 'NLP - BERT multilingual, zero-shot classification', 'Satellite - NOAA-VIIRS nighttime lights', 'Web Scraping - Beautiful Soup, Selenium, RSS parsing'],
    sources: ['BCRP - Monetary, trade, production series', 'INEI - Quarterly GDP, monthly CPI, annual poverty', 'MIDAGRI - Agricultural and poultry wholesale prices', 'Supermarkets - Plaza Vea, Metro, Wong (42K SKUs)', 'Media - La República, El Comercio, Gestión, RPP'],
    contributeTitle: 'Want to contribute?',
    contributeSubtitle: 'Qhawarina is an open source project. Your contribution can make a difference.',
    contributeCards: [
      { icon: '💻', title: 'Code', desc: 'Improve models, fix bugs, add features' },
      { icon: '📊', title: 'Data', desc: 'Suggest new sources or relevant series' },
      { icon: '📝', title: 'Docs', desc: 'Improve documentation, translate, write tutorials' },
    ],
    viewGitHub: 'View on GitHub',
    contactTitle: 'Contact',
    contactSubtitle: 'Questions, suggestions or want to collaborate? We would love to hear from you:',
    emailLabel: 'Direct email',
    githubLabel: 'GitHub',
    footer: '🇵🇪 Made with ❤️ for Peru • Open source, always free, always transparent',
  } : {
    title: 'Sobre',
    brand: 'Qhawarina',
    subtitle: 'Democratizando el acceso a información económica en tiempo real para todos los peruanos',
    originTitle: '¿Cómo nació Qhawarina?',
    originQuestion: '¿Por qué los peruanos tenemos que esperar semanas o meses para saber cómo va nuestra economía?',
    origin1: 'En 2024, mientras analistas de bancos de inversión y organismos internacionales tenían acceso a modelos sofisticados de nowcasting económico, el peruano promedio —el emprendedor en Gamarra, la agricultora en Ayacucho, el estudiante planeando su futuro— navegaba con información desactualizada.',
    origin2: 'Creemos que la información económica es un bien público. Qhawarina existe para nivelar el campo de juego: usar la misma tecnología que emplean los grandes fondos de inversión, pero ponerla al servicio de todos, gratuitamente, con transparencia total.',
    meaningTitle: '¿Qué significa "Qhawarina"?',
    etymology: 'Qhawarina proviene del quechua "qhaway" (mirar, observar) con el sufijo "-rina" (instrumento para). Literalmente: "instrumento para mirar" o "lugar desde donde se observa".',
    metaphor: 'Como el qhawarina tradicional —un mirador en las alturas desde donde se vigila el territorio—, nuestro proyecto ofrece una vista panorámica, anticipada y clara de la economía peruana.',
    quote: 'Desde las alturas de los Andes, los antiguos peruanos observaban el territorio para anticipar las cosechas, el clima, los movimientos. Hoy, desde nuestro qhawarina digital, observamos la economía para anticipar tendencias antes de que lleguen.',
    missionTitle: 'Nuestra Misión',
    mission1: 'Proveer nowcasting económico de clase mundial para Perú, abierto y gratuito, con la misma rigurosidad técnica que los modelos privados pero con transparencia total.',
    mission2: 'Empoderar a ciudadanos, emprendedores, investigadores y tomadores de decisión con información económica oportuna, precisa y accesible.',
    visionTitle: 'Nuestra Visión',
    vision: 'Convertirnos en la fuente de referencia para nowcasting económico en Perú, expandiendo cobertura a:',
    visionItems: ['PBI sectorial (construcción, manufactura, servicios)', 'Empleo formal y mercado laboral', 'Indicadores provinciales/distritales'],
    whoTitle: '¿Quién usa Qhawarina?',
    users: [
      { icon: '🎓', title: 'Investigadores', desc: 'Estudiantes y académicos analizando la economía peruana con datos de alta frecuencia' },
      { icon: '💼', title: 'Empresarios', desc: 'Emprendedores y gerentes tomando decisiones informadas sobre inversión y expansión' },
      { icon: '📰', title: 'Periodistas', desc: 'Medios reportando tendencias económicas con datos actualizados y verificables' },
    ],
    principlesTitle: 'Nuestros Principios',
    principles: [
      { icon: '🔓', bg: 'bg-blue-50', title: '100% Abierto', desc: 'Código fuente público, datos descargables, metodología transparente. Sin paywalls ni suscripciones.' },
      { icon: '🔬', bg: 'bg-green-50', title: 'Rigor Científico', desc: 'Validación histórica, backtesting riguroso, comparación contra benchmarks, referencias académicas.' },
      { icon: '⚖️', bg: 'bg-purple-50', title: 'Independencia', desc: 'Sin afiliación política o comercial. Los datos hablan, nosotros solo los interpretamos.' },
      { icon: '🤝', bg: 'bg-yellow-50', title: 'Colaborativo', desc: 'Abierto a contribuciones, mejoras y feedback de la comunidad. Construido con y para peruanos.' },
    ],
    techTitle: 'Tecnología y Fuentes',
    modelsTitle: 'Modelos & Herramientas',
    sourcesTitle: 'Fuentes de Datos',
    models: ['Dynamic Factor Models (DFM) - statsmodels, scikit-learn', 'Machine Learning - Gradient Boosting, Ridge Regression', 'NLP - BERT multilingual, zero-shot classification', 'Satelital - NOAA-VIIRS nighttime lights', 'Web Scraping - Beautiful Soup, Selenium, RSS parsing'],
    sources: ['BCRP - Series monetarias, comercio, producción', 'INEI - PBI trimestral, IPC mensual, pobreza anual', 'MIDAGRI - Precios mayoristas agrícolas, pollo', 'Supermercados - Plaza Vea, Metro, Wong (42K SKUs)', 'Medios - La República, El Comercio, Gestión, RPP'],
    contributeTitle: '¿Quieres contribuir?',
    contributeSubtitle: 'Qhawarina es un proyecto de código abierto. Tu contribución puede marcar la diferencia.',
    contributeCards: [
      { icon: '💻', title: 'Código', desc: 'Mejora modelos, arregla bugs, agrega features' },
      { icon: '📊', title: 'Datos', desc: 'Sugiere nuevas fuentes o series relevantes' },
      { icon: '📝', title: 'Docs', desc: 'Mejora documentación, traduce, escribe tutoriales' },
    ],
    viewGitHub: 'Ver en GitHub',
    contactTitle: 'Contacto',
    contactSubtitle: '¿Tienes preguntas, sugerencias o quieres colaborar? Nos encantaría escucharte:',
    emailLabel: 'Email directo',
    githubLabel: 'GitHub',
    footer: '🇵🇪 Hecho con ❤️ para Perú • Open source, siempre gratis, siempre transparente',
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <BreadcrumbJsonLd crumbs={[{ name: 'Qhawarina', href: '/' }, { name: isEn ? 'About Us' : 'Sobre Nosotros', href: '/sobre-nosotros' }]} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {T.title} <span className="text-blue-700">{T.brand}</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{T.subtitle}</p>
        </div>

        {/* Origin */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><span className="text-3xl mr-3">🌱</span>{T.originTitle}</h2>
          <p className="text-gray-700 mb-4 leading-relaxed"><strong>Qhawarina</strong> {isEn ? 'was born from a simple but powerful question:' : 'nace de una pregunta simple pero poderosa:'} <em>{T.originQuestion}</em></p>
          <p className="text-gray-700 mb-4 leading-relaxed">{T.origin1}</p>
          <p className="text-gray-700 leading-relaxed">{T.origin2}</p>
        </div>

        {/* Meaning */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><span className="text-3xl mr-3">🇵🇪</span>{T.meaningTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-700 mb-3 leading-relaxed">{T.etymology}</p>
              <p className="text-gray-700 leading-relaxed">{T.metaphor}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-red-50 rounded-lg p-6 border border-yellow-200">
              <div className="text-center">
                <div className="text-6xl mb-3">🏔️</div>
                <p className="text-sm text-gray-700 italic">&ldquo;{T.quote}&rdquo;</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><span className="text-3xl mr-3">🎯</span>{T.missionTitle}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{T.mission1}</p>
            <p className="text-gray-700 leading-relaxed">{T.mission2}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><span className="text-3xl mr-3">🌟</span>{T.visionTitle}</h2>
            <p className="text-gray-700 leading-relaxed mb-4">{T.vision}</p>
            <ul className="text-gray-700 space-y-2">
              {T.visionItems.map(item => (
                <li key={item} className="flex items-start"><span className="text-green-600 mr-2">✓</span><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Who uses it */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center"><span className="text-3xl mr-3">👥</span>{T.whoTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {T.users.map(u => (
              <div key={u.title} className="text-center p-4">
                <div className="text-4xl mb-3">{u.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{u.title}</h3>
                <p className="text-sm text-gray-600">{u.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Principles */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center"><span className="text-3xl mr-3">⚡</span>{T.principlesTitle}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {T.principles.map(p => (
              <div key={p.title} className={`flex items-start p-4 ${p.bg} rounded-lg`}>
                <span className="text-2xl mr-3">{p.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-sm text-gray-700">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><span className="text-3xl mr-3">🛠️</span>{T.techTitle}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{T.modelsTitle}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {T.models.map(m => {
                  const [bold, ...rest] = m.split(' - ');
                  return (
                    <li key={m} className="flex items-center">
                      <span className="text-blue-600 mr-2">▸</span>
                      <strong>{bold}</strong>&nbsp;-&nbsp;{rest.join(' - ')}
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">{T.sourcesTitle}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {T.sources.map(s => {
                  const [bold, ...rest] = s.split(' - ');
                  return (
                    <li key={s} className="flex items-center">
                      <span className="text-green-600 mr-2">✓</span>
                      <strong>{bold}</strong>&nbsp;-&nbsp;{rest.join(' - ')}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>

        {/* Contribute CTA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-8 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">{T.contributeTitle}</h2>
            <p className="text-lg mb-6 text-blue-100">{T.contributeSubtitle}</p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {T.contributeCards.map(c => (
                <div key={c.title} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="text-3xl mb-2">{c.icon}</div>
                  <h3 className="font-semibold mb-1">{c.title}</h3>
                  <p className="text-sm text-blue-100">{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <a href="https://github.com/cesarchavezp29/qhawarina" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                {T.viewGitHub}
              </a>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center"><span className="text-3xl mr-3">💬</span>{T.contactTitle}</h2>
          <p className="text-gray-700 mb-2">{T.contactSubtitle}</p>
          <div className="flex flex-wrap gap-4 mb-2">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-3">📧</span>
              <div>
                <div className="text-sm text-gray-600 mb-1">{T.emailLabel}</div>
                <a href="mailto:info@qhawarina.pe" className="text-blue-700 hover:underline font-medium">info@qhawarina.pe</a>
              </div>
            </div>
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-2xl mr-3">💻</span>
              <div>
                <div className="text-sm text-gray-600 mb-1">{T.githubLabel}</div>
                <a href="https://github.com/cesarchavezp29/qhawarina" target="_blank" rel="noopener noreferrer"
                  className="text-blue-700 hover:underline font-medium">github.com/cesarchavezp29/qhawarina</a>
              </div>
            </div>
          </div>
          <ContactForm isEn={isEn} />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>{T.footer}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Datos de la clienta y textos del sitio, centralizados.
 * ⚠️ PENDIENTE: reemplazar por los datos reales (ver sección 7 del plan).
 */
export const siteConfig = {
  name: "Agustina Vidal",
  role: "Locutora profesional",
  tagline: "La voz que tu marca necesita",
  description:
    "Locutora profesional argentina. Demos de voz para publicidad, institucionales, IVR, e-learning y doblaje. Escuchá mi trabajo y contactame.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  whatsapp: {
    // Solo dígitos, con código de país, sin "+" (formato wa.me)
    number: "5491100000000",
    message:
      "¡Hola! Escuché tus demos en tu sitio y me gustaría hacerte una consulta.",
  },
  email: "hola@valentinarios.com",

  socials: [
    { name: "Instagram", url: "https://instagram.com/valentinarios.voz" },
    { name: "LinkedIn", url: "https://linkedin.com/in/valentinarios" },
    { name: "YouTube", url: "https://youtube.com/@valentinarios" },
  ],

  bio: [
    "Soy locutora profesional con más de diez años de experiencia poniéndole voz a marcas, instituciones y proyectos de toda Latinoamérica.",
    "Trabajo desde mi estudio propio con calidad broadcast y entregas en menos de 48 horas. Publicidad, institucionales, IVR, e-learning, doblaje: si tu proyecto necesita una voz, puedo ayudarte a encontrar el tono justo.",
  ],

  highlights: [
    { value: 10, suffix: "+", label: "Años de experiencia" },
    { value: 200, suffix: "+", label: "Clientes" },
    { value: 1500, suffix: "+", label: "Proyectos entregados" },
    { value: 48, suffix: "h", label: "Entrega máxima" },
  ],
} as const;

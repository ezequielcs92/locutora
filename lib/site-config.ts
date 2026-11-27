/**
 * Datos de la clienta y textos del sitio, centralizados.
 */
export const siteConfig = {
  name: "Agustina Vidal",
  portrait: {
    src: "/images/agustina-vidal.jpg",
    alt: "Agustina Vidal en el estudio de Fox Sports",
  },
  role: "Locutora profesional",
  tagline: "La voz que tu marca necesita",
  description:
    "Locutora profesional argentina. Demos de voz para publicidad, institucionales, IVR, e-learning y doblaje. Escuchá mi trabajo y contactame.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  whatsapp: {
    number: "5491157450521",
    message:
      "¡Hola! Escuché tus demos en tu sitio y me gustaría hacerte una consulta.",
  },
  email: "contactoagusvidal@gmail.com",

  socials: [
    { name: "Instagram", url: "https://instagram.com/agusvidal__" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/agustina-vidal-024057213/" },
    { name: "YouTube", url: "https://www.youtube.com/@AgustinaVidal" },
    { name: "TikTok", url: "https://www.tiktok.com/@agusvidal__" },
  ],

  navigation: [
    { id: "inicio", label: "Inicio" },
    { id: "demos", label: "Demos" },
    { id: "videos", label: "Videos" },
    { id: "trabajos", label: "Trabajos" },
    { id: "sobre-mi", label: "Sobre mí" },
    { id: "contacto", label: "Contacto" },
  ],

  videoSections: {
    demos: {
      id: "videos",
      eyebrow: "Videos",
      title: "Mis demos",
      description: "Una muestra de mi voz en demos audiovisuales.",
      emptyMessage: "Próximamente vas a poder ver mis demos audiovisuales acá.",
    },
    works: {
      id: "trabajos",
      eyebrow: "Trabajos realizados",
      title: "Mi voz en acción",
      description: "Una selección de trabajos que realicé para marcas, instituciones y proyectos.",
      emptyMessage: "Próximamente voy a compartir mis trabajos realizados acá.",
    },
  },

  bio: [
    "Soy locutora profesional matriculada con más de diez años de experiencia poniéndole voz a marcas, instituciones y proyectos de toda Latinoamérica.",
    "Trabajo desde mi propio estudio con calidad broadcast y entregas en menos de 48 horas. Contactame por publicidades, institucionales, IVR, e-learning, doblaje o conducciones: si tu proyecto necesita una voz, puedo ayudarte a encontrar el tono justo.",
  ],

  highlights: [
    { value: 10, suffix: "+", label: "Años de experiencia" },
    { value: 150, suffix: "+", label: "Clientes" },
    { value: 500, suffix: "+", label: "Proyectos entregados" },
    { value: 48, suffix: "h", label: "Entrega máxima" },
  ],
} as const;

import AmbientBackground from "@/components/layout/AmbientBackground";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import GlobalAudio from "@/components/player/GlobalAudio";
import MiniPlayer from "@/components/player/MiniPlayer";
import LenisProvider from "@/components/providers/LenisProvider";
import Contacto from "@/components/sections/Contacto";
import Demos from "@/components/sections/Demos";
import Hero from "@/components/sections/Hero";
import Sobre from "@/components/sections/Sobre";
import Trabajos from "@/components/sections/Trabajos";
import { getPublicCategories, getPublicDemos, getPublicVideos } from "@/lib/data";
import { siteConfig } from "@/lib/site-config";

// Revalidación incremental; el admin fuerza revalidatePath al mutar contenido
export const revalidate = 60;

export default async function Home() {
  const [demos, categories, videos] = await Promise.all([
    getPublicDemos(),
    getPublicCategories(),
    getPublicVideos(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.name,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    url: siteConfig.url,
    email: siteConfig.email,
    sameAs: siteConfig.socials.map((s) => s.url),
  };

  return (
    <LenisProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="relative isolate min-h-screen overflow-x-clip">
        <AmbientBackground />
        <div className="relative z-10">
          <Navbar />
        </div>
        <main className="relative z-10">
          <Hero featuredDemos={demos} />
          <Demos demos={demos} categories={categories} />
          <Trabajos videos={videos} />
          <Sobre />
          <Contacto />
        </main>
        <div className="relative z-10">
          <Footer />
          <MiniPlayer />
          <GlobalAudio />
        </div>
      </div>
    </LenisProvider>
  );
}

/** Las dos colecciones comparten formato, pero nunca contenido ni orden. */
export type VideoCollection = "videos" | "works";

export function videoCollectionConfig(collection: VideoCollection) {
  // Validación en runtime: los argumentos de una server action no son confiables.
  if (collection === "videos") {
    return { table: "videos", adminPath: "/admin/videos", title: "Mis demos" } as const;
  }
  if (collection === "works") {
    return { table: "works", adminPath: "/admin/trabajos", title: "Trabajos" } as const;
  }
  throw new Error("La colección de videos no es válida.");
}

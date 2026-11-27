import VideoGallery from "@/components/videos/VideoGallery";
import { siteConfig } from "@/lib/site-config";
import type { PublicVideo } from "@/lib/types";

export default function Videos({ videos }: { videos: PublicVideo[] }) {
  return <VideoGallery videos={videos} {...siteConfig.videoSections.demos} />;
}

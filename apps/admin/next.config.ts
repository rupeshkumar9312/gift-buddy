import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // One legacy product image (id 13) points directly at this host
        // instead of Cloudinary — see the media_assets row for asset 79.
        protocol: "https",
        hostname: "xria0arjbvqhfvav.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;

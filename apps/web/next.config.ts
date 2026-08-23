import type { NextConfig } from "next";

// The admin app runs as its own Next.js server (port 3002 in dev). Leave
// unset for local dev; set to the deployed admin app's origin in prod.
const ADMIN_APP_URL = process.env.ADMIN_APP_URL ?? "http://localhost:3002";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/admin", destination: `${ADMIN_APP_URL}/admin` },
      { source: "/admin/:path*", destination: `${ADMIN_APP_URL}/admin/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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

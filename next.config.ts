import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    minimumCacheTTL: 60,
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'icons.llama.fi',
            port: '',
            pathname: '/**' // Разрешаем любые пути на этом хосте
        },
        {
            protocol: 'https',
            hostname: 'icons.llamao.fi',
            port: '',
            pathname: '/**'
        },
        {
            protocol: 'https',
            hostname: 'upload.wikimedia.org',
            port: '',
            pathname: '/**'
        },
        {
            protocol: 'https',
            hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
            port: '',
            pathname: '/**'
        }
        // Можно добавить другие домены, если они используются
    ]
},
  experimental: {
    allowedDevOrigins: [
      "http://localhost:3001",
      "http://213.176.74.94",
      "http://213.176.74.94:3001" // Если нужен порт
    ],
  },

  // Проксирование API
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://213.176.74.94:8000/:path*",
      },
      {
        source: "/withdrawal_fee",
        destination: "http://213.176.74.94:8000/withdrawal_fee",
      }
    ];
  },

  // CORS настройки
  async headers() {
    return [
      {
        source: "/:path*", // Применяется ко всем роутам
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://213.176.74.94", // Разрешаем конкретный IP
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
      // Дублируем для _next/static
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://213.176.74.94",
          }
        ],
      },
    ];
  },
};

export default nextConfig;

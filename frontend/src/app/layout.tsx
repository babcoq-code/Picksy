import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import { UmamiAnalytics } from "@/components/UmamiAnalytics";

export const metadata = {
  title: "Troviio — Pas le meilleur. Le tien.",
  description:
    "Troviio ne compare pas les produits. Il comprend ta vie, tes contraintes et ton budget pour te recommander LE produit qui te correspond. Zéro biais, zéro commission.",
  icons: { icon: "/logo-icon.svg" },
  // ✅ FIX : token externalisé en variable d'env (à définir dans .env.local)
  // NEXT_PUBLIC_SITE_VERIFICATION=81bc37e56daa107ead4fd669e3b0f3cc
  ...(process.env.NEXT_PUBLIC_SITE_VERIFICATION
    ? { other: { verification: process.env.NEXT_PUBLIC_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <UmamiAnalytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}

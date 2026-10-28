import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { APP_NAME, APP_DESCRIPTION } from '@/config/app';
import '@/styles/global.css';


export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`
  },
  description: APP_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className="app-body">
        <Navbar />
        <div className="app-content">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

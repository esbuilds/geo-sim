import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'geo-sim dashboard',
  description: 'Historical geo-sim runs',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <div className="inner">
            <a href="/">geo-sim dashboard</a>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

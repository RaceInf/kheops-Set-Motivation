"use client";

import Link from 'next/link';
import * as gtag from '@/lib/gtag';

interface FooterProps {
  maxWidth?: string;
}

export default function Footer({ maxWidth = "1600px" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleSocialClick = (name: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      gtag.event({
        action: 'social_footer',
        category: 'social',
        label: name,
      });
    }
  };

  return (
    <footer className={`w-full max-w-[${maxWidth}] mx-auto pt-24 pb-12 px-4 md:px-8 flex flex-col gap-12 border-t border-white/5 mt-12`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-6 flex flex-col gap-6">
          <div className="font-display text-4xl font-black tracking-tighter uppercase leading-none">
            Kheops<span className="text-gold">.</span>
          </div>
          <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest max-w-xs">
            L&apos;excellence n&apos;est pas une option. C&apos;est un système. 
            Bâtis ton empire brique par brique, dans le silence et la discipline.
          </p>
        </div>
        
        <div className="md:col-span-6 flex flex-wrap gap-12 md:justify-end">
          <div className="flex flex-col gap-4">
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Navigation</span>
            <div className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <Link href="/#accueil" className="hover:text-gold transition-colors">Accueil</Link>
              <Link href="/#manifeste" className="hover:text-gold transition-colors">Manifeste</Link>
              <Link href="/#arsenal" className="hover:text-gold transition-colors">Arsenal</Link>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Social</span>
            <div className="flex flex-col gap-2 text-[10px] uppercase tracking-widest text-white/40">
              <a 
                href="https://www.facebook.com/KheopsSetMotivation" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Facebook Kheops Set Motivation"
                onClick={() => handleSocialClick('Facebook')}
                className="hover:text-gold transition-colors"
              >
                Facebook
              </a>
              <a 
                href="https://wa.me/237654172703" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="WhatsApp Kheops Set Motivation"
                onClick={() => handleSocialClick('WhatsApp')}
                className="hover:text-gold transition-colors"
              >
                WhatsApp
              </a>
              <a 
                href="https://www.youtube.com/@kheopset.motivation" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="YouTube Kheops Set Motivation"
                onClick={() => handleSocialClick('YouTube')}
                className="hover:text-gold transition-colors"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
        <div className="text-[8px] md:text-[10px] uppercase tracking-[0.5em] text-white/20">
          © {currentYear} KHEOPS SET MOTIVATION — PROTÉGÉ PAR L&apos;ORDRE DU BÂTISSEUR
        </div>
        <div className="flex gap-8 text-[8px] uppercase tracking-widest text-white/30">
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions Légales</Link>
          <Link href="/politique-de-confidentialite" className="hover:text-white transition-colors">Politique de Confidentialité</Link>
        </div>
      </div>
    </footer>
  );
}

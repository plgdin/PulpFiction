import { ExternalLink, Mail, Instagram, Youtube } from 'lucide-react';
import { useCms } from '@/context/CmsContext';

const Footer = () => {
  const { data } = useCms();
  const { footerContent, siteSettings, categories } = data;

  const copyrightText = footerContent.copyright.replace(
    '{year}',
    new Date().getFullYear().toString()
  );

  return (
    <footer className="bg-card border-t border-border py-12 px-4 md:px-12 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl text-primary mb-4">{siteSettings.siteName}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {footerContent.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg text-primary mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href={`#${cat.slug}`}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {cat.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg text-primary mb-4">Connect</h4>
            <div className="flex items-center gap-4">
              {siteSettings.behanceUrl && (
                <a
                  href={siteSettings.behanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
              {siteSettings.email && (
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {siteSettings.instagramUrl && (
                <a
                  href={siteSettings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {siteSettings.youtubeUrl && (
                <a
                  href={siteSettings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">{copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

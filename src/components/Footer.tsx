import { ExternalLink, Mail, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 px-4 md:px-12 mt-12 font-footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-footer uppercase tracking-wider font-bold text-2xl text-primary mb-4">TARUN KAPOOR</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Director & Cinematographer crafting visual stories that move, inspire, and captivate.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-footer uppercase tracking-wider font-bold text-lg text-primary mb-4">Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="#ad-films" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Ad Films
                </a>
              </li>
              <li>
                <a href="#music-videos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Music Videos
                </a>
              </li>
              <li>
                <a href="#brand-films" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Brand Films
                </a>
              </li>
              <li>
                <a href="#short-films" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Short Films
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-footer uppercase tracking-wider font-bold text-lg text-primary mb-4">Connect</h4>
            <div className="flex items-center gap-4">
              <a
                href="https://www.behance.net/tarunkapoor2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@tarunkapoor.com"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Tarun Kapoor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, FileText, MessageCircle, Building2, QrCode, UserCircle, LogIn, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { SUPPORTED_LANGUAGES } from "@/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { t, language, setLanguage, isTranslating } = useI18n();

  const navItems = [
    { path: "/", label: t("nav.home"), icon: Heart },
    { path: "/documents", label: t("nav.documents"), icon: FileText },
    { path: "/translate", label: t("nav.translate"), icon: MessageCircle },
    { path: "/my-qr", label: t("nav.qrCode"), icon: QrCode },
    { path: "/hospital/auth", label: t("nav.hospitalPortal"), icon: Building2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow duration-300">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">Translatical</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className={`gap-2 ${isActive(item.path) ? "bg-primary/10 text-primary" : ""}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            <Link to={user ? "/profile" : "/auth"}>
              <Button
                variant={isActive("/profile") || isActive("/auth") ? "secondary" : "ghost"}
                className={`gap-2 ${isActive("/profile") || isActive("/auth") ? "bg-primary/10 text-primary" : ""}`}
              >
                {user ? <UserCircle className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                {user ? t("nav.profile") : t("nav.signIn")}
              </Button>
            </Link>

            {/* Language Switcher */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-auto gap-1 h-9 px-2 border-none bg-transparent hover:bg-accent">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag}</span>
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-auto gap-1 h-9 px-2 border-none bg-transparent">
                <span className="text-sm">{SUPPORTED_LANGUAGES.find(l => l.code === language)?.flag}</span>
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-2 ${isActive(item.path) ? "bg-primary/10 text-primary" : ""}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              <Link to={user ? "/profile" : "/auth"} onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant={isActive("/profile") || isActive("/auth") ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-2 ${isActive("/profile") || isActive("/auth") ? "bg-primary/10 text-primary" : ""}`}
                >
                  {user ? <UserCircle className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  {user ? t("nav.profile") : t("nav.signIn")}
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
      {isTranslating && (
        <div className="h-0.5 bg-primary/20 overflow-hidden">
          <div className="h-full bg-primary animate-pulse w-full" />
        </div>
      )}
    </header>
  );
};

export default Header;

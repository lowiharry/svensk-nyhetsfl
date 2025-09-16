import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Moon, Sun, Search, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (category: string) => void;
  selectedCategory: string;
}

export const Header = ({ onSearch, onCategoryFilter, selectedCategory }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = [
    'all',
    'politics',
    'economy',
    'sports',
    'culture',
    'technology',
    'health',
    'environment'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs sm:text-sm">🇸🇪</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent truncate">
              Sweden Update
            </h1>
            <p className="text-xs text-muted-foreground hidden md:block">Latest Swedish News</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button type="submit" size="sm" className="h-10 px-4">
              Search
            </Button>
          </form>
        </div>

        {/* Desktop Category Filter */}
        <div className="hidden xl:flex items-center gap-2">
          {categories.slice(0, 4).map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer capitalize h-8 px-3 text-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => onCategoryFilter(category)}
            >
              {category === 'all' ? 'All' : category}
            </Badge>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 p-0"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden h-9 w-9 p-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur">
          <div className="container p-3 sm:p-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Button type="submit" size="sm" className="h-11 px-4">
                Search
              </Button>
            </form>

            {/* Mobile Categories */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  className="cursor-pointer capitalize h-10 px-3 text-sm justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => {
                    onCategoryFilter(category);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {category === 'all' ? 'All' : category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
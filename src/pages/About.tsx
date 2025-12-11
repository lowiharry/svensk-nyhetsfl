import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Sweden Update - Your Trusted Source for Swedish News Today</title>
        <meta name="description" content="Learn about Sweden Update - Your trusted source for breaking news Sweden, latest Swedish news today, Sweden politics, economy, weather alerts, crime news from Stockholm, Gothenburg, Malmö and all Sweden." />
        <meta name="keywords" content="About Sweden Update, Swedish news aggregation, Sweden news source, breaking news Sweden, latest Swedish news, Sweden live updates, Swedish news today" />
        <meta name="google-adsense-account" content="ca-pub-3000410248339228" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://swedenupdate.com/about" />
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-6">About Sweden Update - Your Source for Swedish News Today</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission: Delivering Breaking News Sweden</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sweden Update is your trusted source for comprehensive Swedish news aggregation. 
              We bring you breaking news Sweden, latest Swedish news today, Sweden live updates,
              and top stories from major Swedish news outlets including Aftonbladet, Expressen, 
              DN, SvD, GP, and SVT - providing a centralized platform to stay informed about what's happening in Sweden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Latest Swedish News & Live Updates</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We aggregate news from leading Swedish media sources, making it easy for you to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Stay updated with latest news Sweden and breaking stories across multiple categories</li>
              <li>Get Sweden live updates from politics, economy, weather alerts, and crime news</li>
              <li>Access Swedish news today from Stockholm, Gothenburg, Malmö, and nationwide</li>
              <li>Read AI-powered summaries and analysis of important stories</li>
              <li>Navigate through Sweden current events including sports, culture, technology, and lifestyle</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Swedish Daily News & Breaking Stories</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to providing accurate, timely, and comprehensive news coverage. 
              From Sweden government announcements to Sweden traffic news, weather alerts to 
              Sweden immigration updates - our platform respects the original sources and provides 
              direct links to the full articles, ensuring you can access complete information from 
              trusted Swedish news outlets for all Sweden top stories.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              For inquiries, feedback, or partnership opportunities, please visit our{' '}
              <Link to="/contact" className="text-primary hover:underline">
                contact page
              </Link>.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
};

export default About;

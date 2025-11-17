import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Us - Sweden Update</title>
        <meta name="description" content="Learn more about Sweden Update, your trusted source for Swedish news aggregation and updates from major Swedish news outlets." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-6">About Sweden Update</h1>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sweden Update is your trusted source for comprehensive Swedish news aggregation. 
              We bring you the latest updates from major Swedish news outlets, providing a 
              centralized platform to stay informed about what's happening in Sweden.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Do</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We aggregate news from leading Swedish media sources, making it easy for you to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Stay updated with the latest Swedish news across multiple categories</li>
              <li>Access news from various trusted Swedish sources in one place</li>
              <li>Read AI-powered summaries and analysis of important stories</li>
              <li>Navigate through categorized content including politics, economy, sports, culture, and more</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Commitment</h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to providing accurate, timely, and comprehensive news coverage. 
              Our platform respects the original sources and provides direct links to the full articles, 
              ensuring you can access complete information from trusted Swedish news outlets.
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

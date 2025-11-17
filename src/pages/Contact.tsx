import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Us - Sweden Update</title>
        <meta name="description" content="Get in touch with Sweden Update. Contact us for inquiries, feedback, or partnership opportunities." />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg">
            We'd love to hear from you. Get in touch with us for any inquiries or feedback.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Contact
            </CardTitle>
            <CardDescription>
              Send us an email and we'll get back to you as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Mail className="h-6 w-6 text-primary" />
              <a 
                href="mailto:swedenupdatenews@gmail.com"
                className="text-lg font-medium text-primary hover:underline"
              >
                swedenupdatenews@gmail.com
              </a>
            </div>
            
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">General Inquiries</h3>
                <p className="text-sm text-muted-foreground">
                  For general questions about Sweden Update and our services
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Partnership Opportunities</h3>
                <p className="text-sm text-muted-foreground">
                  Interested in partnering with us? We'd love to discuss collaboration opportunities
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Feedback & Suggestions</h3>
                <p className="text-sm text-muted-foreground">
                  Your feedback helps us improve. Share your thoughts and suggestions with us
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;

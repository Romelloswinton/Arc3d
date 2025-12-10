'use client';

import { Check } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';

interface PricingCardProps {
  name: string;
  price: string;
  features: string[];
  isPro?: boolean;
}

export const PricingCard = ({ name, price, features, isPro = false }: PricingCardProps) => {
  return (
    <Card className={`relative ${isPro ? 'border-primary border-2' : ''}`}>
      {isPro && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold">{price}</span>
          {price !== '$0' && <span className="text-muted-foreground">/month</span>}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          variant={isPro ? 'default' : 'outline'}
          className="w-full"
          size="lg"
        >
          {isPro ? 'Start Free Trial' : 'Get Started'}
        </Button>
      </CardFooter>
    </Card>
  );
};

import { getUncachableStripeClient } from '../server/stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Checking for existing SwipeBetter products...');
  
  const existingProducts = await stripe.products.search({ 
    query: "name:'SwipeBetter Pro'" 
  });
  
  if (existingProducts.data.length > 0) {
    console.log('SwipeBetter Pro product already exists:', existingProducts.data[0].id);
    
    const prices = await stripe.prices.list({ 
      product: existingProducts.data[0].id,
      active: true 
    });
    console.log('Existing prices:', prices.data.map(p => ({
      id: p.id,
      amount: p.unit_amount,
      interval: p.recurring?.interval
    })));
    
    return;
  }

  console.log('Creating SwipeBetter Pro product...');
  
  const product = await stripe.products.create({
    name: 'SwipeBetter Pro',
    description: 'Unlimited AI-powered dating profile analysis and reply suggestions. Get more matches with expert-level feedback.',
    metadata: {
      app: 'swipebetter',
      features: 'unlimited_analyses,priority_support,advanced_insights'
    }
  });
  
  console.log('Created product:', product.id);

  console.log('Creating monthly price ($7.99/month)...');
  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 799,
    currency: 'usd',
    recurring: { interval: 'month' },
    metadata: {
      plan_type: 'monthly'
    }
  });
  console.log('Created monthly price:', monthlyPrice.id);

  console.log('Creating annual price ($59/year)...');
  const annualPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 5900,
    currency: 'usd',
    recurring: { interval: 'year' },
    metadata: {
      plan_type: 'annual',
      savings: '38%'
    }
  });
  console.log('Created annual price:', annualPrice.id);

  console.log('\n✅ Products created successfully!');
  console.log('Monthly Price ID:', monthlyPrice.id);
  console.log('Annual Price ID:', annualPrice.id);
}

createProducts().catch(console.error);

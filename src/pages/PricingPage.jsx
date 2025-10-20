import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'

  const plans = [
    {
      name: 'Free',
      tagline: 'Get started with the basics',
      price: { monthly: 0, annual: 0 },
      features: [
        'Up to 5 brand matches',
        'Basic profile analytics',
        'Email support',
        'Community access',
        'Brand discovery tools'
      ],
      cta: 'Get Started',
      ctaLink: '/signup',
      highlighted: false,
      color: '#8E8E93'
    },
    {
      name: 'Pro',
      tagline: 'Everything you need to grow',
      price: { monthly: 29, annual: 290 },
      features: [
        'Unlimited brand matches',
        'Advanced analytics dashboard',
        'Priority support',
        'Custom pitch generation',
        'Deal pipeline management',
        'Social media integration',
        'Partnership templates',
        'Monthly performance reports'
      ],
      cta: 'Start Free Trial',
      ctaLink: '/signup',
      highlighted: true,
      color: 'var(--green)',
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      tagline: 'For teams and agencies',
      price: { monthly: 99, annual: 990 },
      features: [
        'Everything in Pro',
        'Team collaboration tools',
        'White-label solutions',
        'Dedicated account manager',
        'Custom integrations',
        'API access',
        'Advanced security features',
        'SLA guarantee',
        'Training & onboarding'
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      highlighted: false,
      color: '#007AFF'
    }
  ];

  const calculateSavings = (plan) => {
    if (plan.price.monthly === 0) return 0;
    const monthlyTotal = plan.price.monthly * 12;
    const savings = monthlyTotal - plan.price.annual;
    return savings;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      paddingTop: '80px'
    }}>

      {/* Hero Section */}
      <div style={{
        textAlign: 'center',
        padding: '80px 20px 60px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '64px',
          fontWeight: '700',
          color: '#1d1d1f',
          margin: '0 0 16px',
          letterSpacing: '-0.02em',
          lineHeight: '1.1'
        }}>
          Choose your plan
        </h1>
        <p style={{
          fontSize: '24px',
          color: '#6e6e73',
          margin: '0 0 48px',
          fontWeight: '400',
          lineHeight: '1.4'
        }}>
          Unlock the full power of brand partnerships.<br/>Start free, upgrade anytime.
        </p>

        {/* Billing Toggle */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '16px',
          background: '#f5f5f7',
          padding: '4px',
          borderRadius: '30px',
          marginBottom: '60px'
        }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '10px 24px',
              borderRadius: '26px',
              border: 'none',
              background: billingCycle === 'monthly' ? 'white' : 'transparent',
              color: billingCycle === 'monthly' ? '#1d1d1f' : '#6e6e73',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none'
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            style={{
              padding: '10px 24px',
              borderRadius: '26px',
              border: 'none',
              background: billingCycle === 'annual' ? 'white' : 'transparent',
              color: billingCycle === 'annual' ? '#1d1d1f' : '#6e6e73',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: billingCycle === 'annual' ? '0 2px 8px rgba(0, 0, 0, 0.08)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Annual
            <span style={{
              background: 'var(--green)',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 40px 120px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px'
      }}>
        {plans.map((plan, idx) => (
          <div
            key={idx}
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: plan.highlighted ? '48px 40px' : '40px',
              border: plan.highlighted ? '2px solid var(--green)' : '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: plan.highlighted 
                ? '0 20px 60px rgba(44, 95, 52, 0.15)' 
                : '0 4px 20px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              transition: 'all 0.3s ease',
              transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
              zIndex: plan.highlighted ? 2 : 1
            }}
            onMouseEnter={e => {
              if (!plan.highlighted) {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.08)';
              }
            }}
            onMouseLeave={e => {
              if (!plan.highlighted) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.04)';
              }
            }}
          >
            {/* Badge */}
            {plan.badge && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'var(--green)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {plan.badge}
              </div>
            )}

            {/* Plan Header */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1d1d1f',
                margin: '0 0 8px',
                letterSpacing: '-0.01em'
              }}>
                {plan.name}
              </h3>
              <p style={{
                fontSize: '15px',
                color: '#6e6e73',
                margin: 0,
                fontWeight: '400'
              }}>
                {plan.tagline}
              </p>
            </div>

            {/* Price */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '56px',
                  fontWeight: '700',
                  color: '#1d1d1f',
                  letterSpacing: '-0.02em'
                }}>
                  ${billingCycle === 'monthly' ? plan.price.monthly : Math.floor(plan.price.annual / 12)}
                </span>
                <span style={{
                  fontSize: '17px',
                  color: '#6e6e73',
                  fontWeight: '400'
                }}>
                  /month
                </span>
              </div>
              {billingCycle === 'annual' && calculateSavings(plan) > 0 && (
                <p style={{
                  fontSize: '13px',
                  color: 'var(--green)',
                  margin: 0,
                  fontWeight: '500'
                }}>
                  Save ${calculateSavings(plan)} per year
                </p>
              )}
              {billingCycle === 'annual' && plan.price.annual > 0 && (
                <p style={{
                  fontSize: '13px',
                  color: '#86868b',
                  margin: '4px 0 0',
                  fontWeight: '400'
                }}>
                  ${plan.price.annual} billed annually
                </p>
              )}
            </div>

            {/* CTA Button */}
            <Link
              to={plan.ctaLink}
              style={{
                display: 'block',
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                background: plan.highlighted ? 'var(--green)' : '#f5f5f7',
                color: plan.highlighted ? 'white' : '#1d1d1f',
                textAlign: 'center',
                textDecoration: 'none',
                fontSize: '17px',
                fontWeight: '600',
                marginBottom: '32px',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {plan.cta}
            </Link>

            {/* Features */}
            <div style={{
              borderTop: '1px solid rgba(0, 0, 0, 0.06)',
              paddingTop: '32px'
            }}>
              <p style={{
                fontSize: '13px',
                color: '#6e6e73',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600',
                margin: '0 0 20px'
              }}>
                What's included
              </p>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0
              }}>
                {plan.features.map((feature, featureIdx) => (
                  <li
                    key={featureIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      marginBottom: '16px',
                      fontSize: '15px',
                      color: '#1d1d1f',
                      lineHeight: '1.5'
                    }}
                  >
                    <span style={{
                      color: plan.highlighted ? 'var(--green)' : '#34c759',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '80px 40px 120px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          color: '#1d1d1f',
          margin: '0 0 16px',
          letterSpacing: '-0.02em'
        }}>
          Frequently asked questions
        </h2>
        <p style={{
          fontSize: '21px',
          color: '#6e6e73',
          margin: '0 0 64px',
          lineHeight: '1.4'
        }}>
          Everything you need to know about our pricing
        </p>

        <div style={{
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px'
        }}>
          {[
            {
              q: 'Can I switch plans anytime?',
              a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we will prorate any charges.'
            },
            {
              q: 'Is there a free trial?',
              a: 'Pro and Enterprise plans come with a 14-day free trial. No credit card required to start.'
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept all major credit cards, PayPal, and wire transfers for annual Enterprise plans.'
            },
            {
              q: 'Do you offer refunds?',
              a: 'Yes, we offer a 30-day money-back guarantee. If you are not satisfied, contact us for a full refund.'
            }
          ].map((faq, idx) => (
            <div key={idx} style={{
              background: 'white',
              padding: '32px',
              borderRadius: '16px',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
            }}>
              <h3 style={{
                fontSize: '21px',
                fontWeight: '600',
                color: '#1d1d1f',
                margin: '0 0 12px'
              }}>
                {faq.q}
              </h3>
              <p style={{
                fontSize: '17px',
                color: '#6e6e73',
                margin: 0,
                lineHeight: '1.5'
              }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green) 0%, #2d7a3a 100%)',
        padding: '80px 40px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '48px',
          fontWeight: '700',
          margin: '0 0 16px',
          letterSpacing: '-0.02em'
        }}>
          Ready to grow your brand?
        </h2>
        <p style={{
          fontSize: '21px',
          margin: '0 0 40px',
          opacity: 0.9
        }}>
          Join thousands of athletes building partnerships with top brands.
        </p>
        <Link
          to="/signup"
          style={{
            display: 'inline-block',
            background: 'white',
            color: 'var(--green)',
            padding: '16px 40px',
            borderRadius: '14px',
            fontSize: '17px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Get Started for Free
        </Link>
      </div>

      {/* Footer */}
      <footer style={{
        padding: '60px 40px',
        background: '#1d1d1f',
        color: '#f5f5f7',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/features" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Features</Link>
              <Link to="/pricing" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Pricing</Link>
              <Link to="/demo" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Demo</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Company</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/about" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>About</Link>
              <Link to="/contact" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Contact</Link>
              <Link to="/careers" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Careers</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/blog" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Blog</Link>
              <Link to="/help" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Help Center</Link>
              <Link to="/api" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>API Docs</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/privacy" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Privacy</Link>
              <Link to="/terms" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Terms</Link>
              <Link to="/security" style={{ color: '#86868b', textDecoration: 'none', fontSize: '14px' }}>Security</Link>
            </div>
          </div>
        </div>
        <div style={{
          borderTop: '1px solid #424245',
          paddingTop: '40px',
          fontSize: '12px',
          color: '#86868b'
        }}>
          © 2025 rootd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

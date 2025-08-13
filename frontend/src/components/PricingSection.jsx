import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

const PricingSection = () => {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: t('pricing.starter.title'),
      price: { monthly: 9, yearly: 90 },
      description: t('pricing.starter.desc'),
      features: [
        t('pricing.starter.features.0'),
        t('pricing.starter.features.1'),
        t('pricing.starter.features.2'),
        t('pricing.starter.features.3'),
        t('pricing.starter.features.4')
      ],
      popular: false,
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: t('pricing.professional.title'),
      price: { monthly: 29, yearly: 290 },
      description: t('pricing.professional.desc'),
      features: [
        t('pricing.professional.features.0'),
        t('pricing.professional.features.1'),
        t('pricing.professional.features.2'),
        t('pricing.professional.features.3'),
        t('pricing.professional.features.4'),
        t('pricing.professional.features.5'),
        t('pricing.professional.features.6')
      ],
      popular: true,
      color: "from-purple-500 to-pink-600"
    },
    {
      name: t('pricing.enterprise.title'),
      price: { monthly: 99, yearly: 990 },
      description: t('pricing.enterprise.desc'),
      features: [
        t('pricing.enterprise.features.0'),
        t('pricing.enterprise.features.1'),
        t('pricing.enterprise.features.2'),
        t('pricing.enterprise.features.3'),
        t('pricing.enterprise.features.4'),
        t('pricing.enterprise.features.5'),
        t('pricing.enterprise.features.6'),
        t('pricing.enterprise.features.7')
      ],
      popular: false,
      color: "from-green-500 to-emerald-600"
    }
  ];

  const handleStartTrial = (planName) => {
    alert(`Starting free trial for ${planName} plan...`);
    // Ici vous pourriez rediriger vers un formulaire d'inscription
  };

  const handleContactSales = () => {
    alert('Contacting sales team...');
    // Ici vous pourriez ouvrir un formulaire de contact
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('pricing.title.line1')}
            <span className="block text-blue-600">
              {t('pricing.title.line2')}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.description')}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t('pricing.yearly')}
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {t('pricing.save')}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-purple-300 shadow-2xl shadow-purple-100/50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price[billingCycle]}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingCycle === 'monthly' ? t('pricing.monthly').toLowerCase() : t('pricing.yearly').toLowerCase()}
                  </span>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleStartTrial(plan.name)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {t('pricing.cta.start')}
                </button>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">{t('pricing.features.title')}</h4>
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="text-center mb-16">
          <div className="bg-gray-900 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">
              {t('pricing.enterprise.cta.title')}
            </h3>
            <p className="text-xl mb-8 opacity-90">
              {t('pricing.enterprise.cta.subtitle')}
            </p>
            <button
              onClick={handleContactSales}
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-colors duration-200"
            >
              {t('pricing.enterprise.cta.button')}
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-8">
            {t('pricing.faq.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.cancel.title')}</h4>
              <p className="text-gray-600">{t('pricing.faq.cancel.answer')}</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.payment.title')}</h4>
              <p className="text-gray-600">{t('pricing.faq.payment.answer')}</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.trial.title')}</h4>
              <p className="text-gray-600">{t('pricing.faq.trial.answer')}</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">{t('pricing.faq.refund.title')}</h4>
              <p className="text-gray-600">{t('pricing.faq.refund.answer')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection; 
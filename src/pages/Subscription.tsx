
import { Check, Crown } from 'lucide-react';
import { Layout } from './Layout';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Up to 50 snippets',
      'Public snippets only',
      'Basic search',
      'Community support',
      '5 bookmarks'
    ],
    highlighted: false,
    buttonText: 'Current Plan',
    buttonClass: 'bg-gray-700 text-gray-300 cursor-not-allowed'
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For professional developers',
    features: [
      'Unlimited snippets',
      'Public & private snippets',
      'Advanced search & filtering',
      'Priority support',
      'Unlimited bookmarks',
      'Custom categories',
      'Code analytics',
      'Export snippets'
    ],
    highlighted: true,
    buttonText: 'Upgrade to Pro',
    buttonClass: 'bg-blue-600 text-white hover:bg-blue-700'
  },
  {
    name: 'Team',
    price: '$29',
    period: 'per month',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared snippet libraries',
      'Team analytics',
      'Admin dashboard',
      'SSO authentication',
      'Custom integrations',
      'Dedicated support'
    ],
    highlighted: false,
    buttonText: 'Upgrade to Team',
    buttonClass: 'bg-gray-700 text-gray-300 hover:bg-gray-600'
  }
];

export function Subscription() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-400">
              Unlock premium features and boost your productivity
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-gray-800 border-2 rounded-2xl p-8 ${plan.highlighted
                    ? 'border-blue-500 relative transform scale-105'
                    : 'border-gray-700'
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.buttonClass}`}
                  disabled={plan.name === 'Free'}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Feature</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold">Free</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold">Pro</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold">Team</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6 text-gray-300">Snippets</td>
                    <td className="py-4 px-6 text-center text-gray-400">50</td>
                    <td className="py-4 px-6 text-center text-green-400">Unlimited</td>
                    <td className="py-4 px-6 text-center text-green-400">Unlimited</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6 text-gray-300">Private Snippets</td>
                    <td className="py-4 px-6 text-center text-red-400">✕</td>
                    <td className="py-4 px-6 text-center text-green-400">✓</td>
                    <td className="py-4 px-6 text-center text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6 text-gray-300">Advanced Search</td>
                    <td className="py-4 px-6 text-center text-red-400">✕</td>
                    <td className="py-4 px-6 text-center text-green-400">✓</td>
                    <td className="py-4 px-6 text-center text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6 text-gray-300">Team Collaboration</td>
                    <td className="py-4 px-6 text-center text-red-400">✕</td>
                    <td className="py-4 px-6 text-center text-red-400">✕</td>
                    <td className="py-4 px-6 text-center text-green-400">✓</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-4 px-6 text-gray-300">Analytics</td>
                    <td className="py-4 px-6 text-center text-red-400">✕</td>
                    <td className="py-4 px-6 text-center text-green-400">Basic</td>
                    <td className="py-4 px-6 text-center text-green-400">Advanced</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-300">Support</td>
                    <td className="py-4 px-6 text-center text-gray-400">Community</td>
                    <td className="py-4 px-6 text-center text-gray-400">Priority</td>
                    <td className="py-4 px-6 text-center text-gray-400">Dedicated</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-12 bg-gray-800 border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I change my plan later?</h3>
                <p className="text-gray-400">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-400">
                  We accept all major credit cards, PayPal, and bank transfers for team plans.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
                <p className="text-gray-400">
                  Yes, all paid plans come with a 14-day free trial. No credit card required.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-400">
                  Absolutely! You can cancel your subscription at any time with no penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

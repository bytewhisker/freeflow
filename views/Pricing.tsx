import React, { useState } from 'react';
import { Check, Star, Zap, Shield, HelpCircle } from 'lucide-react';

const Pricing = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const plans = [
        {
            name: 'Starter',
            price: '$0',
            period: '/mo',
            description: 'Perfect for new freelancers just getting started.',
            features: [
                'Up to 2 Active Projects',
                '3 Clients',
                'Basic Invoice Templates',
                'Standard Support'
            ],
            buttonText: 'Current Plan',
            popular: false,
            gradient: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
            textColor: 'text-slate-900 dark:text-white',
            buttonStyle: 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-700'
        },
        {
            name: 'Pro',
            price: billingCycle === 'monthly' ? '$19' : '$15',
            period: '/mo',
            description: 'For full-time freelancers growing their business.',
            features: [
                'Unlimited Projects',
                'Unlimited Clients',
                'Remove "Powered by FreeFlow"',
                'Expense Tracking',
                'Priority Support'
            ],
            buttonText: 'Upgrade to Pro',
            popular: true,
            gradient: 'from-blue-600 to-blue-500',
            textColor: 'text-white',
            buttonStyle: 'bg-white text-blue-600 hover:bg-blue-50 shadow-lg'
        },
        {
            name: 'Agency',
            price: billingCycle === 'monthly' ? '$49' : '$39',
            period: '/mo',
            description: 'Empower your team with advanced collaboration tools.',
            features: [
                'Everything in Pro',
                'Up to 5 Team Members',
                'Team Collaboration',
                'Advanced Reporting',
                'Dedicated Account Manager'
            ],
            buttonText: 'Contact Sales',
            popular: false,
            gradient: 'from-slate-900 to-slate-800 dark:from-slate-950 dark:to-black',
            textColor: 'text-white',
            buttonStyle: 'bg-blue-600 text-white hover:bg-blue-700'
        }
    ];

    const faqs = [
        {
            question: 'Can I cancel anytime?',
            answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.'
        },
        {
            question: 'Is there a free trial for Pro?',
            answer: 'We offer a 14-day money-back guarantee on all paid plans. Try it risk-free.'
        },
        {
            question: 'How do I upgrade?',
            answer: 'Simply click the "Upgrade" button on the plan you want. Your changes will be applied immediately.'
        }
    ];

    return (
        <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="text-center space-y-4 max-w-2xl mx-auto pt-8">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        Choose the perfect plan for your freelance journey. No hidden fees.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex justify-center items-center gap-4 pt-6">
                        <span className={`text-sm font-semibold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
                        <button
                            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                            className="relative w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full transition-colors focus:outline-none"
                        >
                            <div
                                className={`absolute top-1 left-1 w-6 h-6 bg-white dark:bg-blue-600 rounded-full shadow-sm transition-transform duration-200 transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                        <span className={`text-sm font-semibold ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            Yearly <span className="text-green-500 text-xs font-bold ml-1">(Save 20%)</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 px-2 md:px-0">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-[32px] p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-2
                ${plan.popular ? 'shadow-2xl shadow-blue-500/20 ring-4 ring-blue-500/10 z-10' : 'border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900/50'}
                ${plan.popular ? `bg-gradient-to-b ${plan.gradient}` : ''}
              `}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                                    <Star size={14} fill="currentColor" /> Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                    {plan.name}
                                </h3>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-4xl font-normal ${plan.popular ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                        {plan.price}
                                    </span>
                                    <span className={`text-sm font-medium ${plan.popular ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {plan.period}
                                    </span>
                                </div>
                                <p className={`mt-4 text-sm leading-relaxed ${plan.popular ? 'text-blue-50' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`mt-0.5 p-0.5 rounded-full ${plan.popular ? 'bg-blue-400/30 text-white' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className={`text-sm font-medium ${plan.popular ? 'text-blue-50' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button className={`w-full py-4 rounded-2xl font-bold text-sm transition-transform active:scale-95 ${plan.buttonStyle}`}>
                                {plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Features Comparison / Details */}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <Shield className="text-blue-600" /> Enterprise-grade security
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                                We take security seriously. All your data is encrypted at rest and in transit.
                                We perform regular automated backups and security audits to ensure your business data remains safe.
                            </p>
                            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                                <li className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /> SSL Encryption</li>
                                <li className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Regular Backups</li>
                                <li className="flex items-center gap-2"><Zap size={16} className="text-amber-500" /> 99.9% Uptime SLA</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <HelpCircle className="text-blue-600" /> Frequently Asked Questions
                            </h3>
                            <div className="space-y-6">
                                {faqs.map((faq, i) => (
                                    <div key={i}>
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-1">{faq.question}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{faq.answer}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Pricing;

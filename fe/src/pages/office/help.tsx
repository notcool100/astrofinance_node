import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import Card from '@/components/common/Card';
import {
    QuestionMarkCircleIcon,
    EnvelopeIcon,
    PhoneIcon,
    BookOpenIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const HelpPage = () => {
    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "You can reset your password by going to the Profile page and clicking on the 'Change Password' button."
        },
        {
            question: "Where can I view my loan details?",
            answer: "Navigate to the 'Loans' section in the sidebar to view all your active and closed loans."
        },
        {
            question: "How do I contact support?",
            answer: "You can contact support via email at nepalubuck@gmail.com or by calling our hotline."
        },
        {
            question: "Can I update my personal information?",
            answer: "Yes, you can update your profile information in the Settings > Profile section."
        }
    ];

    return (
        <MainLayout title="Help Center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                {/* Header Section */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        How can we help you?
                    </h2>
                    <p className="mt-4 text-lg text-gray-500">
                        Find answers to common questions or get in touch with our support team.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* FAQ Section */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                            <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-primary-600" />
                            Frequently Asked Questions
                        </h3>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <Card key={index} className="p-4 hover:shadow-md transition-shadow">
                                    <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Contact & Resources Section */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                            <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2 text-primary-600" />
                            Contact & Resources
                        </h3>

                        <Card className="p-6">
                            <h4 className="font-medium text-gray-900 mb-4">Contact Support</h4>
                            <div className="space-y-4">
                                <div className="flex items-center text-gray-600">
                                    <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-400" />
                                    <span>nepalubuck@gmail.com</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <PhoneIcon className="h-5 w-5 mr-3 text-gray-400" />
                                    <span>01-4501011</span>
                                </div>
                            </div>
                        </Card>

                        {/* <Card className="p-6">
                            <h4 className="font-medium text-gray-900 mb-4">Resources</h4>
                            <div className="space-y-3">
                                <a href="#" className="flex items-center text-primary-600 hover:text-primary-800 transition-colors">
                                    <BookOpenIcon className="h-5 w-5 mr-3" />
                                    <span>User Guide</span>
                                </a>
                                <a href="#" className="flex items-center text-primary-600 hover:text-primary-800 transition-colors">
                                    <BookOpenIcon className="h-5 w-5 mr-3" />
                                    <span>API Documentation</span>
                                </a>
                                <a href="#" className="flex items-center text-primary-600 hover:text-primary-800 transition-colors">
                                    <BookOpenIcon className="h-5 w-5 mr-3" />
                                    <span>Terms of Service</span>
                                </a>
                            </div>
                        </Card> */}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default HelpPage;

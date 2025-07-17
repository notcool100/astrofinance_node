import React, { ReactNode } from 'react';
import Head from 'next/head';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title = 'AstroFinance - Authentication'
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="AstroFinance authentication page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="mx-auto h-12 w-48 relative">
            <Image
              src="/logo.png"
              alt="AstroFinance"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {title}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
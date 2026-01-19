import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";

const Custom404: React.FC = () => {
	const router = useRouter();

	return (
		<MainLayout>
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
					<div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
						<svg
							className="w-8 h-8 text-blue-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="404 icon"
						>
							<title>404 Not Found icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
						</svg>
					</div>
					<h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
					<h2 className="text-2xl font-semibold text-gray-700 mb-2">
						Page Not Found
					</h2>
					<p className="text-gray-600 mb-8">
						Sorry, we couldn't find the page you're looking for. The page might
						have been moved, deleted, or you entered the wrong URL.
					</p>
					<div className="space-y-3">
						<button
							type="button"
							onClick={() => router.back()}
							className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
						>
							Go Back
						</button>
						<Link
							href="/"
							className="block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
						>
							Go Home
						</Link>
					</div>
				</div>
			</div>
		</MainLayout>
	);
};

export async function getStaticProps({ locale }: { locale: string }) {
	return {
		props: {
			...(await import('next-i18next/serverSideTranslations').then(m =>
				m.serverSideTranslations(locale, ['common', 'auth', 'user'])
			)),
		},
	};
}

export default Custom404;

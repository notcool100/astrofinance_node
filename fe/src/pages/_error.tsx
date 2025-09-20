import React from "react";
import type { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";

interface ErrorPageProps {
	statusCode?: number;
	hasGetInitialPropsRun?: boolean;
	err?: Error;
}

const ErrorPage = ({
	statusCode,
	hasGetInitialPropsRun,
	err,
}: ErrorPageProps) => {
	const router = useRouter();

	// If this is a client-side error and we haven't run getInitialProps yet,
	// we can still show a fallback UI
	if (!hasGetInitialPropsRun && err) {
		return (
			<MainLayout>
				<div className="min-h-screen flex items-center justify-center bg-gray-50">
					<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
						<div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
							<svg
								className="w-8 h-8 text-red-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-label="Error icon"
							>
								<title>Error icon</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-gray-900 mb-2">
							Something went wrong
						</h1>
						<p className="text-gray-600 mb-6">
							An unexpected error occurred. Please try refreshing the page.
						</p>
						<div className="space-y-3">
							<button
								type="button"
								onClick={() => router.reload()}
								className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
							>
								Refresh Page
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
	}

	const getErrorMessage = () => {
		switch (statusCode) {
			case 404:
				return {
					title: "Page Not Found",
					message: "The page you are looking for does not exist.",
					icon: "M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z",
				};
			case 500:
				return {
					title: "Server Error",
					message: "Something went wrong on our end. Please try again later.",
					icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
				};
			default:
				return {
					title: "An Error Occurred",
					message: "Something went wrong. Please try again.",
					icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z",
				};
		}
	};

	const errorInfo = getErrorMessage();

	return (
		<MainLayout>
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
					<div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
						<svg
							className="w-8 h-8 text-red-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-label="Error icon"
						>
							<title>Error icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d={errorInfo.icon}
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						{errorInfo.title}
					</h1>
					<p className="text-gray-600 mb-6">{errorInfo.message}</p>
					{statusCode && (
						<p className="text-sm text-gray-500 mb-6">
							Error Code: {statusCode}
						</p>
					)}
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

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
	const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
	return { statusCode, hasGetInitialPropsRun: true };
};

export default ErrorPage;

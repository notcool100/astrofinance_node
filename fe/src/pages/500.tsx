import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";

const Custom500: React.FC = () => {
	const router = useRouter();

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
							<title>Server Error icon</title>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
					</div>
					<h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
					<h2 className="text-2xl font-semibold text-gray-700 mb-2">
						Server Error
					</h2>
					<p className="text-gray-600 mb-8">
						Something went wrong on our end. We're working to fix this issue.
						Please try again later.
					</p>
					<div className="space-y-3">
						<button
							type="button"
							onClick={() => router.reload()}
							className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
						>
							Try Again
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

export default Custom500;

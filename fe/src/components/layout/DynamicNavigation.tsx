import {
	AcademicCapIcon,
	BanknotesIcon,
	BellIcon,
	BookOpenIcon,
	BuildingLibraryIcon,
	CalculatorIcon,
	ChartBarIcon,
	ClipboardDocumentListIcon,
	ClockIcon,
	Cog6ToothIcon,
	CogIcon,
	CurrencyDollarIcon,
	DocumentIcon,
	DocumentTextIcon,
	EnvelopeIcon,
	HomeIcon,
	QuestionMarkCircleIcon,
	ReceiptPercentIcon,
	ShieldCheckIcon,
	UserCircleIcon,
	UserGroupIcon,
	UsersIcon,
	WrenchScrewdriverIcon,
	ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import navigationService from "@/services/navigationService";

// Map of icon names to icon components
const iconMap: Record<
	string,
	React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>
> = {
	dashboard: HomeIcon,
	home: HomeIcon,
	users: UsersIcon,
	people: UsersIcon,
	user: UserCircleIcon,
	profile: UserCircleIcon,
	loans: BanknotesIcon,
	loan: BanknotesIcon,
	monetization_on: BanknotesIcon,
	accounting: CalculatorIcon,
	calculator: CalculatorIcon,
	applications: DocumentTextIcon,
	description: DocumentTextIcon,
	document: DocumentIcon,
	expenses: CurrencyDollarIcon,
	currency_rupee: CurrencyDollarIcon,
	money: CurrencyDollarIcon,
	reports: ChartBarIcon,
	analytics: ChartBarIcon,
	chart: ChartBarIcon,
	settings: Cog6ToothIcon,
	cog: CogIcon,
	notifications: BellIcon,
	bell: BellIcon,
	help: QuestionMarkCircleIcon,
	question: QuestionMarkCircleIcon,
	education: AcademicCapIcon,
	bank: BuildingLibraryIcon,
	account_balance: BuildingLibraryIcon,
	list: ClipboardDocumentListIcon,
	clock: ClockIcon,
	schedule: ClockIcon,
	mail: EnvelopeIcon,
	email: EnvelopeIcon,
	tax: ReceiptPercentIcon,
	receipt: ReceiptPercentIcon,
	security: ShieldCheckIcon,
	admin_panel_settings: ShieldCheckIcon,
	staff: UserGroupIcon,
	team: UserGroupIcon,
	tools: WrenchScrewdriverIcon,
	maintenance: WrenchScrewdriverIcon,
	sms: ChatBubbleLeftRightIcon,
	message: ChatBubbleLeftRightIcon,
	chat: ChatBubbleLeftRightIcon,
};

// Default icon to use if the icon name is not found in the map
const DefaultIcon = QuestionMarkCircleIcon;

interface ApiNavigationItem {
	id: string;
	label: string;
	icon?: string;
	url?: string;
	order: number;
	parentId?: string;
	groupId?: string;
	children?: ApiNavigationItem[];
}

interface ApiNavigationGroup {
	id: string;
	name: string;
	order: number;
	items: ApiNavigationItem[];
}

interface NavigationItem {
	id?: string;
	name: string;
	href: string;
	icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
	current: boolean;
	children?: NavigationItem[];
}

function classNames(...classes: string[]) {
	return classes.filter(Boolean).join(" ");
}

// Helper function to determine if a navigation item is active
function isActive(itemPath: string, currentPath: string): boolean {
	console.log(
		`Checking if ${itemPath} is active for current path ${currentPath}`,
	);

	// Ensure paths start with a slash for consistent comparison
	let normalizedItemPath = itemPath;
	if (
		normalizedItemPath &&
		normalizedItemPath !== "#" &&
		!normalizedItemPath.startsWith("/")
	) {
		normalizedItemPath = "/" + normalizedItemPath;
	}

	// Normalize paths for comparison
	normalizedItemPath = normalizedItemPath.endsWith("/")
		? normalizedItemPath.slice(0, -1)
		: normalizedItemPath;
	const normalizedCurrentPath = currentPath.endsWith("/")
		? currentPath.slice(0, -1)
		: currentPath;

	// Exact match
	if (normalizedItemPath === normalizedCurrentPath) {
		console.log(
			`✅ Exact match: ${normalizedItemPath} === ${normalizedCurrentPath}`,
		);
		return true;
	}

	// Special case for problematic paths like /user and /users
	// These should only match exactly, not as prefixes
	const problematicPaths = ["/user", "/users", "/staff", "/team"];
	if (
		problematicPaths.includes(normalizedItemPath) ||
		problematicPaths.includes(normalizedCurrentPath)
	) {
		console.log(
			`❌ Problematic path requires exact match: ${normalizedItemPath} vs ${normalizedCurrentPath}`,
		);
		return false;
	}

	// Skip special paths
	if (normalizedItemPath === "#" || normalizedItemPath === "/") {
		console.log(`❌ Special path: ${normalizedItemPath}`);
		return false;
	}

	// For paths with specific IDs (e.g., /users/123), we want to highlight the parent
	// Only if the parent path is not just a root path
	if (
		normalizedItemPath.length > 1 &&
		normalizedCurrentPath.startsWith(normalizedItemPath + "/")
	) {
		// Check if this is a detail page pattern
		const remainingPath = normalizedCurrentPath.substring(
			normalizedItemPath.length + 1,
		);
		// If the remaining path looks like an ID (no additional slashes), consider it active
		if (remainingPath && !remainingPath.includes("/")) {
			// Additional check for problematic paths
			const itemLastSegment = normalizedItemPath.split("/").pop() || "";
			const currentParentSegment =
				normalizedCurrentPath.split("/").slice(0, -1).pop() || "";

			// Make sure we're not matching partial segments (e.g., /user shouldn't match /users/123)
			if (itemLastSegment === currentParentSegment) {
				console.log(
					`✅ Detail page match: ${normalizedItemPath} is parent of ${normalizedCurrentPath}`,
				);
				return true;
			} else {
				console.log(
					`❌ Detail page segment mismatch: ${itemLastSegment} !== ${currentParentSegment}`,
				);
				return false;
			}
		}
	}

	// Check for path segments to avoid partial matches
	// For example, /user should not match /users
	const itemSegments = normalizedItemPath.split("/").filter(Boolean);
	const currentSegments = normalizedCurrentPath.split("/").filter(Boolean);

	// Special case for common prefixes like "user" vs "users"
	// This prevents /users from matching when /user is the current path and vice versa
	if (itemSegments.length > 0 && currentSegments.length > 0) {
		const itemFirstSegment = itemSegments[0];
		const currentFirstSegment = currentSegments[0];

		// Check if one is a prefix of the other but not exactly the same
		if (itemFirstSegment !== currentFirstSegment) {
			// Allow exact matches only - don't match partial segments
			if (itemFirstSegment !== currentFirstSegment) {
				console.log(
					`❌ First segment mismatch: ${itemFirstSegment} !== ${currentFirstSegment}`,
				);
				return false;
			}
		}
	}

	// Final check: For navigation items, we want exact path matching
	// This ensures that similar paths like /user and /users don't both get highlighted
	const itemPathSegments = normalizedItemPath.split("/").filter(Boolean);
	const currentPathSegments = normalizedCurrentPath.split("/").filter(Boolean);

	// If the segments don't match exactly, it's not active
	if (itemPathSegments.length !== currentPathSegments.length) {
		console.log(
			`❌ Path segment count mismatch: ${itemPathSegments.length} !== ${currentPathSegments.length}`,
		);
		return false;
	}

	// Check each segment
	for (let i = 0; i < itemPathSegments.length; i++) {
		if (itemPathSegments[i] !== currentPathSegments[i]) {
			console.log(
				`❌ Path segment mismatch at position ${i}: ${itemPathSegments[i]} !== ${currentPathSegments[i]}`,
			);
			return false;
		}
	}

	console.log(
		`❌ No match: ${normalizedItemPath} !== ${normalizedCurrentPath}`,
	);
	return false;
}

const DynamicNavigation: React.FC = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [apiNavGroups, setApiNavGroups] = useState<ApiNavigationGroup[]>([]);

	// Fetch navigation items directly from API
	useEffect(() => {
		const fetchNavigation = async () => {
			try {
				// First try to get from auth context
				const navFromAuth = user?.navigation || [];

				if (navFromAuth && navFromAuth.length > 0) {
					console.log("Using navigation from auth context:", navFromAuth);
					setApiNavGroups(navFromAuth as unknown as ApiNavigationGroup[]);
				} else {
					// If not available, fetch directly from API
					console.log("Fetching navigation from API...");
					const navFromApi = await navigationService.getUserNavigation();
					console.log("Navigation fetched from API:", navFromApi);
					setApiNavGroups(navFromApi as unknown as ApiNavigationGroup[]);
				}
			} catch (error) {
				console.error("Error fetching navigation:", error);
			}
		};

		fetchNavigation();
	}, [user?.id]);

	// Convert API navigation groups to our format
	const navigationGroups = useMemo(() => {
		console.log("Processing navigation groups:", apiNavGroups);

		// Process each navigation group
		return apiNavGroups.map((group) => {
			// Process items in this group
			const processedItems = group.items.map((item) => {
				// Convert API URL to our format
				let href = item.url || "#";
				// Ensure URLs start with a slash for proper routing
				if (href && href !== "#" && !href.startsWith("/")) {
					href = "/" + href;
				}
				// Prefix admin routes
				if (
					href.startsWith("/roles") ||
					href.startsWith("/navigation") ||
					href.startsWith("/settings") ||
					href.startsWith("/sms") ||
					href.startsWith("/tax")
				) {
					href = "/admin" + href;
				}
				console.log(`Original href: ${href} (normalized)`);

				// Get icon component from map or use default
				const iconName = item.icon?.toLowerCase() || "";
				const IconComponent = iconMap[iconName] || DefaultIcon;

				console.log(
					`Processing nav item: ${item.label}, icon: ${iconName}, url: ${href}`,
				);

				return {
					id: item.id,
					name: item.label,
					href,
					icon: IconComponent,
					current: isActive(href, router.pathname),
					children: (item.children as any)?.map((child: any) => {
						// Process child items
						let childHref = child.url || "#";
						// Ensure child URLs also start with a slash
						if (childHref && childHref !== "#" && !childHref.startsWith("/")) {
							childHref = "/" + childHref;
						}
						if (
							childHref.startsWith("/roles") ||
							childHref.startsWith("/navigation") ||
							childHref.startsWith("/settings") ||
							childHref.startsWith("/sms") ||
							childHref.startsWith("/tax")
						) {
							childHref = "/admin" + childHref;
						}
						console.log(`Original child href: ${childHref} (normalized)`);

						const childIconName = child.icon?.toLowerCase() || "";
						const ChildIconComponent = iconMap[childIconName] || DefaultIcon;

						return {
							id: child.id,
							name: child.label,
							href: childHref,
							icon: ChildIconComponent,
							current: isActive(childHref, router.pathname),
						};
					}),
				};
			});

			return {
				id: group.id,
				name: group.name,
				items: processedItems,
			};
		});
	}, [apiNavGroups, router.pathname]);

	return (
		<nav className="flex flex-1 flex-col">
			<ul role="list" className="flex flex-1 flex-col gap-y-7">
				{navigationGroups.map((group) => (
					<li key={group.id}>
						<div className="text-xs font-semibold leading-6 text-primary-400 uppercase px-2 mb-1">
							{group.name}
						</div>
						<ul role="list" className="-mx-2 space-y-1">
							{group.items.map((item) => (
								<li key={(item as any).id || item.name}>
									{!(item as any).children ||
									(item as any).children.length === 0 ? (
										<Link
											href={item.href}
											className={classNames(
												item.current
													? "bg-primary-800 text-white"
													: "text-primary-200 hover:text-white hover:bg-primary-800",
												"group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
											)}
										>
											<item.icon
												className={classNames(
													item.current
														? "text-white"
														: "text-primary-200 group-hover:text-white",
													"h-6 w-6 shrink-0",
												)}
												aria-hidden="true"
											/>
											{item.name}
										</Link>
									) : (
										<div>
											<button
												type="button"
												className={classNames(
													item.current
														? "bg-primary-800 text-white"
														: "text-primary-200 hover:text-white hover:bg-primary-800",
													"group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold",
												)}
											>
												<item.icon
													className={classNames(
														item.current
															? "text-white"
															: "text-primary-200 group-hover:text-white",
														"h-6 w-6 shrink-0",
													)}
													aria-hidden="true"
												/>
												{item.name}
											</button>
											{/* Submenu for children */}
											<ul className="mt-1 pl-8 space-y-1">
												{((item as any).children || []).map((child: any) => (
													<li key={child.id}>
														<Link
															href={child.href}
															className={classNames(
																child.current
																	? "bg-primary-700 text-white"
																	: "text-primary-300 hover:text-white hover:bg-primary-700",
																"group flex gap-x-3 rounded-md p-2 text-sm leading-6",
															)}
														>
															<child.icon
																className={classNames(
																	child.current
																		? "text-white"
																		: "text-primary-300 group-hover:text-white",
																	"h-5 w-5 shrink-0",
																)}
																aria-hidden="true"
															/>
															{child.name}
														</Link>
													</li>
												))}
											</ul>
										</div>
									)}
								</li>
							))}
						</ul>
					</li>
				))}
				<li className="mt-auto">
					<Link
						href="/office/help"
						className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-primary-200 hover:bg-primary-800 hover:text-white"
					>
						<QuestionMarkCircleIcon className="h-6 w-6 shrink-0 text-primary-200 group-hover:text-white" />
						Help
					</Link>
				</li>
			</ul>
		</nav>
	);
};

export default DynamicNavigation;

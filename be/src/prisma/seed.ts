import {
	AccountType_COA,
	ExpenseCategoryType,
	InterestType,
	PrismaClient,
	StaffStatus,
} from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
	console.log("Starting database seeding...");

	// Clean up existing data if needed
	await cleanupDatabase();

	// Seed admin users
	await seedAdminUsers();

	// Seed roles and permissions
	await seedRolesAndPermissions();

	// Seed navigation
	await seedNavigation();

	// Seed staff users
	await seedStaffUsers();

	// Seed loan types
	await seedLoanTypes();

	// Seed chart of accounts
	await seedChartOfAccounts();

	// Seed SMS templates and events
	await seedSmsTemplates();

	// Seed tax types and rates
	await seedTaxTypes();

	// Seed expense categories
	await seedExpenseCategories();

	// Seed report templates
	await seedReportTemplates();

	console.log("Database seeding completed successfully!");
}

async function cleanupDatabase() {
	// This is a safe cleanup for development environments
	// Be careful with this in production!
	console.log("Cleaning up existing data...");

	// The order matters due to foreign key constraints
	await prisma.adminUserRole.deleteMany({});
	await prisma.rolePermission.deleteMany({});
	await prisma.roleNavigation.deleteMany({});
	await prisma.navigationItem.deleteMany({});
	await prisma.navigationGroup.deleteMany({});
	await prisma.permission.deleteMany({});
	await prisma.role.deleteMany({});
	await prisma.adminUser.deleteMany({});
	await prisma.staffRole.deleteMany({});
	await prisma.staffDocument.deleteMany({});
	await prisma.staff.deleteMany({});
	await prisma.loanType.deleteMany({});
	await prisma.account_COA.deleteMany({});
	await prisma.smsTemplate.deleteMany({});
	await prisma.smsEvent.deleteMany({});
	await prisma.taxRate.deleteMany({});
	await prisma.taxType.deleteMany({});
	await prisma.expenseCategory.deleteMany({});
	await prisma.reportTemplate.deleteMany({});
}

async function seedAdminUsers() {
	console.log("Seeding admin users...");

	// Create default admin user
	const passwordHash = await bcrypt.hash("Admin@123", 10);

	const adminUser = await prisma.adminUser.create({
		data: {
			username: "admin",
			email: "admin@astrofinance.com",
			passwordHash,
			fullName: "System Administrator",
			isActive: true,
		},
	});

	console.log(`Created admin user: ${adminUser.username}`);

	// Create additional admin users
	const users = [
		{
			username: "manager",
			email: "manager@astrofinance.com",
			passwordHash,
			fullName: "Branch Manager",
			isActive: true,
		},
		{
			username: "accountant",
			email: "accountant@astrofinance.com",
			passwordHash,
			fullName: "System Accountant",
			isActive: true,
		},
		{
			username: "loan_officer",
			email: "loan@astrofinance.com",
			passwordHash,
			fullName: "Loan Officer",
			isActive: true,
		},
	];

	for (const user of users) {
		await prisma.adminUser.create({ data: user });
		console.log(`Created admin user: ${user.username}`);
	}
}

async function seedRolesAndPermissions() {
	console.log("Seeding roles and permissions...");

	// Create roles
	const roles = [
		{
			name: "Super Admin",
			description: "Has access to all system features",
			isSystem: true,
		},
		{
			name: "Branch Manager",
			description: "Manages branch operations",
			isSystem: true,
		},
		{
			name: "Accountant",
			description: "Handles accounting and financial operations",
			isSystem: true,
		},
		{
			name: "Loan Officer",
			description: "Processes loan applications and manages loans",
			isSystem: true,
		},
		{
			name: "Teller",
			description: "Handles cash transactions and customer service",
			isSystem: true,
		},
	];

	for (const role of roles) {
		await prisma.role.create({ data: role });
		console.log(`Created role: ${role.name}`);
	}

	// Create permissions
	const modules = [
		"users",
		"accounts",
		"loans",
		"accounting",
		"reports",
		"settings",
		"admin",
		"sms",
		"tax",
		"expenses",
		"staff",
	];

	const actions = ["view", "create", "edit", "delete", "approve"];

	for (const module of modules) {
		for (const action of actions) {
			const code = `${module}.${action}`;
			await prisma.permission.create({
				data: {
					code,
					description: `Permission to ${action} ${module}`,
					module,
					action,
				},
			});
			console.log(`Created permission: ${code}`);
		}
	}

	// Assign permissions to roles
	const superAdmin = await prisma.role.findFirst({
		where: { name: "Super Admin" },
	});
	const branchManager = await prisma.role.findFirst({
		where: { name: "Branch Manager" },
	});
	const accountant = await prisma.role.findFirst({
		where: { name: "Accountant" },
	});
	const loanOfficer = await prisma.role.findFirst({
		where: { name: "Loan Officer" },
	});

	if (superAdmin) {
		// Assign all permissions to Super Admin
		const allPermissions = await prisma.permission.findMany();
		for (const permission of allPermissions) {
			await prisma.rolePermission.create({
				data: {
					roleId: superAdmin.id,
					permissionId: permission.id,
				},
			});
		}
		console.log("Assigned all permissions to Super Admin");
	}

	// Assign admin user to Super Admin role
	const admin = await prisma.adminUser.findFirst({
		where: { username: "admin" },
	});
	if (admin && superAdmin) {
		await prisma.adminUserRole.create({
			data: {
				adminUserId: admin.id,
				roleId: superAdmin.id,
			},
		});
		console.log("Assigned admin user to Super Admin role");
	}

	// Assign other users to their respective roles
	const manager = await prisma.adminUser.findFirst({
		where: { username: "manager" },
	});
	if (manager && branchManager) {
		await prisma.adminUserRole.create({
			data: {
				adminUserId: manager.id,
				roleId: branchManager.id,
			},
		});
		console.log("Assigned manager user to Branch Manager role");
	}

	const accountantUser = await prisma.adminUser.findFirst({
		where: { username: "accountant" },
	});
	if (accountantUser && accountant) {
		await prisma.adminUserRole.create({
			data: {
				adminUserId: accountantUser.id,
				roleId: accountant.id,
			},
		});
		console.log("Assigned accountant user to Accountant role");
	}

	const loanOfficerUser = await prisma.adminUser.findFirst({
		where: { username: "loan_officer" },
	});
	if (loanOfficerUser && loanOfficer) {
		await prisma.adminUserRole.create({
			data: {
				adminUserId: loanOfficerUser.id,
				roleId: loanOfficer.id,
			},
		});
		console.log("Assigned loan_officer user to Loan Officer role");
	}
}

async function seedNavigation() {
	console.log("Seeding navigation...");

	// Create navigation groups
	const groups = [
		{ name: "Dashboard", description: "Dashboard and analytics", order: 1 },
		{
			name: "User Management",
			description: "User and account management",
			order: 2,
		},
		{
			name: "Loan Management",
			description: "Loan processing and management",
			order: 3,
		},
		{
			name: "Accounting",
			description: "Accounting and financial operations",
			order: 4,
		},
		{ name: "Reports", description: "Reports and analytics", order: 5 },
		{ name: "Administration", description: "System administration", order: 6 },
	];

	for (const group of groups) {
		await prisma.navigationGroup.create({ data: group });
		console.log(`Created navigation group: ${group.name}`);
	}

	// Get created groups
	const dashboardGroup = await prisma.navigationGroup.findFirst({
		where: { name: "Dashboard" },
	});
	const userGroup = await prisma.navigationGroup.findFirst({
		where: { name: "User Management" },
	});
	const loanGroup = await prisma.navigationGroup.findFirst({
		where: { name: "Loan Management" },
	});
	const accountingGroup = await prisma.navigationGroup.findFirst({
		where: { name: "Accounting" },
	});
	const reportsGroup = await prisma.navigationGroup.findFirst({
		where: { name: "Reports" },
	});
	const adminGroup = await prisma.navigationGroup.findFirst({
		where: { name: "Administration" },
	});

	// Create navigation items
	if (dashboardGroup) {
		await prisma.navigationItem.create({
			data: {
				label: "Dashboard",
				icon: "dashboard",
				url: "/dashboard",
				order: 1,
				groupId: dashboardGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Analytics",
				icon: "analytics",
				url: "/analytics",
				order: 2,
				groupId: dashboardGroup.id,
			},
		});
	}

	if (userGroup) {
		await prisma.navigationItem.create({
			data: {
				label: "Users",
				icon: "people",
				url: "/users",
				order: 1,
				groupId: userGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Accounts",
				icon: "account_balance",
				url: "/accounts",
				order: 2,
				groupId: userGroup.id,
			},
		});
	}

	if (loanGroup) {
		await prisma.navigationItem.create({
			data: {
				label: "Loan Applications",
				icon: "description",
				url: "/loan-applications",
				order: 1,
				groupId: loanGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Active Loans",
				icon: "monetization_on",
				url: "/loans",
				order: 2,
				groupId: loanGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Loan Types",
				icon: "category",
				url: "/loan-types",
				order: 3,
				groupId: loanGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "EMI Calculator",
				icon: "calculate",
				url: "/emi-calculator",
				order: 4,
				groupId: loanGroup.id,
			},
		});
	}

	if (accountingGroup) {
		await prisma.navigationItem.create({
			data: {
				label: "Chart of Accounts",
				icon: "account_tree",
				url: "/chart-of-accounts",
				order: 1,
				groupId: accountingGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Journal Entries",
				icon: "book",
				url: "/journal-entries",
				order: 2,
				groupId: accountingGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Day Book",
				icon: "today",
				url: "/day-book",
				order: 3,
				groupId: accountingGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Financial Reports",
				icon: "assessment",
				url: "/financial-reports",
				order: 4,
				groupId: accountingGroup.id,
			},
		});
	}

	if (reportsGroup) {
		await prisma.navigationItem.create({
			data: {
				label: "Report Templates",
				icon: "description",
				url: "/report-templates",
				order: 1,
				groupId: reportsGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Generate Reports",
				icon: "play_arrow",
				url: "/generate-reports",
				order: 2,
				groupId: reportsGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Scheduled Reports",
				icon: "schedule",
				url: "/scheduled-reports",
				order: 3,
				groupId: reportsGroup.id,
			},
		});
	}

	if (adminGroup) {
		await prisma.navigationItem.create({
			data: {
				label: "Staff",
				icon: "people",
				url: "/staff",
				order: 1,
				groupId: adminGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Roles & Permissions",
				icon: "security",
				url: "/roles",
				order: 2,
				groupId: adminGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Navigation Management",
				icon: "menu",
				url: "/navigation",
				order: 3,
				groupId: adminGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "System Settings",
				icon: "settings",
				url: "/settings",
				order: 4,
				groupId: adminGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "SMS Templates",
				icon: "sms",
				url: "/sms-templates",
				order: 5,
				groupId: adminGroup.id,
			},
		});

		await prisma.navigationItem.create({
			data: {
				label: "Tax Settings",
				icon: "receipt",
				url: "/tax-settings",
				order: 6,
				groupId: adminGroup.id,
			},
		});
	}

	console.log("Navigation items created successfully");

	// Assign navigation to roles
	const superAdmin = await prisma.role.findFirst({
		where: { name: "Super Admin" },
	});
	if (superAdmin) {
		const allNavItems = await prisma.navigationItem.findMany();
		for (const item of allNavItems) {
			await prisma.roleNavigation.create({
				data: {
					roleId: superAdmin.id,
					navigationItemId: item.id,
				},
			});
		}
		console.log("Assigned all navigation items to Super Admin role");
	}
}

async function seedLoanTypes() {
	console.log("Seeding loan types...");

	const loanTypes = [
		{
			name: "Personal Loan",
			code: "PL",
			interestType: InterestType.FLAT,
			minAmount: 10000,
			maxAmount: 500000,
			minTenure: 3,
			maxTenure: 36,
			interestRate: 12.5,
			processingFeePercent: 1.0,
			lateFeeAmount: 500,
			isActive: true,
		},
		{
			name: "Business Loan",
			code: "BL",
			interestType: InterestType.DIMINISHING,
			minAmount: 50000,
			maxAmount: 2000000,
			minTenure: 6,
			maxTenure: 60,
			interestRate: 14.0,
			processingFeePercent: 1.5,
			lateFeeAmount: 1000,
			isActive: true,
		},
		{
			name: "Education Loan",
			code: "EL",
			interestType: InterestType.DIMINISHING,
			minAmount: 25000,
			maxAmount: 1000000,
			minTenure: 12,
			maxTenure: 84,
			interestRate: 10.0,
			processingFeePercent: 0.5,
			lateFeeAmount: 300,
			isActive: true,
		},
		{
			name: "Home Loan",
			code: "HL",
			interestType: InterestType.DIMINISHING,
			minAmount: 500000,
			maxAmount: 10000000,
			minTenure: 12,
			maxTenure: 240,
			interestRate: 8.5,
			processingFeePercent: 0.75,
			lateFeeAmount: 2000,
			isActive: true,
		},
		{
			name: "Vehicle Loan",
			code: "VL",
			interestType: InterestType.DIMINISHING,
			minAmount: 100000,
			maxAmount: 3000000,
			minTenure: 12,
			maxTenure: 84,
			interestRate: 9.5,
			processingFeePercent: 1.0,
			lateFeeAmount: 1000,
			isActive: true,
		},
	];

	for (const loanType of loanTypes) {
		await prisma.loanType.create({ data: loanType });
		console.log(`Created loan type: ${loanType.name}`);
	}
}

async function seedChartOfAccounts() {
	console.log("Seeding chart of accounts...");

	// Create main account categories
	const mainAccounts = [
		{
			accountCode: "1000",
			name: "Assets",
			accountType: AccountType_COA.ASSET,
			description: "Asset accounts",
		},
		{
			accountCode: "2000",
			name: "Liabilities",
			accountType: AccountType_COA.LIABILITY,
			description: "Liability accounts",
		},
		{
			accountCode: "3000",
			name: "Equity",
			accountType: AccountType_COA.EQUITY,
			description: "Equity accounts",
		},
		{
			accountCode: "4000",
			name: "Income",
			accountType: AccountType_COA.INCOME,
			description: "Income accounts",
		},
		{
			accountCode: "5000",
			name: "Expenses",
			accountType: AccountType_COA.EXPENSE,
			description: "Expense accounts",
		},
	];

	for (const account of mainAccounts) {
		await prisma.account_COA.create({ data: account });
		console.log(`Created main account: ${account.name}`);
	}

	// Get created main accounts
	const assets = await prisma.account_COA.findFirst({
		where: { accountCode: "1000" },
	});
	const liabilities = await prisma.account_COA.findFirst({
		where: { accountCode: "2000" },
	});
	const equity = await prisma.account_COA.findFirst({
		where: { accountCode: "3000" },
	});
	const income = await prisma.account_COA.findFirst({
		where: { accountCode: "4000" },
	});
	const expenses = await prisma.account_COA.findFirst({
		where: { accountCode: "5000" },
	});

	// Create sub-accounts
	if (assets) {
		const assetSubAccounts = [
			{
				accountCode: "1100",
				name: "Cash and Cash Equivalents",
				accountType: AccountType_COA.ASSET,
				parentId: assets.id,
			},
			{
				accountCode: "1200",
				name: "Loans Receivable",
				accountType: AccountType_COA.ASSET,
				parentId: assets.id,
			},
			{
				accountCode: "1300",
				name: "Fixed Assets",
				accountType: AccountType_COA.ASSET,
				parentId: assets.id,
			},
		];

		for (const account of assetSubAccounts) {
			await prisma.account_COA.create({ data: account });
			console.log(`Created asset sub-account: ${account.name}`);
		}

		// Get cash and cash equivalents account
		const cashAccount = await prisma.account_COA.findFirst({
			where: { accountCode: "1100" },
		});
		if (cashAccount) {
			const cashSubAccounts = [
				{
					accountCode: "1101",
					name: "Cash in Hand",
					accountType: AccountType_COA.ASSET,
					parentId: cashAccount.id,
				},
				{
					accountCode: "1102",
					name: "Cash at Bank",
					accountType: AccountType_COA.ASSET,
					parentId: cashAccount.id,
				},
			];

			for (const account of cashSubAccounts) {
				await prisma.account_COA.create({ data: account });
				console.log(`Created cash sub-account: ${account.name}`);
			}
		}

		// Get loans receivable account
		const loansAccount = await prisma.account_COA.findFirst({
			where: { accountCode: "1200" },
		});
		if (loansAccount) {
			const loanSubAccounts = [
				{
					accountCode: "1201",
					name: "Personal Loans",
					accountType: AccountType_COA.ASSET,
					parentId: loansAccount.id,
				},
				{
					accountCode: "1202",
					name: "Business Loans",
					accountType: AccountType_COA.ASSET,
					parentId: loansAccount.id,
				},
				{
					accountCode: "1203",
					name: "Education Loans",
					accountType: AccountType_COA.ASSET,
					parentId: loansAccount.id,
				},
			];

			for (const account of loanSubAccounts) {
				await prisma.account_COA.create({ data: account });
				console.log(`Created loan sub-account: ${account.name}`);
			}
		}
	}

	if (liabilities) {
		const liabilitySubAccounts = [
			{
				accountCode: "2100",
				name: "Deposits",
				accountType: AccountType_COA.LIABILITY,
				parentId: liabilities.id,
			},
			{
				accountCode: "2200",
				name: "Borrowings",
				accountType: AccountType_COA.LIABILITY,
				parentId: liabilities.id,
			},
			{
				accountCode: "2300",
				name: "Tax Payable",
				accountType: AccountType_COA.LIABILITY,
				parentId: liabilities.id,
			},
		];

		for (const account of liabilitySubAccounts) {
			await prisma.account_COA.create({ data: account });
			console.log(`Created liability sub-account: ${account.name}`);
		}
	}

	if (income) {
		const incomeSubAccounts = [
			{
				accountCode: "4100",
				name: "Interest Income",
				accountType: AccountType_COA.INCOME,
				parentId: income.id,
			},
			{
				accountCode: "4200",
				name: "Fee Income",
				accountType: AccountType_COA.INCOME,
				parentId: income.id,
			},
			{
				accountCode: "4300",
				name: "Other Income",
				accountType: AccountType_COA.INCOME,
				parentId: income.id,
			},
		];

		for (const account of incomeSubAccounts) {
			await prisma.account_COA.create({ data: account });
			console.log(`Created income sub-account: ${account.name}`);
		}
	}

	if (expenses) {
		const expenseSubAccounts = [
			{
				accountCode: "5100",
				name: "Personnel Expenses",
				accountType: AccountType_COA.EXPENSE,
				parentId: expenses.id,
			},
			{
				accountCode: "5200",
				name: "Administrative Expenses",
				accountType: AccountType_COA.EXPENSE,
				parentId: expenses.id,
			},
			{
				accountCode: "5300",
				name: "Financial Expenses",
				accountType: AccountType_COA.EXPENSE,
				parentId: expenses.id,
			},
		];

		for (const account of expenseSubAccounts) {
			await prisma.account_COA.create({ data: account });
			console.log(`Created expense sub-account: ${account.name}`);
		}
	}
}

async function seedSmsTemplates() {
	console.log("Seeding SMS templates and events...");

	// Create SMS templates
	const templates = [
		{
			name: "Account Creation",
			category: "Account",
			content:
				"Dear {{name}}, your account {{accountNumber}} has been created successfully. Welcome to AstroFinance!",
			variables: { name: "User Name", accountNumber: "Account Number" },
			characterCount: 100,
			isActive: true,
		},
		{
			name: "Deposit Confirmation",
			category: "Transaction",
			content:
				"Dear {{name}}, your account {{accountNumber}} has been credited with Rs. {{amount}} on {{date}}. Available balance: Rs. {{balance}}.",
			variables: {
				name: "User Name",
				accountNumber: "Account Number",
				amount: "Amount",
				date: "Date",
				balance: "Balance",
			},
			characterCount: 150,
			isActive: true,
		},
		{
			name: "Withdrawal Confirmation",
			category: "Transaction",
			content:
				"Dear {{name}}, your account {{accountNumber}} has been debited with Rs. {{amount}} on {{date}}. Available balance: Rs. {{balance}}.",
			variables: {
				name: "User Name",
				accountNumber: "Account Number",
				amount: "Amount",
				date: "Date",
				balance: "Balance",
			},
			characterCount: 150,
			isActive: true,
		},
		{
			name: "Loan Approval",
			category: "Loan",
			content:
				"Dear {{name}}, your loan application {{applicationNumber}} has been approved. Loan amount: Rs. {{amount}}. Please visit our branch for further processing.",
			variables: {
				name: "User Name",
				applicationNumber: "Application Number",
				amount: "Amount",
			},
			characterCount: 180,
			isActive: true,
		},
		{
			name: "EMI Due Reminder",
			category: "Loan",
			content:
				"Dear {{name}}, your loan EMI of Rs. {{amount}} for loan {{loanNumber}} is due on {{dueDate}}. Please ensure timely payment to avoid late fees.",
			variables: {
				name: "User Name",
				amount: "Amount",
				loanNumber: "Loan Number",
				dueDate: "Due Date",
			},
			characterCount: 160,
			isActive: true,
		},
		{
			name: "EMI Payment Confirmation",
			category: "Loan",
			content:
				"Dear {{name}}, we have received your EMI payment of Rs. {{amount}} for loan {{loanNumber}}. Thank you for your payment.",
			variables: {
				name: "User Name",
				amount: "Amount",
				loanNumber: "Loan Number",
			},
			characterCount: 130,
			isActive: true,
		},
	];

	for (const template of templates) {
		await prisma.smsTemplate.create({
			data: {
				...template,
				variables: template.variables as any,
			},
		});
		console.log(`Created SMS template: ${template.name}`);
	}

	// Create SMS events
	const accountCreationTemplate = await prisma.smsTemplate.findFirst({
		where: { name: "Account Creation" },
	});
	const depositTemplate = await prisma.smsTemplate.findFirst({
		where: { name: "Deposit Confirmation" },
	});
	const withdrawalTemplate = await prisma.smsTemplate.findFirst({
		where: { name: "Withdrawal Confirmation" },
	});
	const loanApprovalTemplate = await prisma.smsTemplate.findFirst({
		where: { name: "Loan Approval" },
	});
	const emiDueTemplate = await prisma.smsTemplate.findFirst({
		where: { name: "EMI Due Reminder" },
	});
	const emiPaymentTemplate = await prisma.smsTemplate.findFirst({
		where: { name: "EMI Payment Confirmation" },
	});

	const events = [
		{
			eventCode: "ACCOUNT_CREATION",
			description: "Triggered when a new account is created",
			templateId: accountCreationTemplate?.id,
			isActive: true,
		},
		{
			eventCode: "DEPOSIT",
			description: "Triggered when a deposit is made",
			templateId: depositTemplate?.id,
			isActive: true,
		},
		{
			eventCode: "WITHDRAWAL",
			description: "Triggered when a withdrawal is made",
			templateId: withdrawalTemplate?.id,
			isActive: true,
		},
		{
			eventCode: "LOAN_APPROVAL",
			description: "Triggered when a loan is approved",
			templateId: loanApprovalTemplate?.id,
			isActive: true,
		},
		{
			eventCode: "EMI_DUE",
			description: "Triggered when an EMI is due",
			templateId: emiDueTemplate?.id,
			isActive: true,
		},
		{
			eventCode: "EMI_PAYMENT",
			description: "Triggered when an EMI payment is received",
			templateId: emiPaymentTemplate?.id,
			isActive: true,
		},
	];

	for (const event of events) {
		await prisma.smsEvent.create({ data: event });
		console.log(`Created SMS event: ${event.eventCode}`);
	}
}

async function seedTaxTypes() {
	console.log("Seeding tax types and rates...");

	// Create tax types
	const taxTypes = [
		{
			code: "TDS",
			name: "Tax Deducted at Source",
			description: "Tax deducted at source on interest income",
			isActive: true,
		},
		{
			code: "GST",
			name: "Goods and Services Tax",
			description: "Tax on goods and services",
			isActive: true,
		},
		{
			code: "ST",
			name: "Service Tax",
			description: "Tax on services provided",
			isActive: true,
		},
	];

	for (const taxType of taxTypes) {
		await prisma.taxType.create({ data: taxType });
		console.log(`Created tax type: ${taxType.name}`);
	}

	// Create tax rates
	const tds = await prisma.taxType.findFirst({ where: { code: "TDS" } });
	const gst = await prisma.taxType.findFirst({ where: { code: "GST" } });
	const st = await prisma.taxType.findFirst({ where: { code: "ST" } });

	if (tds) {
		const tdsRates = [
			{
				taxTypeId: tds.id,
				rate: 10.0,
				thresholdAmount: 10000,
				effectiveFrom: new Date("2023-04-01"),
				customerCategory: "Individual",
				isActive: true,
			},
			{
				taxTypeId: tds.id,
				rate: 20.0,
				thresholdAmount: 50000,
				effectiveFrom: new Date("2023-04-01"),
				customerCategory: "Corporate",
				isActive: true,
			},
		];

		for (const rate of tdsRates) {
			await prisma.taxRate.create({ data: rate });
			console.log(`Created TDS rate: ${rate.rate}%`);
		}
	}

	if (gst) {
		const gstRates = [
			{
				taxTypeId: gst.id,
				rate: 5.0,
				effectiveFrom: new Date("2023-04-01"),
				isActive: true,
			},
			{
				taxTypeId: gst.id,
				rate: 12.0,
				effectiveFrom: new Date("2023-04-01"),
				isActive: true,
			},
			{
				taxTypeId: gst.id,
				rate: 18.0,
				effectiveFrom: new Date("2023-04-01"),
				isActive: true,
			},
		];

		for (const rate of gstRates) {
			await prisma.taxRate.create({ data: rate });
			console.log(`Created GST rate: ${rate.rate}%`);
		}
	}

	if (st) {
		const stRates = [
			{
				taxTypeId: st.id,
				rate: 15.0,
				effectiveFrom: new Date("2023-04-01"),
				isActive: true,
			},
		];

		for (const rate of stRates) {
			await prisma.taxRate.create({ data: rate });
			console.log(`Created Service Tax rate: ${rate.rate}%`);
		}
	}
}

async function seedExpenseCategories() {
	console.log("Seeding expense categories...");

	// Create main expense categories
	const mainCategories = [
		{
			name: "Personnel Expenses",
			categoryType: ExpenseCategoryType.FIXED,
			budgetAllocationPercent: 40.0,
			isActive: true,
		},
		{
			name: "Administrative Expenses",
			categoryType: ExpenseCategoryType.VARIABLE,
			budgetAllocationPercent: 25.0,
			isActive: true,
		},
		{
			name: "Operational Expenses",
			categoryType: ExpenseCategoryType.VARIABLE,
			budgetAllocationPercent: 20.0,
			isActive: true,
		},
		{
			name: "Capital Expenses",
			categoryType: ExpenseCategoryType.CAPITAL,
			budgetAllocationPercent: 15.0,
			isActive: true,
		},
	];

	for (const category of mainCategories) {
		await prisma.expenseCategory.create({ data: category });
		console.log(`Created expense category: ${category.name}`);
	}

	// Get created main categories
	const personnel = await prisma.expenseCategory.findFirst({
		where: { name: "Personnel Expenses" },
	});
	const administrative = await prisma.expenseCategory.findFirst({
		where: { name: "Administrative Expenses" },
	});
	const operational = await prisma.expenseCategory.findFirst({
		where: { name: "Operational Expenses" },
	});
	const capital = await prisma.expenseCategory.findFirst({
		where: { name: "Capital Expenses" },
	});

	// Create sub-categories
	if (personnel) {
		const personnelSubCategories = [
			{
				name: "Salaries",
				categoryType: ExpenseCategoryType.FIXED,
				parentId: personnel.id,
				isActive: true,
			},
			{
				name: "Bonuses",
				categoryType: ExpenseCategoryType.VARIABLE,
				parentId: personnel.id,
				isActive: true,
			},
			{
				name: "Staff Benefits",
				categoryType: ExpenseCategoryType.FIXED,
				parentId: personnel.id,
				isActive: true,
			},
		];

		for (const category of personnelSubCategories) {
			await prisma.expenseCategory.create({ data: category });
			console.log(`Created personnel sub-category: ${category.name}`);
		}
	}

	if (administrative) {
		const adminSubCategories = [
			{
				name: "Rent",
				categoryType: ExpenseCategoryType.FIXED,
				parentId: administrative.id,
				isActive: true,
			},
			{
				name: "Utilities",
				categoryType: ExpenseCategoryType.VARIABLE,
				parentId: administrative.id,
				isActive: true,
			},
			{
				name: "Office Supplies",
				categoryType: ExpenseCategoryType.VARIABLE,
				parentId: administrative.id,
				isActive: true,
			},
			{
				name: "Communication",
				categoryType: ExpenseCategoryType.VARIABLE,
				parentId: administrative.id,
				isActive: true,
			},
		];

		for (const category of adminSubCategories) {
			await prisma.expenseCategory.create({ data: category });
			console.log(`Created administrative sub-category: ${category.name}`);
		}
	}

	if (operational) {
		const operationalSubCategories = [
			{
				name: "Marketing",
				categoryType: ExpenseCategoryType.VARIABLE,
				parentId: operational.id,
				isActive: true,
			},
			{
				name: "Travel",
				categoryType: ExpenseCategoryType.VARIABLE,
				parentId: operational.id,
				isActive: true,
			},
			{
				name: "Training",
				categoryType: ExpenseCategoryType.VARIABLE,
				parentId: operational.id,
				isActive: true,
			},
		];

		for (const category of operationalSubCategories) {
			await prisma.expenseCategory.create({ data: category });
			console.log(`Created operational sub-category: ${category.name}`);
		}
	}

	if (capital) {
		const capitalSubCategories = [
			{
				name: "Equipment",
				categoryType: ExpenseCategoryType.CAPITAL,
				parentId: capital.id,
				isActive: true,
			},
			{
				name: "Furniture",
				categoryType: ExpenseCategoryType.CAPITAL,
				parentId: capital.id,
				isActive: true,
			},
			{
				name: "Software",
				categoryType: ExpenseCategoryType.CAPITAL,
				parentId: capital.id,
				isActive: true,
			},
		];

		for (const category of capitalSubCategories) {
			await prisma.expenseCategory.create({ data: category });
			console.log(`Created capital sub-category: ${category.name}`);
		}
	}
}

async function seedReportTemplates() {
	console.log("Seeding report templates...");

	const reportTemplates = [
		{
			name: "User List Report",
			description: "List of all users with their account details",
			category: "User",
			queryDefinition: {
				table: "users",
				joins: [{ table: "accounts", on: "users.id = accounts.userId" }],
				fields: [
					"users.id",
					"users.fullName",
					"users.contactNumber",
					"users.userType",
					"accounts.accountNumber",
					"accounts.balance",
					"accounts.status",
				],
				groupBy: [],
				orderBy: ["users.fullName ASC"],
			},
			layoutDefinition: {
				title: "User List Report",
				subtitle: "List of all users with their account details",
				columns: [
					{ field: "fullName", header: "Name", width: "20%" },
					{ field: "contactNumber", header: "Contact", width: "15%" },
					{ field: "userType", header: "Type", width: "10%" },
					{ field: "accountNumber", header: "Account No.", width: "15%" },
					{
						field: "balance",
						header: "Balance",
						width: "15%",
						format: "currency",
					},
					{ field: "status", header: "Status", width: "10%" },
				],
				footer: "Generated on {{date}}",
			},
			parameterDefinition: {
				userType: {
					type: "select",
					label: "User Type",
					options: ["SB", "BB", "MB"],
					required: false,
				},
				status: {
					type: "select",
					label: "Account Status",
					options: ["ACTIVE", "INACTIVE", "CLOSED", "FROZEN"],
					required: false,
				},
			},
			isSystem: true,
			isActive: true,
		},
		{
			name: "Loan Status Report",
			description: "Status of all loans with payment details",
			category: "Loan",
			queryDefinition: {
				table: "loans",
				joins: [
					{ table: "users", on: "loans.userId = users.id" },
					{ table: "loanTypes", on: "loans.loanTypeId = loanTypes.id" },
				],
				fields: [
					"loans.loanNumber",
					"users.fullName",
					"loanTypes.name as loanType",
					"loans.principalAmount",
					"loans.outstandingPrincipal",
					"loans.status",
					"loans.disbursementDate",
				],
				groupBy: [],
				orderBy: ["loans.disbursementDate DESC"],
			},
			layoutDefinition: {
				title: "Loan Status Report",
				subtitle: "Status of all loans with payment details",
				columns: [
					{ field: "loanNumber", header: "Loan No.", width: "15%" },
					{ field: "fullName", header: "Borrower", width: "20%" },
					{ field: "loanType", header: "Loan Type", width: "15%" },
					{
						field: "principalAmount",
						header: "Principal",
						width: "15%",
						format: "currency",
					},
					{
						field: "outstandingPrincipal",
						header: "Outstanding",
						width: "15%",
						format: "currency",
					},
					{ field: "status", header: "Status", width: "10%" },
					{
						field: "disbursementDate",
						header: "Disbursed On",
						width: "15%",
						format: "date",
					},
				],
				footer: "Generated on {{date}}",
			},
			parameterDefinition: {
				status: {
					type: "select",
					label: "Loan Status",
					options: ["ACTIVE", "CLOSED", "DEFAULTED"],
					required: false,
				},
				loanType: {
					type: "select",
					label: "Loan Type",
					options: ["PL", "BL", "EL", "HL", "VL"],
					required: false,
				},
				dateFrom: {
					type: "date",
					label: "From Date",
					required: false,
				},
				dateTo: {
					type: "date",
					label: "To Date",
					required: false,
				},
			},
			isSystem: true,
			isActive: true,
		},
		{
			name: "Financial Summary Report",
			description: "Summary of financial position",
			category: "Financial",
			queryDefinition: {
				table: "accounts_coa",
				joins: [
					{
						table: "account_balances",
						on: "accounts_coa.id = account_balances.accountId",
					},
				],
				fields: [
					"accounts_coa.accountCode",
					"accounts_coa.name",
					"accounts_coa.accountType",
					"SUM(account_balances.debitBalance) as totalDebit",
					"SUM(account_balances.creditBalance) as totalCredit",
					"SUM(account_balances.debitBalance - account_balances.creditBalance) as balance",
				],
				groupBy: [
					"accounts_coa.accountCode",
					"accounts_coa.name",
					"accounts_coa.accountType",
				],
				orderBy: ["accounts_coa.accountCode ASC"],
			},
			layoutDefinition: {
				title: "Financial Summary Report",
				subtitle: "Summary of financial position as of {{date}}",
				columns: [
					{ field: "accountCode", header: "Code", width: "10%" },
					{ field: "name", header: "Account", width: "30%" },
					{ field: "accountType", header: "Type", width: "15%" },
					{
						field: "totalDebit",
						header: "Debit",
						width: "15%",
						format: "currency",
					},
					{
						field: "totalCredit",
						header: "Credit",
						width: "15%",
						format: "currency",
					},
					{
						field: "balance",
						header: "Balance",
						width: "15%",
						format: "currency",
					},
				],
				footer: "Generated on {{date}}",
			},
			parameterDefinition: {
				asOfDate: {
					type: "date",
					label: "As of Date",
					required: true,
					default: "today",
				},
				accountType: {
					type: "select",
					label: "Account Type",
					options: ["ASSET", "LIABILITY", "EQUITY", "INCOME", "EXPENSE"],
					required: false,
				},
			},
			isSystem: true,
			isActive: true,
		},
	];

	for (const template of reportTemplates) {
		await prisma.reportTemplate.create({
			data: {
				...template,
				queryDefinition: template.queryDefinition as any,
				layoutDefinition: template.layoutDefinition as any,
				parameterDefinition: template.parameterDefinition as any,
			},
		});
		console.log(`Created report template: ${template.name}`);
	}
}

async function seedStaffUsers() {
	console.log("Seeding staff users...");

	// Create default staff password hash
	const passwordHash = await bcrypt.hash("Staff@123", 10);

	// Create staff users
	const staffUsers = [
		{
			employeeId: "STAFF001",
			firstName: "John",
			lastName: "Doe",
			email: "john.doe@astrofinance.com",
			passwordHash,
			phone: "1234567890",
			address: "123 Main St, City",
			dateOfBirth: new Date("1990-01-01"),
			joinDate: new Date("2023-01-01"),
			department: "Loans",
			position: "Loan Officer",
			status: StaffStatus.ACTIVE,
		},
		{
			employeeId: "STAFF002",
			firstName: "Jane",
			lastName: "Smith",
			email: "jane.smith@astrofinance.com",
			passwordHash,
			phone: "9876543210",
			address: "456 Oak St, City",
			dateOfBirth: new Date("1992-05-15"),
			joinDate: new Date("2023-02-01"),
			department: "Accounting",
			position: "Accountant",
			status: StaffStatus.ACTIVE,
		},
		{
			employeeId: "STAFF003",
			firstName: "Robert",
			lastName: "Johnson",
			email: "robert.johnson@astrofinance.com",
			passwordHash,
			phone: "5551234567",
			address: "789 Pine St, City",
			dateOfBirth: new Date("1988-11-20"),
			joinDate: new Date("2023-03-01"),
			department: "Customer Service",
			position: "Customer Service Representative",
			status: StaffStatus.ACTIVE,
		},
	];

	for (const staffUser of staffUsers) {
		const staff = await prisma.staff.create({ data: staffUser });
		console.log(`Created staff user: ${staff.employeeId}`);
	}

	// Assign roles to staff
	const loanOfficerRole = await prisma.role.findFirst({
		where: { name: "Loan Officer" },
	});
	const accountantRole = await prisma.role.findFirst({
		where: { name: "Accountant" },
	});

	if (loanOfficerRole) {
		const loanOfficer = await prisma.staff.findFirst({
			where: { employeeId: "STAFF001" },
		});
		if (loanOfficer) {
			await prisma.staffRole.create({
				data: {
					staffId: loanOfficer.id,
					roleId: loanOfficerRole.id,
				},
			});
			console.log("Assigned Loan Officer role to STAFF001");
		}
	}

	if (accountantRole) {
		const accountant = await prisma.staff.findFirst({
			where: { employeeId: "STAFF002" },
		});
		if (accountant) {
			await prisma.staffRole.create({
				data: {
					staffId: accountant.id,
					roleId: accountantRole.id,
				},
			});
			console.log("Assigned Accountant role to STAFF002");
		}
	}
}

main()
	.catch((e) => {
		console.error("Error during seeding:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});


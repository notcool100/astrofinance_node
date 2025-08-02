/**
 * @swagger
 * components:
 *   schemas:
 *     LoanType:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - interestType
 *         - minAmount
 *         - maxAmount
 *         - minTenure
 *         - maxTenure
 *         - interestRate
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the loan type
 *         name:
 *           type: string
 *           description: The name of the loan type
 *         code:
 *           type: string
 *           description: Unique code for the loan type
 *         interestType:
 *           type: string
 *           enum: [FLAT, DIMINISHING]
 *           description: The interest calculation method
 *         minAmount:
 *           type: number
 *           description: Minimum loan amount
 *         maxAmount:
 *           type: number
 *           description: Maximum loan amount
 *         minTenure:
 *           type: integer
 *           description: Minimum loan tenure in months
 *         maxTenure:
 *           type: integer
 *           description: Maximum loan tenure in months
 *         interestRate:
 *           type: number
 *           description: Annual interest rate percentage
 *         processingFeePercent:
 *           type: number
 *           description: Processing fee as percentage of loan amount
 *         lateFeeAmount:
 *           type: number
 *           description: Late payment fee amount
 *         isActive:
 *           type: boolean
 *           description: Whether the loan type is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the loan type was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the loan type was last updated
 * 
 * @swagger
 * /loan/types:
 *   get:
 *     summary: Get all loan types
 *     description: Retrieve a list of all loan types with filtering, pagination, and search capabilities.
 *     tags: [Loan Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: interestType
 *         schema:
 *           type: string
 *           enum: [FLAT, DIMINISHING]
 *         description: Filter by interest type
 *       - in: query
 *         name: minInterestRate
 *         schema:
 *           type: number
 *         description: Filter by minimum interest rate
 *       - in: query
 *         name: maxInterestRate
 *         schema:
 *           type: number
 *         description: Filter by maximum interest rate
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or code
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: name
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A paginated list of loan types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/LoanType'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Create a new loan type
 *     description: Create a new loan type with the provided details
 *     tags: [Loan Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - interestType
 *               - minAmount
 *               - maxAmount
 *               - minTenure
 *               - maxTenure
 *               - interestRate
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               code:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *                 pattern: ^[A-Z0-9]+$
 *               interestType:
 *                 type: string
 *                 enum: [FLAT, DIMINISHING]
 *               minAmount:
 *                 type: number
 *                 minimum: 1000
 *               maxAmount:
 *                 type: number
 *               minTenure:
 *                 type: integer
 *                 minimum: 3
 *               maxTenure:
 *                 type: integer
 *               interestRate:
 *                 type: number
 *                 maximum: 50
 *               processingFeePercent:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               lateFeeAmount:
 *                 type: number
 *                 minimum: 0
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Loan type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanType'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Loan type with same name or code already exists
 *       500:
 *         description: Server error
 *
 * @swagger
 * /loan/types/{id}:
 *   get:
 *     summary: Get a loan type by ID
 *     description: Retrieve a specific loan type by its ID
 *     tags: [Loan Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The loan type ID
 *     responses:
 *       200:
 *         description: Loan type details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanType'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan type not found
 *       500:
 *         description: Server error
 *
 *   put:
 *     summary: Update a loan type
 *     description: Update an existing loan type with the provided details
 *     tags: [Loan Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The loan type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               interestType:
 *                 type: string
 *                 enum: [FLAT, DIMINISHING]
 *               minAmount:
 *                 type: number
 *                 minimum: 1000
 *               maxAmount:
 *                 type: number
 *               minTenure:
 *                 type: integer
 *                 minimum: 3
 *               maxTenure:
 *                 type: integer
 *               interestRate:
 *                 type: number
 *                 maximum: 50
 *               processingFeePercent:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               lateFeeAmount:
 *                 type: number
 *                 minimum: 0
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Loan type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoanType'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan type not found
 *       409:
 *         description: Loan type with same name already exists
 *       500:
 *         description: Server error
 *
 *   delete:
 *     summary: Delete a loan type
 *     description: Delete a loan type by ID (only if not used in loans or applications)
 *     tags: [Loan Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The loan type ID
 *     responses:
 *       200:
 *         description: Loan type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot delete loan type that is used in loans or applications
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Loan type not found
 *       500:
 *         description: Server error
 *
 * @swagger
 * /loan/types/bulk/status:
 *   post:
 *     summary: Bulk update loan type status
 *     description: Update the active status of multiple loan types at once
 *     tags: [Loan Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *               - isActive
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of loan type IDs to update
 *               isActive:
 *                 type: boolean
 *                 description: Active status to set for all specified loan types
 *     responses:
 *       200:
 *         description: Loan types updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
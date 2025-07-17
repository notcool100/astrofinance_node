# AstroFinance Infrastructure as Code

This directory contains Infrastructure as Code (IaC) definitions for the AstroFinance application.

## Directory Structure

```
/infrastructure
├── arm-templates/       # Azure Resource Manager templates
│   ├── webapp.json      # Web App definition
│   ├── database.json    # Database definition
│   └── keyvault.json    # Key Vault definition
└── terraform/           # Terraform configurations
    ├── main.tf          # Main Terraform configuration
    ├── variables.tf     # Variable definitions
    └── outputs.tf       # Output definitions
```

## ARM Templates

The `arm-templates/` directory contains Azure Resource Manager templates for deploying Azure resources. These templates can be deployed using the Azure CLI or Azure DevOps pipelines.

### Planned Templates

- **webapp.json**: Defines the Azure Web Apps for frontend and backend
- **database.json**: Defines the Azure Database for PostgreSQL
- **keyvault.json**: Defines the Azure Key Vault for secrets
- **insights.json**: Defines the Application Insights resources

## Terraform

The `terraform/` directory contains Terraform configurations for deploying Azure resources. These configurations can be applied using the Terraform CLI or Azure DevOps pipelines.

### Planned Configurations

- **main.tf**: Main Terraform configuration
- **variables.tf**: Variable definitions
- **outputs.tf**: Output definitions
- **modules/**: Reusable Terraform modules

## Usage

### ARM Templates

To deploy ARM templates:

```bash
az deployment group create \
  --resource-group AstroFinance-RG \
  --template-file webapp.json \
  --parameters @webapp.parameters.json
```

### Terraform

To apply Terraform configurations:

```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## Best Practices

- Use parameterized templates for different environments
- Store state files securely
- Use modules for reusable components
- Document all parameters and outputs
- Include tags for resource organization
- Implement least privilege access control
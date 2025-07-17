#!/bin/bash

# Setup Azure DevOps Pipeline for AstroFinance
# This script helps set up the Azure DevOps pipeline for the AstroFinance project

# Exit on error
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Azure CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Azure DevOps extension is installed
if ! az extension list | grep -q "azure-devops"; then
    echo -e "${YELLOW}Azure DevOps extension not found. Installing...${NC}"
    az extension add --name azure-devops
fi

# Login to Azure
echo -e "${GREEN}Logging in to Azure...${NC}"
az login

# Variables
echo -e "${GREEN}Setting up variables...${NC}"
read -p "Enter Azure DevOps organization name: " ORG_NAME
read -p "Enter Azure DevOps project name (default: AstroFinance): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-AstroFinance}
read -p "Enter Azure subscription ID: " SUBSCRIPTION_ID
read -p "Enter resource group name (default: AstroFinance-RG): " RESOURCE_GROUP
RESOURCE_GROUP=${RESOURCE_GROUP:-AstroFinance-RG}
read -p "Enter location (default: eastus): " LOCATION
LOCATION=${LOCATION:-eastus}

# Set default Azure DevOps organization
echo -e "${GREEN}Setting default Azure DevOps organization...${NC}"
az devops configure --defaults organization="https://dev.azure.com/$ORG_NAME"

# Create Azure DevOps project if it doesn't exist
echo -e "${GREEN}Checking if project exists...${NC}"
if ! az devops project show --project "$PROJECT_NAME" &> /dev/null; then
    echo -e "${YELLOW}Project $PROJECT_NAME does not exist. Creating...${NC}"
    az devops project create --name "$PROJECT_NAME" --description "AstroFinance Financial Management System" --visibility private
else
    echo -e "${GREEN}Project $PROJECT_NAME already exists.${NC}"
fi

# Set default Azure DevOps project
echo -e "${GREEN}Setting default Azure DevOps project...${NC}"
az devops configure --defaults project="$PROJECT_NAME"

# Create Azure resource group if it doesn't exist
echo -e "${GREEN}Checking if resource group exists...${NC}"
if ! az group show --name "$RESOURCE_GROUP" &> /dev/null; then
    echo -e "${YELLOW}Resource group $RESOURCE_GROUP does not exist. Creating...${NC}"
    az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
else
    echo -e "${GREEN}Resource group $RESOURCE_GROUP already exists.${NC}"
fi

# Create Azure service principal for DevOps
echo -e "${GREEN}Creating service principal for Azure DevOps...${NC}"
SP_NAME="sp-$PROJECT_NAME-devops"
SP_OUTPUT=$(az ad sp create-for-rbac --name "$SP_NAME" --role contributor --scopes "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP" --query "{name:name, appId:appId, password:password, tenant:tenant}" -o json)

# Extract service principal details
SP_APP_ID=$(echo $SP_OUTPUT | jq -r '.appId')
SP_PASSWORD=$(echo $SP_OUTPUT | jq -r '.password')
SP_TENANT=$(echo $SP_OUTPUT | jq -r '.tenant')

echo -e "${GREEN}Service principal created with app ID: $SP_APP_ID${NC}"

# Create Azure DevOps service connection
echo -e "${GREEN}Creating Azure DevOps service connection...${NC}"
az devops service-endpoint azurerm create --azure-rm-service-principal-id "$SP_APP_ID" \
    --azure-rm-subscription-id "$SUBSCRIPTION_ID" \
    --azure-rm-subscription-name "Azure Subscription" \
    --azure-rm-tenant-id "$SP_TENANT" \
    --name "Azure Subscription" \
    --service-endpoint-authentication-scheme ServicePrincipal

# Create Azure DevOps environments
echo -e "${GREEN}Creating Azure DevOps environments...${NC}"
az pipelines environment create --name "development"
az pipelines environment create --name "production"

# Create variable groups
echo -e "${GREEN}Creating variable groups...${NC}"
az pipelines variable-group create --name "fms-common-variables" --variables NODE_VERSION=16.x PROJECT_NAME=$PROJECT_NAME

# Create Azure Web Apps for frontend and backend
echo -e "${GREEN}Creating Azure Web Apps...${NC}"

# Create App Service Plan for development
echo -e "${YELLOW}Creating App Service Plan for development...${NC}"
az appservice plan create --name "asp-astrofinance-dev" \
    --resource-group "$RESOURCE_GROUP" \
    --sku B1 \
    --is-linux

# Create Frontend Web App for development
echo -e "${YELLOW}Creating Frontend Web App for development...${NC}"
az webapp create --name "astrofinance-frontend-dev" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "asp-astrofinance-dev" \
    --runtime "NODE:16-lts"

# Create Backend Web App for development
echo -e "${YELLOW}Creating Backend Web App for development...${NC}"
az webapp create --name "astrofinance-backend-dev" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "asp-astrofinance-dev" \
    --runtime "NODE:16-lts"

# Create App Service Plan for production
echo -e "${YELLOW}Creating App Service Plan for production...${NC}"
az appservice plan create --name "asp-astrofinance-prod" \
    --resource-group "$RESOURCE_GROUP" \
    --sku S1 \
    --is-linux

# Create Frontend Web App for production
echo -e "${YELLOW}Creating Frontend Web App for production...${NC}"
az webapp create --name "astrofinance-frontend" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "asp-astrofinance-prod" \
    --runtime "NODE:16-lts"

# Create Backend Web App for production
echo -e "${YELLOW}Creating Backend Web App for production...${NC}"
az webapp create --name "astrofinance-backend" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "asp-astrofinance-prod" \
    --runtime "NODE:16-lts"

# Create Application Insights
echo -e "${GREEN}Creating Application Insights...${NC}"
az monitor app-insights component create --app "astrofinance-insights" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --application-type web

# Get Application Insights instrumentation key
INSTRUMENTATION_KEY=$(az monitor app-insights component show --app "astrofinance-insights" --resource-group "$RESOURCE_GROUP" --query instrumentationKey -o tsv)

# Create Key Vault
echo -e "${GREEN}Creating Key Vault...${NC}"
az keyvault create --name "kv-astrofinance" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION"

# Store secrets in Key Vault
echo -e "${GREEN}Storing secrets in Key Vault...${NC}"
az keyvault secret set --vault-name "kv-astrofinance" --name "AppInsightsInstrumentationKey" --value "$INSTRUMENTATION_KEY"

# Create Azure Pipelines
echo -e "${GREEN}Creating Azure Pipelines...${NC}"

# Create combined pipeline
echo -e "${YELLOW}Creating combined pipeline...${NC}"
az pipelines create --name "AstroFinance-CI-CD" \
    --repository-type tfsgit \
    --repository "AstroFinance" \
    --branch main \
    --yml-path "/devops/pipelines/azure-pipelines.yml"

# Create frontend pipeline
echo -e "${YELLOW}Creating frontend pipeline...${NC}"
az pipelines create --name "Frontend-CI-CD" \
    --repository-type tfsgit \
    --repository "AstroFinance" \
    --branch main \
    --yml-path "/devops/pipelines/frontend-pipeline.yml"

# Create backend pipeline
echo -e "${YELLOW}Creating backend pipeline...${NC}"
az pipelines create --name "Backend-CI-CD" \
    --repository-type tfsgit \
    --repository "AstroFinance" \
    --branch main \
    --yml-path "/devops/pipelines/backend-pipeline.yml"

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure approval checks for production environment"
echo "2. Set up branch policies for main branch"
echo "3. Configure variable groups with environment-specific variables"
echo "4. Set up monitoring and alerts"

exit 0
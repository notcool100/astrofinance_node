provider "azurerm" {
  features {}
}

# Variables
variable "environment" {
  description = "Environment (dev or prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "Environment must be 'dev' or 'prod'."
  }
}

variable "location" {
  description = "Azure region to deploy resources"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "AstroFinance-RG"
}

# Local variables
locals {
  app_service_plan_sku = {
    dev = {
      tier = "Basic"
      size = "B1"
    }
    prod = {
      tier = "Standard"
      size = "S1"
    }
  }
  
  tags = {
    Environment = var.environment
    Project     = "AstroFinance"
    ManagedBy   = "Terraform"
  }
  
  frontend_app_name = "astrofinance-frontend-${var.environment}"
  backend_app_name  = "astrofinance-backend-${var.environment}"
  app_service_plan_name = "asp-astrofinance-${var.environment}"
  app_insights_name = "astrofinance-insights-${var.environment}"
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = local.tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = local.app_insights_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  tags                = local.tags
}

# App Service Plan
resource "azurerm_app_service_plan" "main" {
  name                = local.app_service_plan_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "Linux"
  reserved            = true
  
  sku {
    tier = local.app_service_plan_sku[var.environment].tier
    size = local.app_service_plan_sku[var.environment].size
  }
  
  tags = local.tags
}

# Frontend Web App
resource "azurerm_app_service" "frontend" {
  name                = local.frontend_app_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  app_service_plan_id = azurerm_app_service_plan.main.id
  
  site_config {
    linux_fx_version = "NODE|16-lts"
    always_on        = true
  }
  
  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "~16"
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.main.instrumentation_key
    "ENVIRONMENT" = var.environment
    "API_URL" = "https://${local.backend_app_name}.azurewebsites.net/api"
  }
  
  tags = local.tags
}

# Backend Web App
resource "azurerm_app_service" "backend" {
  name                = local.backend_app_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  app_service_plan_id = azurerm_app_service_plan.main.id
  
  site_config {
    linux_fx_version = "NODE|16-lts"
    always_on        = true
  }
  
  app_settings = {
    "WEBSITE_NODE_DEFAULT_VERSION" = "~16"
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.main.instrumentation_key
    "ENVIRONMENT" = var.environment
    "NODE_ENV" = var.environment == "prod" ? "production" : "development"
  }
  
  tags = local.tags
}

# Outputs
output "frontend_url" {
  value = "https://${azurerm_app_service.frontend.default_site_hostname}"
}

output "backend_url" {
  value = "https://${azurerm_app_service.backend.default_site_hostname}"
}

output "app_insights_instrumentation_key" {
  value     = azurerm_application_insights.main.instrumentation_key
  sensitive = true
}
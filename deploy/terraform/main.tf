terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
  backend "s3" {
    bucket         = "tureep-terraform-state-prod"
    key            = "eks-cluster/terraform.tfstate"
    region         = "eu-central-1"
    encrypt        = true
    dynamodb_table = "tureep-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Environment   = "production"
      Platform      = "Tureep-AI-Plus"
      Sovereignty   = "MENA-Cross-Border-Clearinghouse"
      ManagedBy     = "Terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# --------------------------------------------------------- #
# 1. SOVEREIGN PRODUCTION VPC & MULTI-AZ SUBNETS            #
# --------------------------------------------------------- #
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.2"

  name                 = "tureep-mena-production-vpc"
  cidr                 = var.vpc_cidr
  azs                  = slice(data.aws_availability_zones.available.names, 0, 3)
  private_subnets      = var.private_subnets_cidr
  public_subnets       = var.public_subnets_cidr
  database_subnets     = var.database_subnets_cidr

  enable_nat_gateway   = true
  single_nat_gateway   = false # Highly available Multi-AZ redundant NAT gateways
  enable_dns_hostnames = true
  enable_dns_support   = true

  create_database_subnet_group = true

  public_subnet_tags = {
    "kubernetes.io/role/elb"                        = "1"
    "kubernetes.io/cluster/tureep-institutional-eks" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"               = "1"
    "kubernetes.io/cluster/tureep-institutional-eks" = "shared"
  }
}

# --------------------------------------------------------- #
# 2. AWS EKS MULTI-NODE MANAGED SWARM CLUSTER               #
# --------------------------------------------------------- #
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "19.17.2"

  cluster_name                   = "tureep-institutional-eks"
  cluster_version                = "1.30"
  cluster_endpoint_public_access = true
  cluster_endpoint_private_access = true

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  create_cloudwatch_log_group = true
  cluster_enabled_log_types   = ["api", "audit", "authenticator", "controllerManager", "scheduler"]

  eks_managed_node_groups = {
    # 1. High-Performance Fast Execution Desk Workers (Deals, Scoring Engine, Trade Finance)
    compute_heavy_workers = {
      name            = "compute-heavy-node-group"
      instance_types  = ["c6i.2xlarge", "c6a.2xlarge"]
      capacity_type   = "ON_DEMAND"
      min_size        = 3
      max_size        = 12
      desired_size    = 5
      disk_size       = 100

      labels = {
        workload_type = "fastapi-compute-heavy"
        residency     = "eu-central-1-sovereign"
      }
    }

    # 2. General Utility Workers (Auth, Notifications, EDI Scrapers)
    general_utility_workers = {
      name            = "general-utility-node-group"
      instance_types  = ["m6i.xlarge", "m6a.xlarge"]
      capacity_type   = "SPOT" # Cost-optimized redundant fallback pool
      min_size        = 2
      max_size        = 10
      desired_size    = 4
      disk_size       = 80

      labels = {
        workload_type = "fastapi-general-utility"
      }
    }
  }

  manage_aws_auth_configmap = true
  aws_auth_roles = [
    {
      rolearn  = var.devops_admin_role_arn
      username = "devops-lead"
      groups   = ["system:masters"]
    }
  ]
}

# --------------------------------------------------------- #
# 3. SUPABASE TRANSACTION POOLER PGBOUNCER SECURITY GROUP   #
# --------------------------------------------------------- #
resource "aws_security_group" "supabase_pooler_egress" {
  name        = "tureep-supabase-pooler-egress-sg"
  description = "Strict Outbound TCP Firewall allowing EKS worker nodes to communicate with Supabase Transaction Poolers"
  vpc_id      = module.vpc.vpc_id

  egress {
    description = "Allow Supabase Transaction Pooler TCP Connection (Port 6543)"
    from_port   = 6543
    to_port     = 6543
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restricted to Supabase Cloud IP ranges in live deployment
  }

  tags = {
    Name = "tureep-supabase-pooler-egress-sg"
  }
}

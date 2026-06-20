variable "aws_region" {
  description = "The authoritative AWS cloud deployment region for Tureep AI+ Institutional Clearinghouse."
  type        = string
  default     = "eu-central-1" # Frankfurt sovereign MENA bridge
}

variable "vpc_cidr" {
  description = "The fundamental IPv4 CIDR block for the sovereign MENA production VPC."
  type        = string
  default     = "10.100.0.0/16"
}

variable "private_subnets_cidr" {
  description = "Mandatory private subnets hosting stateless EKS microservices Pod swarms."
  type        = list(string)
  default     = ["10.100.1.0/24", "10.100.2.0/24", "10.100.3.0/24"]
}

variable "public_subnets_cidr" {
  description = "Public subnets assigned to Traefik / AWS Application Load Balancers (ALB) edge ingress."
  type        = list(string)
  default     = ["10.100.101.0/24", "10.100.102.0/24", "10.100.103.0/24"]
}

variable "database_subnets_cidr" {
  description = "Highly secure isolated subnets reserved for managed read-replica cache clusters."
  type        = list(string)
  default     = ["10.100.201.0/24", "10.100.202.0/24", "10.100.203.0/24"]
}

variable "devops_admin_role_arn" {
  description = "IAM Role ARN granted complete system:masters root Kubernetes RBAC sovereignty."
  type        = string
  default     = "arn:aws:iam::012345678901:role/TureepInstitutionalDevOpsLead"
}

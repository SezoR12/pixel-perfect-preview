output "vpc_id" {
  description = "The authoritative physical identifier of the provisioned sovereign AWS VPC."
  value       = module.vpc.vpc_id
}

output "private_subnet_ids" {
  description = "The precise private subnets where Kubernetes Node groups are actively scheduled."
  value       = module.vpc.private_subnets
}

output "eks_cluster_name" {
  description = "The institutional name of our multi-node managed AWS EKS production swarm."
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "The secure HTTPS control plane API endpoint for our Kubernetes swarm."
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_certificate_authority_data" {
  description = "Base64 encoded PEM certificate data required for local kubeconfig verification."
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "supabase_pooler_security_group_id" {
  description = "The explicit physical ID of our Outbound TCP 6543 Supabase PgBouncer firewall."
  value       = aws_security_group.supabase_pooler_egress.id
}

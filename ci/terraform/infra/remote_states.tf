
data "terraform_remote_state" "ssp" {
  backend = "s3"
  config = {
    bucket  = "terraform-remote-state-vault"
    key     = "SHAREDSERVICES/SHAREDSERVICES-PRO.tfstate"
    region  = var.aws_region
    profile = "985079483454"
  }
}

data "terraform_remote_state" "eks_int" {
  backend = "s3"
  config = {
    bucket  = "terraform-remote-state-vault"
    key     = "sm_eks/int/terraform.tfstate"
    region  = var.aws_region
    profile = "985079483454"
  }
}


data "terraform_remote_state" "eks_pre" {
  backend = "s3"
  config = {
    bucket  = "terraform-remote-state-vault"
    key     = "sm_eks/pre/terraform.tfstate"
    region  = var.aws_region
    profile = "985079483454"
  }
}

data "terraform_remote_state" "eks_pro" {
  backend = "s3"
  config = {
    bucket  = "terraform-remote-state-vault"
    key     = "sm_eks/pro/terraform.tfstate"
    region  = var.aws_region
    profile = "985079483454"
  }
}

data "terraform_remote_state" "github" {
  backend = "s3"
  config = {
    bucket  = "terraform-remote-state-vault"
    key     = "github/PRO/github-pro.tfstate"
    region  = var.aws_region
    profile = "985079483454"
  }
}

data "terraform_remote_state" "mgmt" {
  backend = "s3"
  config = {
    bucket  = "terraform-remote-state-vault"
    key     = "MGMT/MGMT.tfstate"
    region  = "eu-west-1"
    profile = "985079483454"
  }
}

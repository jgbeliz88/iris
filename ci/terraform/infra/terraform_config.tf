# Inicializar con:
#   terraform init \
#     -backend-config="key=$(jq -r '.app' ../../project.json)/$(jq -r '.project_name' ../../project.json)/$(pwd |awk -F/ '{print $(NF)}')/terraform.tfstate"
#   terraform init -backend-config="key=$(jq -r '.app' ../../project.json)/$(jq -r '.project_name' ../../project.json)/$(pwd |awk -F/ '{print $(NF)}')/terraform.tfstate"

terraform {
  required_version = "1.13.0"

  backend "s3" {
    bucket        = "terraform-remote-state-vault"
    region        = "eu-west-1"
    use_lockfile  = true
    profile       = "985079483454"
  }

  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 4.26"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "5.79.0"
    }
    vault = {
      source  = "hashicorp/vault"
      version = "4.4.0"
    }
  }
}

provider "aws" {
  region  = local.region
  profile = "985079483454"

  default_tags {
    tags = local.aws_default_tags
  }
}

provider "aws" {
  alias   = "msmgmt"
  region  = "eu-west-1"
  profile = "968866491363"
}

provider "aws" {
  alias   = "sharedservicespro"
  region  = "eu-west-1"
  profile = "088427993007"

  default_tags {
    tags = local.aws_default_tags
  }
}

provider "github" {
  owner    = data.terraform_remote_state.github.outputs.github_owner
  base_url = data.terraform_remote_state.github.outputs.github_url
}

provider "vault" {
  address = "https://vault-aws.awsinternal.mediaset.es"
}

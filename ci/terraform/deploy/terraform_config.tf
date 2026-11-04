# Inicializar con:
#   terraform init \
#     -backend-config="key=$(jq -r '.app' ../../project.json)/$(jq -r '.project_name' ../../project.json)/$(pwd |awk -F/ '{print $(NF)}')"
#   terraform init -backend-config="workspace_key_prefix=$(jq -r '.app' ../../project.json)/$(jq -r '.project_name' ../../project.json)/$(pwd |awk -F/ '{print $(NF)}')"

terraform {
  required_version = "1.13.0"

  backend "s3" {
    bucket        = "terraform-remote-state-vault"
    key           = "terraform.tfstate"
    region        = "eu-west-1"
    use_lockfile  = true
    profile       = "985079483454"
  }

  required_providers {
    vault = {
      source  = "hashicorp/vault"
      version = "4.4.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "3.2.0"
    }
    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "1.19.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "3.2.1"
    }
  }
}



provider "vault" {
  address = local.vault-addr[terraform.workspace]
}

locals {
  vault_addr = {
    mds = "https://vault-mds.mediaset.es"
    aws = "https://vault-aws.awsinternal.mediaset.es"
    azr = "https://vault-azr.azrinternal.mediaset.es"
  }

}
provider "vault" {
  alias  = "mds"
  address = local.vault_addr["mds"]
  token = var.token_vault_mds
  skip_tls_verify = true
  #  auth_login_oidc {
  #    role = "Default"
  #  }
}
provider "vault" {
  alias  = "aws"
  address = local.vault_addr["aws"]
  token = var.token_vault_aws
  skip_tls_verify = true
  #  auth_login_oidc {
  #    role = "Default"
  #  }
}
provider "vault" {
  alias  = "azr"
  address = local.vault_addr["azr"]
  token = var.token_vault_azr
  skip_tls_verify = true
  #  auth_login_oidc {
  #    role = "Default"
  #  }
}


provider "helm" {
  kubernetes = {
    config_path    = "~/.kube/config"
    config_context = local.k8s-context[terraform.workspace]
  }
}

provider "kubernetes" {
  config_path    = "~/.kube/config"
  config_context = local.k8s-context[terraform.workspace]
}

provider "kubectl" {
  config_path    = "~/.kube/config"
  config_context = local.k8s-context[terraform.workspace]
}

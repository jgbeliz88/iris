locals {
  local_data = jsondecode(file("${path.module}/../../project.json"))
}

locals {
  environment = {
    dev = "dev"
    pre = "pre"
    pro = "pro"
  }
  backend_name_role = {
    dev = "rancher-${terraform.workspace}-k8s-${terraform.workspace}"
    pre = "rancher-${terraform.workspace}-k8s-${terraform.workspace}"
    pro = "rancher-${terraform.workspace}-k8s-${terraform.workspace}"
  }
}

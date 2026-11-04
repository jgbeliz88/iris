resource "vault_generic_secret" "initial_path_secrets" {
  for_each = toset(local.local_data["terraform"]["vault_paths"]) # note: each.key and each.value are the same for a set

  path         = "${local.local_data["terraform"]["vault_main_path"]}/${local.local_data["project_name"]}/${each.value}"
  disable_read = true
  data_json = jsonencode({
    init_key = "valor-0"
  })
}

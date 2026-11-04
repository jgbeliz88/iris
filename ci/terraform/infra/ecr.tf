resource "aws_ecr_repository" "repository" {
  provider = aws.sharedservicespro

  name                 = local.local_data["project_name"]
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository_policy" "eks_ecr_policy" {
  provider = aws.sharedservicespro

  repository = aws_ecr_repository.repository.name
  policy = templatefile(
    "${path.module}/templates/ecr-policy.tpl",
    {
      "rolearn" = flatten([
        "arn:aws:iam::${data.terraform_remote_state.eks_int.outputs.account_id}:root",
        "arn:aws:iam::${data.terraform_remote_state.eks_pre.outputs.account_id}:root",
        "arn:aws:iam::${data.terraform_remote_state.eks_pro.outputs.account_id}:root"
      ])
    }
  )
}

resource "aws_ecr_lifecycle_policy" "lastimages" {
  provider   = aws.sharedservicespro
  repository = aws_ecr_repository.repository.name
  policy     = <<EOF
    {
      "rules": [
        {
          "rulePriority": 1,
          "description": "Keep last 20 images in pro",
          "selection": {
              "tagStatus": "tagged",
              "tagPrefixList": ["pro"],
              "countType": "imageCountMoreThan",
              "countNumber": 20
          },
          "action": {
              "type": "expire"
          }
        },
        {
          "rulePriority": 2,
          "description": "Keep last 20 images in pre",
          "selection": {
              "tagStatus": "tagged",
              "tagPrefixList": ["pre"],
              "countType": "imageCountMoreThan",
              "countNumber": 20
          },
          "action": {
              "type": "expire"
          }
        },
        {
          "rulePriority": 3,
          "description": "Keep last 20 images in int",
          "selection": {
              "tagStatus": "tagged",
              "tagPrefixList": ["int"],
              "countType": "imageCountMoreThan",
              "countNumber": 20
          },
          "action": {
              "type": "expire"
          }
        }
      ]
    }
    EOF
  depends_on = [aws_ecr_repository.repository]
}

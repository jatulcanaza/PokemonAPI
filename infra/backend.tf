terraform {
  backend "s3" {
    bucket         = "asg-alb-terraform-state"   # tu bucket S3
    key            = "terraform.tfstate"         # ruta y nombre del archivo de estado
    region         = "us-east-1"                 # región donde está el bucket
    dynamodb_table = "terraform-lock"            # tu tabla DynamoDB para locking
    encrypt        = true                        # cifrado del state
  }
}

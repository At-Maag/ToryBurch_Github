# add Terraform and provider

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# configure the aws provider
provider "aws" {
  shared_config_files      = ["~/.aws/config"]
  shared_credentials_files = ["~/.aws/credentials"]
  profile                  = "vscodeaws"
  region                   = "us-west-2"
}

module "vpc" {
  source     = "./modules/vpc"
  cidr_block = "10.16.0.0/16"

  tags = {
    Name = "ToryBurch-vpc"
  }

}



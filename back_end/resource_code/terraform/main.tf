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

resource "aws_vpc" "main-vpc" {
  cidr_block = var.vpc_cidr_block
  tags       = var.resource_tags
}


resource "aws_internet_gateway" "main-igw" {
  vpc_id = aws_vpc.main-vpc.id # this value will be the id of the vpc created above
  tags   = var.resource_tags
}

resource "aws_subnet" "pub-subnet-1" {
  vpc_id                  = aws_vpc.main-vpc.id # reference the vpc created above
  cidr_block              = var.pub_subnet_cidr_blocks[0]
  availability_zone       = var.availability_zones[0]
  map_public_ip_on_launch = true
  tags                    = var.resource_tags
}

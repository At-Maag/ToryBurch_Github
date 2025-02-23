# add Terraform and provider

module "main-vpc" {
  source               = "./modules/vpc"
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = var.resource_tags
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

# add Terraform and provider

resource "aws_vpc" "main-vpc" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = var.resource_tags
}

resource "aws_internet_gateway" "main-igw" {
  vpc_id = aws_vpc.main-vpc.id # this value will be the id of the vpc created above
  tags   = var.resource_tags
}

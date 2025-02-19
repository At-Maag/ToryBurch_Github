# add Terraform and provider

resource "aws_vpc" "main-vpc" {
  cidr_block           = var.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags                 = var.resource_tags

}

resource "aws_vpc" "main-vpc" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  tags = var.tags # this is a map of tags
}

resource "aws_subnet" "public-subnet" {
  vpc_id                  = aws_vpc.main-vpc.id
  cidr_block              = var.public_subnet_cidr_block
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = var.map_public_ip_on_launch

  #add custom tags
  tags = merge(var.tags, {
    Name = "ToryBurch-public-subnet"
  })
}

resource "aws_subnet" "private-subnet" {
  vpc_id                  = aws_vpc.main-vpc.id
  cidr_block              = var.private_subnet_cidr_block
  availability_zone       = var.availability_zone
  map_public_ip_on_launch = false

  #add custom tags
  tags = merge(var.tags, {
    Name = "ToryBurch-private-subnet"
  })
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main-vpc.id

  #add custom tags
  tags = merge(var.tags, {
    Name = "ToryBurch-igw"
  })
}

#public subnet route table  
resource "aws_route_table" "public-route-table" {
  vpc_id = aws_vpc.main-vpc.id

  #add custom tags
  tags = merge(var.tags, {
    Name = "ToryBurch-public-route-table"
  })
}



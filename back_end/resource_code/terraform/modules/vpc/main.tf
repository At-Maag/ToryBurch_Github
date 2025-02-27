resource "aws_vpc" "main-vpc" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = var.enable_dns_hostnames
  enable_dns_support   = var.enable_dns_support

  tags = var.tags # this is a map of tags
}

resource "aws_subnet" "public-subnet-1" {
  vpc_id                  = aws_vpc.main-vpc.id
  cidr_block              = "10.16.0.0/20"
  availability_zone       = var.availability_zone-1
  map_public_ip_on_launch = var.map_public_ip_on_launch

  #add custom tags
  tags = merge(var.tags, {
    Name = "ToryBurch-public-subnet-2a"
  })
}

resource "aws_subnet" "private-subnet-1" {
  vpc_id                  = aws_vpc.main-vpc.id
  cidr_block              = "10.16.16.0/20"
  availability_zone       = var.availability_zone-1
  map_public_ip_on_launch = false

  #add custom tags
  tags = merge(var.tags, {
    Name = "ToryBurch-private-subnet-2a"
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

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
  #add custom tags
  tags = merge(var.tags, {
    Name = "ToryBurch-public-route-table"
  })
}

#associate public subnet with public route table
resource "aws_route_table_association" "public-subnet-association" {
  subnet_id      = aws_subnet.public-subnet-1.id
  route_table_id = aws_route_table.public-route-table.id
}


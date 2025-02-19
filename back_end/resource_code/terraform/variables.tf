variable "cidr_block" {
  description = "The CIDR block for the VPC"
  type        = string
  default     = "10.16.0.0/16"
}

variable "resource_tags" {
  description = "The tags for the resources"
  type        = map(string)
  default = {
    Name = "main-vpc"
  }
}

variable "pub_subnet_cidr_blocks" {
  description = "The CIDR blocks for the public subnets"
  type        = list(string)
  default     = ["10.16.0.0/20", "10.16.16.0/20"]
}

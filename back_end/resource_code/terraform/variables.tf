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

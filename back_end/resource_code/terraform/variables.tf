



variable "availability_zones" {
  description = "The availability zones for the subnets"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
}

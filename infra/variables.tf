variable "region" {
  type    = string
  default = "us-east-1"
}

variable "ami_id" {
  type    = string
  default = "ami-07070cf6e813c48d2"
}

variable "key_name" {
  type    = string
  default = "Test1Key"  
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

variable "min_size" {
  type    = number
  default = 4
}

variable "max_size" {
  type    = number
  default = 6
}

variable "desired_capacity" {
  type    = number
  default = 4
}

variable "vpc_id" {
  type    = string
  default = "vpc-0dcfd137cf926af7f"
}

variable "subnet_ids" {
  type = list(string)
  default = [
    "subnet-03171d3511605c122",
    "subnet-0264883beacbddb82",
    "subnet-0c3340ce7d8f4c76e",
    "subnet-078d016ad93fea79e",
    "subnet-0460f63fa0818c0b9",
    "subnet-0366741689d860bb4"
  ]
}

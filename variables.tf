variable "project" {
  type = string
}

variable "region" {
  type = string
}

variable "service_account" {
  type = string
}

variable "pubsub_topic" {
  type = string
}

variable "email_client_id" {
  type = string
}

variable "email_client_password" {
  type = string
  sensitive = true
}

variable "email_receivers" {
  type = list(string)
}

variable "email_subject" {
  type = string
}

variable "email_content" {
  type = string
}

variable "path" {
  type = string
}
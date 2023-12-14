# Creates bucket to store the archive
resource "google_storage_bucket" "function_bucket" {
  name                        = "bkt-${var.project}-gcf-email-sender-source"
  location                    = var.region
  project                     = var.project
  uniform_bucket_level_access = true
}

data "archive_file" "source" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "tmp/function.zip"
  excludes    = [""]
}

resource "google_storage_bucket_object" "zip" {
  source       = data.archive_file.source.output_path
  content_type = "application/zip"
  name         = "src-${data.archive_file.source.output_md5}.zip"
  bucket       = google_storage_bucket.function_bucket.name
}

# Create the Cloud function 
resource "google_cloudfunctions_function" "send_email_function" {
  name                  = "gcf-pubsub-email-sender"
  project               = var.project
  region                = var.region
  runtime               = "nodejs20"
  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.function_bucket.name
  source_archive_object = google_storage_bucket_object.zip.name
  entry_point           = "SendEmail"
  timeout               = 60
  service_account_email = var.service_account
  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = var.pubsub_topic
    failure_policy {
      retry = true
    }
  }
  environment_variables = {
    "EMAIL_RECEIVERS" = join(",",var.email_receivers)
    "USER" = var.email_client_id
    "PASS" = var.email_client_password
  }

  timeouts {
    create = "30m"
    update = "30m"
    delete = "30m"
  }
}

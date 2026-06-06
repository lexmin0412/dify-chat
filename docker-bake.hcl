variable "DOCKERHUB_USERNAME" {
  default = "lexmin0412"
}

variable "VERSION" {
  default = "latest"
}

group "default" {
  targets = ["app"]
}

target "app" {
  context = "."
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${DOCKERHUB_USERNAME}/dify-app-hub:${VERSION}",
    "${VERSION}" != "latest" && length(regexall("-", "${VERSION}")) == 0 ? "${DOCKERHUB_USERNAME}/dify-app-hub:latest" : "",
    "${VERSION}" != "latest" && length(regexall("-", "${VERSION}")) > 0 ? "${DOCKERHUB_USERNAME}/dify-app-hub:beta" : ""
  ]
}

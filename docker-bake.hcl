variable "DOCKERHUB_USERNAME" {
  default = "lexmin0412"
}

variable "VERSION" {
  default = "latest"
}

group "default" {
  targets = ["platform"]
}

target "platform" {
  context = "."
  dockerfile = "Dockerfile_platform"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${DOCKERHUB_USERNAME}/dify-chat-platform:${VERSION}",
    "${VERSION}" != "latest" ? "${DOCKERHUB_USERNAME}/dify-chat-platform:latest" : ""
  ]
}

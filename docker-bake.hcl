variable "DOCKERHUB_USERNAME" {
  default = "lexmin0412"
}

variable "VERSION" {
  default = "latest"
}

group "default" {
  targets = ["react-app", "platform"]
}

target "react-app" {
  context = "."
  dockerfile = "Dockerfile_react_app"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = [
    "${DOCKERHUB_USERNAME}/dify-chat-app-react:${VERSION}",
    "${VERSION}" != "latest" ? "${DOCKERHUB_USERNAME}/dify-chat-app-react:latest" : ""
  ]
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

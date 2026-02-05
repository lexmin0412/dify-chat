#!/bin/bash

# Dify Chat Docker 镜像构建和推送脚本
# 用法: ./scripts/docker-build.sh [版本号] [DockerHub用户名]
# 示例: ./scripts/docker-build.sh v1.0.0 yourusername

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取参数
VERSION=${1:-"latest"}
DOCKERHUB_USERNAME=${2:-""}

# 镜像名称配置
REACT_APP_IMAGE="dify-chat-app-react"
PLATFORM_IMAGE="dify-chat-platform"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    print_error "Docker 未安装或不在 PATH 中"
    exit 1
fi

# 检查 Buildx 是否可用
BUILDX_AVAILABLE=false
if docker buildx version &> /dev/null; then
    BUILDX_AVAILABLE=true
fi

# 检查是否在项目根目录
if [ ! -f "package.json" ] || [ ! -f "docker-compose.yml" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

print_info "开始构建 Dify Chat Docker 镜像..."
print_info "版本: $VERSION"

# 构建逻辑
if [ "$COMPOSE_BAKE" = "true" ] && [ "$BUILDX_AVAILABLE" = "true" ]; then
    print_info "使用 Docker Buildx Bake 进行多平台构建..."

    # 准备环境变量
    export VERSION=$VERSION
    export DOCKERHUB_USERNAME=$DOCKERHUB_USERNAME

    BAKE_ARGS="--push"
    if [ "$AUTO_PUSH" != "true" ] && [ "$CI" != "true" ]; then
        BAKE_ARGS="--load"
    fi

    # 使用 docker-bake.hcl
    if [ -f "docker-bake.hcl" ]; then
        docker buildx bake -f docker-bake.hcl $BAKE_ARGS
    else
        # 降级到 compose 文件 (如果存在 build 字段)
        docker buildx bake $BAKE_ARGS
    fi

    if [ $? -eq 0 ]; then
        print_success "Buildx Bake 构建并推送完成: $VERSION"
    else
        print_error "Buildx Bake 构建失败"
        exit 1
    fi
else
    # 构建并推送逻辑 (非 Bake 模式)
    PUSH_ARG=""
    if [ "$AUTO_PUSH" = "true" ] || [ "$CI" = "true" ]; then
        if [ "$BUILDX_AVAILABLE" = "true" ]; then
            PUSH_ARG="--push"
        fi
    fi

    # 构建 React App 镜像
    print_info "构建 React App 镜像..."
    if [ "$BUILDX_AVAILABLE" = "true" ]; then
        # 如果是多平台构建且需要推送，直接使用 buildx build --push
        if [ -n "$PUSH_ARG" ] && [ -n "$DOCKERHUB_USERNAME" ]; then
            docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile_react_app \
                -t ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:${VERSION} \
                $( [ "$VERSION" != "latest" ] && echo "-t ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:latest" ) \
                --push .
        else
            docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile_react_app -t ${REACT_APP_IMAGE}:${VERSION} --load .
        fi
    else
        docker build -f Dockerfile_react_app -t ${REACT_APP_IMAGE}:${VERSION} .
    fi

    if [ $? -eq 0 ]; then
        print_success "React App 镜像构建完成"
    else
        print_error "React App 镜像构建失败"
        exit 1
    fi

    # 构建 Platform 镜像
    print_info "构建 Platform 镜像..."
    if [ "$BUILDX_AVAILABLE" = "true" ]; then
        if [ -n "$PUSH_ARG" ] && [ -n "$DOCKERHUB_USERNAME" ]; then
            docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile_platform \
                -t ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:${VERSION} \
                $( [ "$VERSION" != "latest" ] && echo "-t ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:latest" ) \
                --push .
        else
            docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile_platform -t ${PLATFORM_IMAGE}:${VERSION} --load .
        fi
    else
        docker build -f Dockerfile_platform -t ${PLATFORM_IMAGE}:${VERSION} .
    fi

    if [ $? -eq 0 ]; then
        print_success "Platform 镜像构建完成"
    else
        print_error "Platform 镜像构建失败"
        exit 1
    fi
fi

# 如果是 Bake 模式或者已经通过 buildx --push 推送，则跳过后面的手动推送逻辑
if [ "$COMPOSE_BAKE" = "true" ] || ([ "$BUILDX_AVAILABLE" = "true" ] && [ -n "$PUSH_ARG" ]); then
    print_success "构建和推送任务已完成 (通过 Buildx)"
    exit 0
fi

# =================================================================================================
# 以下逻辑仅在非 Bake 且非 Buildx Push 模式下执行 (主要用于本地单架构构建)
# =================================================================================================

# 如果版本不是 latest，也创建 latest 标签
if [ "$VERSION" != "latest" ]; then
    print_info "创建 latest 标签..."
    docker tag ${REACT_APP_IMAGE}:${VERSION} ${REACT_APP_IMAGE}:latest
    docker tag ${PLATFORM_IMAGE}:${VERSION} ${PLATFORM_IMAGE}:latest
    print_success "latest 标签创建完成"
fi

# 显示构建的镜像
print_info "构建完成的镜像:"
docker images | grep -E "(${REACT_APP_IMAGE}|${PLATFORM_IMAGE})" | head -10

# 如果提供了 DockerHub 用户名，询问是否推送；在 CI 或设置 AUTO_PUSH=true 时自动推送
if [ -n "$DOCKERHUB_USERNAME" ]; then
    if [ "$CI" = "true" ] || [ "$AUTO_PUSH" = "true" ]; then
        REPLY="y"
    else
        echo
        read -p "是否要推送镜像到 DockerHub ($DOCKERHUB_USERNAME)? [y/N]: " -n 1 -r
        echo
    fi

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "开始推送镜像到 DockerHub..."

        # 检查是否已登录 Docker Hub
        if ! docker system info --format '{{.RegistryConfig.IndexConfigs}}' | grep -q "docker.io" 2>/dev/null && \
           ! [ -f ~/.docker/config.json ] || ! grep -q "index.docker.io" ~/.docker/config.json 2>/dev/null; then
            print_warning "请先登录 Docker Hub: docker login"
            exit 1
        fi

        # 为镜像添加 DockerHub 标签
        print_info "添加 DockerHub 标签..."
        docker tag ${REACT_APP_IMAGE}:${VERSION} ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:${VERSION}
        docker tag ${PLATFORM_IMAGE}:${VERSION} ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:${VERSION}

        if [ "$VERSION" != "latest" ]; then
            docker tag ${REACT_APP_IMAGE}:latest ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:latest
            docker tag ${PLATFORM_IMAGE}:latest ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:latest
        fi

        # 推送镜像
        print_info "推送 React App 镜像..."
        docker push ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:${VERSION}
        if [ "$VERSION" != "latest" ]; then
            docker push ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:latest
        fi

        print_info "推送 Platform 镜像..."
        docker push ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:${VERSION}
        if [ "$VERSION" != "latest" ]; then
            docker push ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:latest
        fi

        print_success "镜像推送完成!"
        print_info "React App 镜像: ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:${VERSION}"
        print_info "Platform 镜像: ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:${VERSION}"

        # 生成使用示例
        echo
        print_info "使用示例:"
        echo "docker pull ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:${VERSION}"
        echo "docker pull ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:${VERSION}"
        echo
        echo "或者更新 docker-compose.yml 中的镜像名称:"
        echo "  react-app:"
        echo "    image: ${DOCKERHUB_USERNAME}/${REACT_APP_IMAGE}:${VERSION}"
        echo "  platform:"
        echo "    image: ${DOCKERHUB_USERNAME}/${PLATFORM_IMAGE}:${VERSION}"
    fi
fi

print_success "脚本执行完成!"

# 内容渲染

Dify Chat 支持对 AI 回复的各种内容进行渲染，包括图片、视频、代码、图表，以及 Dify 自身返回的各种特殊格式。

## 深度思考标签

目前流行的深度思考标签主要有两种：

- `<think>`
- `<details>`

以上两种标签在 Dify Chat 中都被很好地支持，展示效果如下：

![深度思考](/sample_think_tag.png)

## Chatflow / Workflow 工作流日志

在 Dify 的 Chatflow/Workflow 类型应用运行时，Dify API 会返回工作流日志，展示形式如下：

![Workflow Logs](/sample_workflow.png)

## Agent 调用工具

在 Dify 的 Agent 类型应用运行时，如果有调用到工具，Dify API 会返回工具的调用日志，展示形式如下：

![Agent 调用工具截图](/guide_app_agent.png)

## 知识库引用链接

在 AI 回复过程中，如果引用到了知识库的内容，展示效果如下：

![知识库引用](/sample_knowledge_base_link.png)

当鼠标 hover 到引用链接上时，会展示具体的片段：

![知识库引用-详情](/sample_knowledge_base_link_hover.png)

## Echarts 图表

支持渲染通过官方的图表插件生成的，或符合 Echarts 数据格式的代码块为图表：

![Echarts](/sample_echarts.png)

## Mermaid 图表

Mermaid 是一种流行的文本绘图格式，展示效果如下：

![Mermaid](/guide__sample_mermaid.png)

## 文件卡片

如果用户发送或者 AI 回复了文件，在对话中的展示效果如下：

![文件卡片](/sample_file.jpg)

## 回复表单

Dify 支持通过 `jinja2` 来配置回复表单供用户填写，本项目也支持了对应的功能。

Dify Chatflow 编排的回复内容示例：

```html
<form data-format="json">
  <label for="username">用户名字:</label>
  <input type="text" name="username" value="{{ username }}" />
  <label for="phone">联系电话:</label>
  <input type="text" name="phone" value="{{ phone }}" />
  <label for="content">投诉内容:</label>
  <textarea name="content"></textarea>
  <button data-size="small" data-variant="primary">提交</button>
</form>
```

> 注意：
>
> - 你需要自行在 Chatflow 中对 `sys.query` 进行正确的逻辑处理，区分普通消息、触发表单的消息及提交信息。
> - form 标签的 `data-format` 属性用于指定表单数据的格式，目前支持 `json` 和 `text` 两种格式。

按照上面的内容回复后，默认情况下，在用户点击表单的提交按钮后，会将表单的值对象作为消息发送给同一个 Dify 应用，同时会在消息列表中展示。提交消息的示例文本：

```json
{
	"username": "lexmin",
	"phone": "13123456789",
	"content": "快递太慢啦，我要举报",
	"isFormSubmit": true
}
```

其中，`isFormSubmit` 字段用于标识这是一个表单提交的消息, 你可以在 Chatflow 编排的条件分支中使用它来进行判断消息类型。

![回复表单](/guide__sample_form.png)

### 自定义提交消息文本

如果你不想展示具体的表单值 json 字符串，而是需要自定义发送的消息文本，可以按照下面的指引，在应用配置中进行配置（此配置只影响界面展示，实际提交到 Dify Chatflow 开始节点的仍然是用户填写的表单值 json 字符串）。

**多应用模式**

在添加/更新应用配置弹窗中填写字段：

- 表单回复 - 设置为 "启用"
- 提交消息文本 - 用于替换表单值对象的文本，如 "我提交了一个表单"

![回复表单-配置](/guide__sample_form_answer_config.png)

按照如上配置后，效果如下：

![回复表单](/guide__sample_form.png)

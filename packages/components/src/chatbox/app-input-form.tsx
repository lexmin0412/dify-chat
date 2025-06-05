import {
	DifyApi,
	IUserInputFormItemType,
	IUserInputFormItemValueBase,
} from "@dify-chat/api";
import { useAppContext, useDifyChat } from "@dify-chat/core";
import { useConversationsContext } from "@dify-chat/core";
import { isTempId, unParseGzipString } from "@dify-chat/helpers";
import {
	Form,
	FormInstance,
	FormItemProps,
	Input,
	InputNumber,
	message,
	Select,
} from "antd";
import { useHistory, useSearchParams } from "pure-react-router";
import { useEffect, useRef, useState } from "react";

import FileUpload, { IUploadFileItem } from "./form-controls/file-upload";

export type IConversationEntryFormItem = FormItemProps &
	Pick<
		IUserInputFormItemValueBase,
		"options" | "max_length" | "allowed_file_types"
	> & {
		type: IUserInputFormItemType;
	};

const SUPPORTED_CONTROL_TYPES = [
	"text-input",
	"select",
	"number",
	"paragraph",
	"file",
	"file-list",
];

export interface IAppInputFormProps {
	/**
	 * 表单是否禁用
	 */
	disabled?: boolean;
	/**
	 * 表单是否填写
	 */
	formFilled: boolean;
	/**
	 * 表单填写状态改变回调
	 */
	onStartConversation: (formValues: Record<string, unknown>) => void;
	/**
	 * 应用入参的表单实例
	 */
	// FIXME: any 类型后续优化 @ts-expect-error
	entryForm: FormInstance<Record<string, unknown>>;
	uploadFileApi: DifyApi["uploadFile"];
}

/**
 * 应用输入表单
 */
export default function AppInputForm(props: IAppInputFormProps) {
	const { entryForm, uploadFileApi, disabled } = props;
	const { currentApp } = useAppContext();
	const { currentConversationId, currentConversationInfo, setConversations } =
		useConversationsContext();
	const history = useHistory();
	const { currentAppId } = useAppContext();
	const searchParams = useSearchParams();
	const [userInputItems, setUserInputItems] = useState<
		IConversationEntryFormItem[]
	>([]);
	const cachedSearchParams = useRef<URLSearchParams>(
		new URLSearchParams(searchParams),
	);
	const { mode } = useDifyChat();

	useEffect(() => {
		const user_input_form = currentApp?.parameters.user_input_form;
		if (!user_input_form?.length) {
			setUserInputItems([]);
			return;
		}
		setUserInputItems(
			user_input_form?.map((item) => {
				const fieldType = Object.keys(item)[0];
				const fieldInfo = Object.values(item)[0];
				const originalProps = fieldInfo;
				const baseProps: IConversationEntryFormItem = {
					type: fieldType as IUserInputFormItemType,
					label: originalProps.label,
					name: originalProps.variable,
					options: originalProps.options,
					max_length: originalProps.max_length,
					allowed_file_types: originalProps.allowed_file_types,
				};
				const searchValue = cachedSearchParams.current.get(
					originalProps.variable,
				);
				if (searchValue) {
					const { error, data } = unParseGzipString(searchValue);

					if (error) {
						message.error(
							`解压缩参数 ${originalProps.variable} 失败: ${error}`,
						);
					}

					// 解析正常且是新对话 或者允许更新对话参数，则写入 URL 参数
					if (
						(!error && isTempId(currentConversationId)) ||
						currentApp?.config?.inputParams?.enableUpdateAfterCvstStarts
					) {
						// 新对话或者允许更新对话参数, 则更新表单值
						entryForm.setFieldValue(originalProps.variable, data);
						cachedSearchParams.current.delete(originalProps.variable);
					} else {
						entryForm.setFieldValue(
							originalProps.variable,
							currentConversationInfo?.inputs?.[originalProps.variable],
						);
					}
				} else {
					let fieldValue =
						currentConversationInfo?.inputs?.[originalProps.variable];
					if (originalProps.type === "file-list") {
						fieldValue = (fieldValue as IUploadFileItem[])?.map((file) => ({
							...file,
							name: file.name || file.filename,
							url: file.url || file.remote_url,
							status: file.status || "done",
							upload_file_id: file.upload_file_id || file.related_id,
						}));
					} else if (originalProps.type === "file") {
						if (fieldValue) {
							const {
								name,
								filename,
								url,
								remote_url,
								upload_file_id,
								related_id,
								status,
							} = fieldValue as IUploadFileItem;
							fieldValue = {
								...fieldValue,
								name: name || filename,
								url: url || remote_url,
								status: status || "done",
								upload_file_id: upload_file_id || related_id,
							} as IUploadFileItem;
						}
					}
					entryForm.setFieldValue(originalProps.variable, fieldValue);
				}
				if (originalProps.required) {
					baseProps.required = true;
					baseProps.rules = [{ required: true, message: "请输入" }];
				}
				return baseProps;
			}) || [],
		);
		// 如果处理后的参数数量和之前的不一致，表示有表单相关，更新 URL
		if (searchParams.size !== cachedSearchParams.current.size) {
			if (cachedSearchParams.current.has("isNewCvst")) {
				cachedSearchParams.current.delete("isNewCvst");
			}
			const searchString = cachedSearchParams.current.size
				? `?${cachedSearchParams.current.toString()}`
				: "";
			if (mode === "multiApp") {
				history.push(`/app/${currentAppId}${searchString}`);
			} else {
				history.push(`/chat${searchString}`);
			}
		}
	}, [currentApp?.parameters.user_input_form, currentConversationInfo]);

	return (
		<>
			{currentApp?.parameters.user_input_form?.length ? (
				<>
					<Form
						layout="vertical"
						form={entryForm}
						labelCol={{ span: 5 }}
						onValuesChange={(_, allValues) => {
							setConversations((prev) => {
								return prev.map((item) => {
									if (item.id === currentConversationId) {
										return {
											...item,
											inputs: allValues,
										};
									}
									return item;
								});
							});
						}}
					>
						{userInputItems
							.filter((item) => SUPPORTED_CONTROL_TYPES.includes(item.type))
							.map((item) => {
								return (
									<Form.Item
										key={item.name}
										name={item.name}
										label={item.label}
										required={item.required}
										rules={
											item.required
												? [
														{
															required: true,
															message: `${item.label}不能为空`,
														},
													]
												: []
										}
									>
										{item.type === "text-input" ? (
											<Input
												placeholder="请输入"
												maxLength={item.max_length}
												disabled={disabled}
											/>
										) : item.type === "select" ? (
											<Select
												placeholder="请选择"
												disabled={disabled}
												options={
													item.options?.map((option) => {
														return {
															value: option,
															label: option,
														};
													}) || []
												}
											/>
										) : item.type === "paragraph" ? (
											<Input.TextArea
												placeholder="请输入"
												disabled={disabled}
												maxLength={item.max_length}
											/>
										) : item.type === "number" ? (
											<InputNumber
												placeholder="请输入"
												disabled={disabled}
												className="w-full"
											/>
										) : item.type === "file" ? (
											<FileUpload
												mode="single"
												disabled={disabled}
												allowed_file_types={item.allowed_file_types || []}
												uploadFileApi={uploadFileApi}
											/>
										) : item.type === "file-list" ? (
											<FileUpload
												maxCount={item.max_length!}
												disabled={disabled}
												allowed_file_types={item.allowed_file_types || []}
												uploadFileApi={uploadFileApi}
											/>
										) : (
											`暂不支持的控件类型: ${item.type}`
										)}
									</Form.Item>
								);
							})}
					</Form>
				</>
			) : null}
		</>
	);
}

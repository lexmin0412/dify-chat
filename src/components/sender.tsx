import { CloudUploadOutlined, LinkOutlined } from '@ant-design/icons';
import { Attachments, AttachmentsProps, Sender } from '@ant-design/x';
import { Badge, Button, GetProp, GetRef } from 'antd';
import { useRef, useState } from 'react';
import { DifyApi, IFile } from '@dify-chat/api';

interface ISenderWrapperProps {
  difyApi: DifyApi;
  content: string;
  isRequesting: boolean;
  onChange: (value: string) => void;
  onSubmit: (value: string, files?: IFile[]) => void;
  className?: string;
  onCancel: () => void
}

/**
 * 用户消息发送区
 */
export default function SenderWrapper(props: ISenderWrapperProps) {
  const { content, isRequesting, onChange, onSubmit, className, difyApi, onCancel } =
    props;
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<GetProp<AttachmentsProps, 'items'>>([]);
  const [fileIdMap, setFileIdMap] = useState<Map<string, string>>(new Map());

  const senderRef = useRef<GetRef<typeof Sender>>(null);
  const senderHeader = (
    <Sender.Header
      title="Attachments"
      open={open}
      onOpenChange={setOpen}
      styles={{
        content: {
          padding: 0,
        },
      }}
    >
      <Attachments
        beforeUpload={async (file) => {
          // 注意：此函数不要 return，否则预览区域的图片就展示不出来了
          const result = await difyApi.uploadFile(file);
          setFileIdMap((prevMap)=>{
            const nextMap = new Map(prevMap)
            nextMap.set(file.uid, result.id)
            return nextMap
          })
        }}
        items={files}
        onChange={({ fileList }) => setFiles(fileList)}
        placeholder={(type) =>
          type === 'drop'
            ? {
                title: 'Drop file here',
              }
            : {
                icon: <CloudUploadOutlined />,
                title: 'Upload files',
                description: 'Click or drag files to this area to upload',
              }
        }
        getDropContainer={() => senderRef.current?.nativeElement}
      />
    </Sender.Header>
  );

  return (
    <Sender
      header={senderHeader}
      value={content}
      onChange={onChange}
      prefix={
        <Badge dot={files.length > 0 && !open}>
          <Button onClick={() => setOpen(!open)} icon={<LinkOutlined />} />
        </Badge>
      }
      style={{
        boxShadow: '0px -2px 12px 4px #efefef'
      }}
      loading={isRequesting}
      className={className}
      onSubmit={async(content) => {
        await onSubmit(
          content,
          files?.map((file) => ({
            type: 'image',
            transfer_method: 'local_file',
            upload_file_id: fileIdMap.get(file.uid) as string,
          })) || [],
        );
        setFiles([]);
        setOpen(false)
      }}
      onCancel={onCancel}
    />
  );
}

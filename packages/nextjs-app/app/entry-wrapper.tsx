import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";

export default function EntryWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<AntdRegistry>
			<ConfigProvider>{children}</ConfigProvider>
		</AntdRegistry>
	);
}

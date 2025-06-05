import { useMount } from "ahooks";
import { useState } from "react";
import FingerPrintJS from "@fingerprintjs/fingerprintjs";

/**
 * 生成用户ID
 */
export const useUserId = (): string => {
	const [userId, setUserId] = useState<string>("");
	useMount(async () => {
		const fp = await FingerPrintJS.load();
		const result = await fp.get();
		setUserId(result.visitorId);
	});
	return userId || "";
};

import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
	/* config options here */
	env: {
		PROJECT_ROOT: path.resolve(__dirname),
	},
};

export default nextConfig;

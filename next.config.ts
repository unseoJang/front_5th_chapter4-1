import type { NextConfig } from "next"

const nextConfig: NextConfig = {
	/* config options here */
	output: "export",
	images: {
		unoptimized: true, // ✅ 정적 export에서 이미지 최적화 끔
	},
}

export default nextConfig

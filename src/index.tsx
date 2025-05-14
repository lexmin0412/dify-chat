import { legacyLogicalPropertiesTransformer, StyleProvider } from '@ant-design/cssinjs'
import { ThemeContextProvider } from '@dify-chat/theme'
import rybbit from '@rybbit/js'
import ReactDOM from 'react-dom/client'

import App from './App'

// 初始化 rybbit SDK
rybbit.init({
	analyticsHost: 'https://app.rybbit.io/api',
	siteId: '296',
})

const rootEl = document.getElementById('root')
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl)
	root.render(
		<ThemeContextProvider>
			<StyleProvider
				hashPriority="high"
				transformers={[legacyLogicalPropertiesTransformer]}
			>
				<App />
			</StyleProvider>
		</ThemeContextProvider>,
	)
}

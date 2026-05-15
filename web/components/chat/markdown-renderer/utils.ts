import classnames from 'classnames'
import { twMerge } from 'tailwind-merge'

export const cn = (...cls: classnames.ArgumentArray) => {
	return twMerge(classnames(cls))
}

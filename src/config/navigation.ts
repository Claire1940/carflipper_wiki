import {
	Ticket,
	BookOpen,
	Car,
	Wrench,
	Trophy,
	Warehouse,
	Award,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavigationItem {
	key: string // 用于翻译键，如 'codes' -> t('nav.codes')
	path: string // URL 路径，如 '/codes'
	icon: LucideIcon // Lucide 图标组件
	isContentType: boolean // 是否对应 content/ 目录
}

// 导航配置（Car Flipper 7 个内容分类，community 分类按要求排除）
export const NAVIGATION_CONFIG: NavigationItem[] = [
	{ key: 'codes', path: '/codes', icon: Ticket, isContentType: true },
	{ key: 'guide', path: '/guide', icon: BookOpen, isContentType: true },
	{ key: 'cars', path: '/cars', icon: Car, isContentType: true },
	{ key: 'upgrades', path: '/upgrades', icon: Wrench, isContentType: true },
	{ key: 'tier', path: '/tier', icon: Trophy, isContentType: true },
	{ key: 'workshop', path: '/workshop', icon: Warehouse, isContentType: true },
	{ key: 'achievements', path: '/achievements', icon: Award, isContentType: true },
]

// 从配置派生内容类型列表（用于路由和内容加载）
export const CONTENT_TYPES = NAVIGATION_CONFIG.filter((item) => item.isContentType).map(
	(item) => item.path.slice(1),
) // 移除开头的 '/' -> []

export type ContentType = (typeof CONTENT_TYPES)[number]

// 辅助函数：验证内容类型
export function isValidContentType(type: string): type is ContentType {
	return CONTENT_TYPES.includes(type as ContentType)
}

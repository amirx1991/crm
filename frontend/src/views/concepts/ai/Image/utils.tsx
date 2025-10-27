import {
    LuSquare,
    LuRectangleHorizontal,
    LuRectangleVertical,
} from 'react-icons/lu'
import { TbRectangle, TbBan } from 'react-icons/tb'

export const aspectRatioOptions = [
    {
        label: 'چشم‌انداز (4:3)',
        value: 'lanscape',
        icon: <TbRectangle />,
        isIcon: true,
    },
    {
        label: 'پرتره (9:16)',
        value: 'portrait',
        icon: <LuRectangleVertical />,
        isIcon: true,
    },
    {
        label: 'مربع (1:1)',
        value: 'square',
        icon: <LuSquare />,
        isIcon: true,
    },
    {
        label: 'وایداسکرین (16:9)',
        value: 'widescreen',
        icon: <LuRectangleHorizontal />,
        isIcon: true,
    },
]

export const styleOptions = [
    { label: 'بدون سبک', value: 'noStyle', icon: <TbBan />, isIcon: true },
    { label: 'سه‌بعدی', value: 'd3', image: '/static/img/thumbs/styles/3d.jpg' },
    { label: 'انیمه', value: 'anime', image: '/static/img/thumbs/styles/anime.jpg' },
    {
        label: 'هنر دیجیتال',
        value: 'digitalArt',
        image: '/static/img/thumbs/styles/digital-art.jpg',
    },
    {
        label: 'فانتزی',
        value: 'fantasy',
        image: '/static/img/thumbs/styles/fantasy.jpg',
    },
    {
        label: 'فوتوریستی',
        value: 'futuristic',
        image: '/static/img/thumbs/styles/futuristic.jpg',
    },
    {
        label: 'هندسی',
        value: 'geometric',
        image: '/static/img/thumbs/styles/geometric.jpg',
    },
    {
        label: 'مینیمالیستی',
        value: 'minimalist',
        image: '/static/img/thumbs/styles/minimalist.jpg',
    },
    {
        label: 'نقاشی',
        value: 'painting',
        image: '/static/img/thumbs/styles/painting.jpg',
    },
    {
        label: 'طراحی با مداد',
        value: 'pencilDrawing',
        image: '/static/img/thumbs/styles/pencil-drawing.jpg',
    },
    { label: 'پیکسل', value: 'pixel', image: '/static/img/thumbs/styles/pixel.jpg' },
]

export const toneOptions = [
    { label: 'بدون تن', value: 'noTone', icon: <TbBan />, isIcon: true },
    {
        label: 'سیاه و سفید',
        value: 'blackAndWhite',
        image: '/static/img/thumbs/tone/black-and-white.jpg',
    },
    {
        label: 'تن سرد',
        value: 'coolTone',
        image: '/static/img/thumbs/tone/cool-tone.jpg',
    },
    { label: 'طلایی', value: 'golden', image: '/static/img/thumbs/tone/golden.jpg' },
    {
        label: 'رنگ ملایم',
        value: 'mutedColor',
        image: '/static/img/thumbs/tone/muted-color.jpg',
    },
    { label: 'پاستل', value: 'pastel', image: '/static/img/thumbs/tone/pastel.jpg' },
    {
        label: 'تن گرم',
        value: 'warmTone',
        image: '/static/img/thumbs/tone/warm-tone.jpg',
    },
]

export const lightingOptions = [
    {
        label: 'بدون نورپردازی',
        value: 'noLighting',
        icon: <TbBan />,
        isIcon: true,
    },
    {
        label: 'نورپردازی پشت',
        value: 'backLighting',
        image: '/static/img/thumbs/lighting/back-lighting.jpg',
    },
    {
        label: 'دراماتیک',
        value: 'dramatic',
        image: '/static/img/thumbs/lighting/dramatic.jpg',
    },
    {
        label: 'ساعت طلایی',
        value: 'goldenHour',
        image: '/static/img/thumbs/lighting/golden-hour.jpg',
    },
    { label: 'سخت', value: 'harsh', image: '/static/img/thumbs/lighting/harsh.jpg' },
    {
        label: 'نوردهی طولانی',
        value: 'longExpose',
        image: '/static/img/thumbs/lighting/long-expose.jpg',
    },
    {
        label: 'نور کم',
        value: 'lowLight',
        image: '/static/img/thumbs/lighting/low-light.jpg',
    },
    {
        label: 'نوردهی چندگانه',
        value: 'multiExpose',
        image: '/static/img/thumbs/lighting/multi-expose.jpg',
    },
    {
        label: 'استودیو',
        value: 'studio',
        image: '/static/img/thumbs/lighting/studio.jpg',
    },
    {
        label: 'سورئال',
        value: 'sunreal',
        image: '/static/img/thumbs/lighting/sunreal.jpg',
    },
]

export const cameraOptions = [
    { label: 'بدون دوربین', value: 'noCamera', icon: <TbBan />, isIcon: true },
    {
        label: 'نمای نزدیک',
        value: 'closeUp',
        image: '/static/img/thumbs/camera/close-up.jpg',
    },
    {
        label: 'جزئیات',
        value: 'detailed',
        image: '/static/img/thumbs/camera/detailed.jpg',
    },
    {
        label: 'چشم‌انداز',
        value: 'landscape',
        image: '/static/img/thumbs/camera/landscape.jpg',
    },
    {
        label: 'عکس از بالا',
        value: 'shotFromAbove',
        image: '/static/img/thumbs/camera/shot-from-above.jpg',
    },
    {
        label: 'عکس از پایین',
        value: 'shotFromBelow',
        image: '/static/img/thumbs/camera/shot-from-below.jpg',
    },
    {
        label: 'از طریق پنجره',
        value: 'throughWindow',
        image: '/static/img/thumbs/camera/through-window.jpg',
    },
    {
        label: 'زاویه باز',
        value: 'wideAngle',
        image: '/static/img/thumbs/camera/wide-angle.jpg',
    },
]

// Ambient shims for Arcade helpers missing from VS Code type service

declare namespace sprites {
	function setDataString(sprite: Sprite, key: string, value: string): void
	function readDataString(sprite: Sprite, key: string): string
}

type TextSprite = Sprite & {
	setText?(text: string): void
	setMaxFontHeight?(height: number): void
}

declare const textsprite: {
	create(text?: string, color?: number, font?: number): TextSprite
}

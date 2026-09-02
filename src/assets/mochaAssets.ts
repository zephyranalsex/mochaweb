import sourceImage from "./mocha-photo.jpg";

/*
 * The final PNGs are optional during development. Vite discovers them when
 * they are added, so replacing an image never requires editing components.
 */
const pngAssets = import.meta.glob("./Mocha-*.png", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

const resolveAsset = (name: string) => pngAssets[`./${name}.png`] ?? sourceImage;

export const mochaBackground = resolveAsset("Mocha-Background");
export const mochaGlobe = resolveAsset("Mocha-Globe");
export const mochaPaperclip = resolveAsset("Mocha-Paperclip");
export const mochaFace = resolveAsset("Mocha-Face");

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

export const mochaGlobe = resolveAsset("Mocha-Globe");
export const mochaPaperclip = resolveAsset("Mocha-Paperclip");
export const mochaFace = resolveAsset("Mocha-Face");

const BACKGROUND_RE = /^\.\/Mocha-Background(\d*)\.png$/;

const backgroundVariants = Object.keys(pngAssets)
  .filter((key) => BACKGROUND_RE.test(key))
  .sort((a, b) => {
    const na = Number(a.match(BACKGROUND_RE)![1] || 0);
    const nb = Number(b.match(BACKGROUND_RE)![1] || 0);
    return na - nb;
  })
  .map((key) => pngAssets[key]);

export function pickMochaBackground(): string {
  if (backgroundVariants.length === 0) return sourceImage;
  const i = Math.floor(Math.random() * backgroundVariants.length);
  return backgroundVariants[i];
}

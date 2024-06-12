import {
  clone,
  ColorSpace,
  get,
  OKLCH,
  parse,
  serialize,
  set,
  sRGB,
  to
} from "colorjs.io/fn";

ColorSpace.register(sRGB);
ColorSpace.register(OKLCH);

export function themeColorCss(color: string = "#00fff7") {
  const c = to(parse(color), "oklch");
  return {
    "--ttb-color-theme": serialize(c),
    "--ttb-color-theme-lighter": serialize(
      set(clone(c), {
        l: 0.75 + 0.2 * get(c, "l"),
        c: 0.5 * get(c, "c"),
      }),
    ),
    "--ttb-color-theme-light": serialize(
      set(clone(c), {
        l: 0.57 + 0.23 * get(c, "l"),
        c: 0.9 * get(c, "c"),
      }),
    ),
    "--ttb-color-theme-dark": serialize(
      set(clone(c), {
        l: 0.25 + 0.3 * get(c, "l"),
        c: 0.8 * get(c, "c"),
      }),
    ),
    "--ttb-color-theme-darker": serialize(
      set(clone(c), {
        l: 0.18 + 0.25 * get(c, "l"),
        c: 0.4 * get(c, "c"),
      }),
    ),
  };
}

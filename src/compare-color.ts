import Color from "colorjs.io";

// export const isSameColor = (colorA: string, colorB: string) =>
//   colorA.toLowerCase() === colorB.toLowerCase();

export const isSameColor = (colorA: string, colorB: string) => {
  let a, b;

  try {
    a = new Color(colorA);
  } catch (e) {
    return false;
  }

  try {
    b = new Color(colorB);
  } catch (e) {
    return false;
  }

  return a.equals(b);
};

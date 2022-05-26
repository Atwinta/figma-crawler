/**
 * Color Class
 * @source https://github.com/KarlRombauts/Figma-SCSS-Generator/blob/master/colors.js
 */
class Color {
  constructor(color) {
    this.rgba = {
      r: this.rgbToInt(color.r),
      g: this.rgbToInt(color.g),
      b: this.rgbToInt(color.b),
      a: color.a
    };
  }

  get hex() {
    return this.rgbToHex(this.rgba.r, this.rgba.g, this.rgba.b);
  }

  get css() {
    const { r, g, b, a } = this.rgba;
    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})` : this.hex;
  }

  get postcss() {
    const { a } = this.rgba;
    return a < 1 ? `color(${this.hex} a(${a.toFixed(2) * 100}%))` : this.hex;
  }

  rgbToInt(value) {
    return Math.floor(value * 255);
  }

  intToHex(int) {
    let hex = Number(int).toString(16);
    if (hex.length < 2) { hex = "0" + hex; }
    return hex;
  }

  rgbToHex(r, g, b) {
    return `#${this.intToHex(r)}${this.intToHex(g)}${this.intToHex(b)}`;
  }
}

module.exports = Color;

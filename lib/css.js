module.exports = {
  fontSize: (value) => {
    return `${value}px`;
  },

  lineHeight: (lineHeightPercentFontSize) => {
    return (lineHeightPercentFontSize / 100).toFixed(2);
  },

  letterSpacing: (value) => {
    return value !== 0 ? `${value}px` : 'normal';
  }
}

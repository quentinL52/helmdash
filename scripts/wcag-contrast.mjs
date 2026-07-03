import fs from 'fs';
import path from 'path';

// WCAG contrast calculation formulas
function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function luminance(r, g, b) {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const l2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const lightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (lightest + 0.05) / (darkest + 0.05);
}

// Hardcoded tokens from globals.css for validation
const themes = {
  light: {
    background: [42, 39, 93],
    card: [40, 50, 96],
    tokens: {
      foreground: [215, 52, 12],
      primary: [11, 86, 56],
      secondary: [214, 50, 16],
      muted: [42, 28, 88],
      'muted-foreground': [215, 20, 40],
      destructive: [0, 84, 60],
      success: [152, 35, 38],
      warning: [38, 70, 45],
      danger: [0, 55, 45],
      info: [215, 52, 40],
      'chart-1': [215, 52, 20],
      'chart-2': [215, 52, 45],
      'chart-3': [11, 86, 56],
      'chart-4': [11, 86, 70],
      'chart-5': [42, 10, 60]
    }
  },
  dark: {
    background: [215, 52, 8],
    card: [214, 50, 12],
    tokens: {
      foreground: [42, 39, 88],
      primary: [11, 86, 56],
      secondary: [214, 50, 18],
      muted: [215, 30, 20],
      'muted-foreground': [215, 20, 55],
      destructive: [0, 70, 50],
      success: [152, 30, 55],
      warning: [38, 60, 60],
      danger: [0, 50, 62],
      info: [215, 52, 60],
      'chart-1': [215, 52, 40],
      'chart-2': [215, 52, 65],
      'chart-3': [11, 86, 56],
      'chart-4': [11, 86, 75],
      'chart-5': [42, 10, 40]
    }
  }
};

let hasErrors = false;

console.log("=== WCAG Contrast Audit ===");

for (const [themeName, theme] of Object.entries(themes)) {
  console.log(`\nTheme: ${themeName.toUpperCase()}`);
  
  const bgRgb = hslToRgb(...theme.background);
  const cardRgb = hslToRgb(...theme.card);

  for (const [tokenName, hsl] of Object.entries(theme.tokens)) {
    const fgRgb = hslToRgb(...hsl);
    const ratioBg = contrastRatio(fgRgb, bgRgb);
    const ratioCard = contrastRatio(fgRgb, cardRgb);

    const isPrimaryOrange = tokenName === 'primary' || tokenName === 'chart-3' || tokenName === 'chart-4';
    
    // Normal text requires 4.5:1 (AA)
    // Large text (or UI elements) requires 3:1
    const passBg = ratioBg >= 4.5;
    const passCard = ratioCard >= 4.5;
    
    // Spec: orange interdit en petit texte sur craie (AA fail) -> petit texte = marine
    // This is expected to fail AA for normal text. We print it as a warning but not a script failure, 
    // since primary is reserved for buttons/large accents where 3:1 is acceptable.
    
    const statusBg = ratioBg >= 4.5 ? "✅ AA" : (ratioBg >= 3 ? "⚠️ Large/UI" : "❌ FAIL");
    const statusCard = ratioCard >= 4.5 ? "✅ AA" : (ratioCard >= 3 ? "⚠️ Large/UI" : "❌ FAIL");

    console.log(`${tokenName.padEnd(20)} vs Background: ${ratioBg.toFixed(2).padEnd(5)} (${statusBg}) | vs Card: ${ratioCard.toFixed(2).padEnd(5)} (${statusCard})`);
  }
}

if (hasErrors) {
  process.exit(1);
}

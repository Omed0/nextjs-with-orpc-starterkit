/**
 * ASCII Art Generator Utility
 * Converts text to stylized ASCII art using block characters
 */

// ASCII art font mapping using block characters
const ASCII_FONT: Record<string, string[]> = {
  A: [" █████╗ ", "██╔══██╗", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  B: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██████╔╝", "╚═════╝ "],
  C: [" ██████╗", "██╔════╝", "██║     ", "██║     ", "╚██████╗", " ╚═════╝"],
  D: ["██████╗ ", "██╔══██╗", "██║  ██║", "██║  ██║", "██████╔╝", "╚═════╝ "],
  E: ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "███████╗", "╚══════╝"],
  F: ["███████╗", "██╔════╝", "█████╗  ", "██╔══╝  ", "██║     ", "╚═╝     "],
  G: [
    " ██████╗ ",
    "██╔════╝ ",
    "██║  ███╗",
    "██║   ██║",
    "╚██████╔╝",
    " ╚═════╝ ",
  ],
  H: ["██╗  ██╗", "██║  ██║", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  I: ["██╗", "██║", "██║", "██║", "██║", "╚═╝"],
  J: ["     ██╗", "     ██║", "     ██║", "██   ██║", "╚█████╔╝", " ╚════╝ "],
  K: ["██╗  ██╗", "██║ ██╔╝", "█████╔╝ ", "██╔═██╗ ", "██║  ██╗", "╚═╝  ╚═╝"],
  L: ["██╗     ", "██║     ", "██║     ", "██║     ", "███████╗", "╚══════╝"],
  M: [
    "███╗   ███╗",
    "████╗ ████║",
    "██╔████╔██║",
    "██║╚██╔╝██║",
    "██║ ╚═╝ ██║",
    "╚═╝     ╚═╝",
  ],
  N: [
    "███╗   ██╗",
    "████╗  ██║",
    "██╔██╗ ██║",
    "██║╚██╗██║",
    "██║ ╚████║",
    "╚═╝  ╚═══╝",
  ],
  O: [
    " ██████╗ ",
    "██╔═══██╗",
    "██║   ██║",
    "██║   ██║",
    "╚██████╔╝",
    " ╚═════╝ ",
  ],
  P: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔═══╝ ", "██║     ", "╚═╝     "],
  Q: [
    " ██████╗ ",
    "██╔═══██╗",
    "██║   ██║",
    "██║▄▄ ██║",
    "╚██████╔╝",
    " ╚══▀▀═╝ ",
  ],
  R: ["██████╗ ", "██╔══██╗", "██████╔╝", "██╔══██╗", "██║  ██║", "╚═╝  ╚═╝"],
  S: ["███████╗", "██╔════╝", "███████╗", "╚════██║", "███████║", "╚══════╝"],
  T: [
    "████████╗",
    "╚══██╔══╝",
    "   ██║   ",
    "   ██║   ",
    "   ██║   ",
    "   ╚═╝   ",
  ],
  U: [
    "██╗   ██╗",
    "██║   ██║",
    "██║   ██║",
    "██║   ██║",
    "╚██████╔╝",
    " ╚═════╝ ",
  ],
  V: [
    "██╗   ██╗",
    "██║   ██║",
    "██║   ██║",
    "╚██╗ ██╔╝",
    " ╚████╔╝ ",
    "  ╚═══╝  ",
  ],
  W: [
    "██╗    ██╗",
    "██║    ██║",
    "██║ █╗ ██║",
    "██║███╗██║",
    "╚███╔███╔╝",
    " ╚══╝╚══╝ ",
  ],
  X: ["██╗  ██╗", "╚██╗██╔╝", " ╚███╔╝ ", " ██╔██╗ ", "██╔╝ ██╗", "╚═╝  ╚═╝"],
  Y: [
    "██╗   ██╗",
    "╚██╗ ██╔╝",
    " ╚████╔╝ ",
    "  ╚██╔╝  ",
    "   ██║   ",
    "   ╚═╝   ",
  ],
  Z: ["███████╗", "╚══███╔╝", "  ███╔╝ ", " ███╔╝  ", "███████╗", "╚══════╝"],
  "0": [
    " ██████╗ ",
    "██╔═████╗",
    "██║██╔██║",
    "████╔╝██║",
    "╚██████╔╝",
    " ╚═════╝ ",
  ],
  "1": [" ██╗", "███║", "╚██║", " ██║", " ██║", " ╚═╝"],
  "2": ["██████╗ ", "╚════██╗", " █████╔╝", "██╔═══╝ ", "███████╗", "╚══════╝"],
  "3": ["██████╗ ", "╚════██╗", " █████╔╝", " ╚═══██╗", "██████╔╝", "╚═════╝ "],
  "4": ["██╗  ██╗", "██║  ██║", "███████║", "╚════██║", "     ██║", "     ╚═╝"],
  "5": ["███████╗", "██╔════╝", "███████╗", "╚════██║", "███████║", "╚══════╝"],
  "6": [
    " ██████╗ ",
    "██╔════╝ ",
    "███████╗ ",
    "██╔═══██╗",
    "╚██████╔╝",
    " ╚═════╝ ",
  ],
  "7": ["███████╗", "╚════██║", "    ██╔╝", "   ██╔╝ ", "   ██║  ", "   ╚═╝  "],
  "8": [
    " ██████╗ ",
    "██╔═══██╗",
    "╚█████╔╝ ",
    "██╔═══██╗",
    "╚██████╔╝",
    " ╚═════╝ ",
  ],
  "9": [
    " ██████╗ ",
    "██╔═══██╗",
    "╚██████╔╝",
    " ╚═══██║ ",
    " █████╔╝ ",
    " ╚════╝  ",
  ],
  " ": ["   ", "   ", "   ", "   ", "   ", "   "],
  ".": ["   ", "   ", "   ", "   ", "██╗", "╚═╝"],
  "!": ["██╗", "██║", "██║", "╚═╝", "██╗", "╚═╝"],
  "?": ["██████╗ ", "╚════██╗", "  ▄███╔╝", "  ▀▀══╝ ", "  ██╗   ", "  ╚═╝   "],
  "-": ["        ", "        ", "███████╗", "╚══════╝", "        ", "        "],
};

/**
 * Converts a string to ASCII art
 * @param text - The text to convert (supports A-Z, 0-9, space, and basic punctuation)
 * @param options - Configuration options
 * @returns The ASCII art as a string
 */
export function textToAsciiArt(
  text: string,
  options: {
    spacing?: number; // Space between characters (default: 1)
    uppercase?: boolean; // Convert to uppercase (default: true)
  } = {}
): string {
  const { spacing = 1, uppercase = true } = options;

  // Normalize the text
  const normalizedText = uppercase ? text.toUpperCase() : text;

  // Split into lines
  const lines: string[] = ["", "", "", "", "", ""];

  // Process each character
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    const charArt = ASCII_FONT[char];

    if (!charArt) {
      // If character not found, use space
      const spaceArt = ASCII_FONT[" "];
      for (let lineIdx = 0; lineIdx < 6; lineIdx++) {
        lines[lineIdx] += spaceArt[lineIdx];
        if (i < normalizedText.length - 1) {
          lines[lineIdx] += " ".repeat(spacing);
        }
      }
      continue;
    }

    // Add character to each line
    for (let lineIdx = 0; lineIdx < 6; lineIdx++) {
      lines[lineIdx] += charArt[lineIdx];
      // Add spacing between characters (except for last character)
      if (i < normalizedText.length - 1) {
        lines[lineIdx] += " ".repeat(spacing);
      }
    }
  }

  return lines.join("\n");
}

/**
 * Converts multi-line text to ASCII art
 * @param text - The text to convert (can include newlines)
 * @param options - Configuration options
 * @returns The ASCII art as a string
 */
export function multiLineTextToAsciiArt(
  text: string,
  options: {
    spacing?: number;
    uppercase?: boolean;
    lineSpacing?: number; // Empty lines between text lines (default: 1)
  } = {}
): string {
  const { lineSpacing = 1, ...artOptions } = options;

  const lines = text.split("\n");
  const asciiLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      asciiLines.push(textToAsciiArt(line, artOptions));
      // Add spacing between lines (except for last line)
      if (i < lines.length - 1 && lineSpacing > 0) {
        asciiLines.push("".repeat(lineSpacing));
      }
    }
  }

  return asciiLines.join("\n");
}

/**
 * Console log ASCII art with optional styling
 * @param text - The text to convert and log
 * @param options - Configuration options
 */
export function consoleAsciiArt(
  text: string,
  options: {
    spacing?: number;
    uppercase?: boolean;
    style?: "info" | "success" | "warning" | "error";
  } = {}
): void {
  const { style, ...artOptions } = options;

  const asciiArt = textToAsciiArt(text, artOptions);

  // Apply console styling based on style option
  switch (style) {
    case "success":
      console.log("\x1b[32m%s\x1b[0m", asciiArt); // Green
      break;
    case "warning":
      console.log("\x1b[33m%s\x1b[0m", asciiArt); // Yellow
      break;
    case "error":
      console.log("\x1b[31m%s\x1b[0m", asciiArt); // Red
      break;
    case "info":
    default:
      console.log("\x1b[36m%s\x1b[0m", asciiArt); // Cyan
      break;
  }
}

/**
 * Get ASCII art as HTML with proper formatting
 * @param text - The text to convert
 * @param options - Configuration options
 * @returns HTML string with pre-formatted ASCII art
 */
export function asciiArtToHtml(
  text: string,
  options: {
    spacing?: number;
    uppercase?: boolean;
    className?: string;
  } = {}
): string {
  const { className = "", ...artOptions } = options;

  const asciiArt = textToAsciiArt(text, artOptions);

  return `<pre class="font-mono text-xs sm:text-sm leading-tight ${className}">${asciiArt}</pre>`;
}

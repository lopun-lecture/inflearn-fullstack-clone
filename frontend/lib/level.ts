export function getLevelText(level: string): string {
  switch (level.toUpperCase()) {
    case "BEGINNER":
      return "입문";
    case "INTERMEDIATE":
      return "초급";
    case "ADVANCED":
      return "중급";
    default:
      return level;
  }
}

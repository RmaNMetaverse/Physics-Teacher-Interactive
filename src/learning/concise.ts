function firstSentence(paragraph: string) {
  return paragraph.match(/^.*?[.!?](?=\s|$)/)?.[0].trim() ?? paragraph.trim();
}

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Builds one compact mission card from authored prose while keeping the complete
 * paragraphs available on the mission for its Deep Dive.
 */
export function biteSizedExplanation(paragraphs: string[], fallback: string, maxWords = 32) {
  const bites: string[] = [];
  let words = 0;

  for (const paragraph of paragraphs) {
    const sentence = firstSentence(paragraph);
    const nextWords = wordCount(sentence);
    if (!sentence || words + nextWords > maxWords) break;
    bites.push(sentence);
    words += nextWords;
  }

  return bites.length > 0 ? bites : [fallback];
}

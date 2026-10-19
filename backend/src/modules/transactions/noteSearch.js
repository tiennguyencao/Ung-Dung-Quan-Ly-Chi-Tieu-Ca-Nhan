// User-entered note searches should behave like a normal substring search:
// a multi-word phrase only matches when that phrase appears in the note.
// Escape regex metacharacters so user input is treated as literal text.
export function buildNoteSearchCondition(value) {
  const term = typeof value === 'string' ? value.trim() : '';
  if (!term) return null;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return { $regex: escaped, $options: 'i' };
}

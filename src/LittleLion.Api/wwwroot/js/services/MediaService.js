/**
 * Resolves visual asset URLs for vocabulary items.
 *
 * Strategy:
 *   1. If the item has a fluentName, build a jsdelivr CDN URL pointing to
 *      Microsoft's Fluent Emoji 3D asset.
 *   2. If the image fails to load in the UI, the caller is responsible for
 *      falling back to the Unicode emoji.
 *
 * The fluentui-emoji repo uses "Title Case" folder names:
 *   Dog face / 3D / dog_face_3d.png
 *
 * We build both the folder name and the filename deterministically from
 * fluentName so we don't need to hard-code a lookup table for every word.
 *
 *   "Dog face"   -> assets/Dog face/3D/dog_face_3d.png
 *   "Red apple"  -> assets/Red apple/3D/red_apple_3d.png
 */
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets';

export class MediaService {
  /**
   * Returns a URL for the Fluent 3D asset, or null if no fluentName is set.
   */
  getImageUrl(item) {
    if (!item?.fluentName) return null;
    const folder = encodeURIComponent(item.fluentName);
    const filename = this._toFilename(item.fluentName) + '_3d.png';
    return `${CDN_BASE}/${folder}/3D/${filename}`;
  }

  _toFilename(fluentName) {
    // "Red apple" -> "red_apple"   ;  "T-shirt" -> "t-shirt"
    return fluentName.trim().toLowerCase().replace(/\s+/g, '_');
  }
}

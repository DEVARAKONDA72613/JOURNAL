# Image Setup Instructions

## How to Add Your Images

### Step 1: Upload Your Images

1. Place your image files in the `public/assets/covers/` folder
2. Supported formats: `.jpg`, `.jpeg`, `.png`, `.svg`, `.webp`
3. You can name them anything you want (e.g., `january-bg.jpg`, `winter-scene.png`, etc.)

### Step 2: Specify Month Mappings

Open `src/config/monthBackgrounds.js` and update the file paths:

```javascript
const monthBackgrounds = {
  0: '/assets/covers/your-january-image.jpg',   // January 2026
  1: '/assets/covers/your-february-image.jpg',  // February 2026
  2: '/assets/covers/your-march-image.jpg',     // March 2026
  // ... and so on
}
```

### Step 3: Set Welcome Page Background

Update the `welcomeBackground` export in the same file:

```javascript
export const welcomeBackground = '/assets/covers/your-welcome-image.jpg'
```

## Month Index Reference

- `0` = January
- `1` = February
- `2` = March
- `3` = April
- `4` = May
- `5` = June
- `6` = July
- `7` = August
- `8` = September
- `9` = October
- `10` = November
- `11` = December

## Example

If you upload:
- `winter-snow.jpg` → use for January
- `spring-flowers.jpg` → use for March
- `summer-beach.jpg` → use for July

Your config would look like:

```javascript
const monthBackgrounds = {
  0: '/assets/covers/winter-snow.jpg',      // January
  1: '/assets/covers/2026-02.svg',          // February (keep existing)
  2: '/assets/covers/spring-flowers.jpg',    // March
  // ... etc
  6: '/assets/covers/summer-beach.jpg',      // July
  // ... etc
}
```

## Tips

- **Image Size**: For best performance, use images around 1920x1080px or similar
- **File Size**: Try to keep images under 2MB for faster loading
- **Format**: `.jpg` or `.webp` are best for photos, `.svg` for graphics
- **Naming**: Use descriptive names to make it easier to remember which is which

## After Updating

1. Save the `monthBackgrounds.js` file
2. The dev server should automatically reload
3. Navigate through different months to see your backgrounds!


#!/usr/bin/env python3
"""
PNG to WebP Converter
Converts all PNG images in character directories to WebP format
"""

import os
from PIL import Image
from pathlib import Path

# Base directory for character assets
BASE_DIR = Path(r"c:\Users\XPENG_USER\APP\Trae_Project\new\lover\frontend\assets\characters")

# Character directories to process
CHARACTER_DIRS = [
    "female_adventurer",
    "female_person",
    "male_adventurer"
]

def convert_png_to_webp(png_path, quality=85):
    """
    Convert a PNG file to WebP format.

    Args:
        png_path: Path to the PNG file
        quality: WebP quality (1-100), default 85 for good balance

    Returns:
        Tuple of (webp_path, original_size, webp_size) or None if conversion failed
    """
    try:
        # Open the PNG image
        with Image.open(png_path) as img:
            # Create WebP path
            webp_path = png_path.with_suffix('.webp')

            # Convert to WebP
            # Use lossless=False for better compression with photos/graphics
            # quality=85 provides good balance between quality and size
            img.save(webp_path, 'webp', quality=quality, method=6)

            # Get file sizes
            original_size = png_path.stat().st_size
            webp_size = webp_path.stat().st_size

            return (webp_path, original_size, webp_size)

    except Exception as e:
        print(f"Error converting {png_path}: {e}")
        return None

def main():
    """Main conversion process"""
    print("=" * 60)
    print("PNG to WebP Converter for Character Assets")
    print("=" * 60)
    print()

    total_files = 0
    total_original_size = 0
    total_webp_size = 0
    results = []

    for char_dir in CHARACTER_DIRS:
        char_path = BASE_DIR / char_dir

        if not char_path.exists():
            print(f"Warning: Directory not found: {char_path}")
            continue

        print(f"\nProcessing: {char_dir}/")
        print("-" * 60)

        # Find all PNG files in the directory
        png_files = sorted(char_path.glob("*.png"))

        for png_file in png_files:
            result = convert_png_to_webp(png_file)

            if result:
                webp_path, original_size, webp_size = result
                savings = original_size - webp_size
                savings_percent = (savings / original_size) * 100

                total_files += 1
                total_original_size += original_size
                total_webp_size += webp_size

                results.append({
                    'file': png_file.name,
                    'dir': char_dir,
                    'original': original_size,
                    'webp': webp_size,
                    'savings': savings_percent
                })

                print(f"  {png_file.name}")
                print(f"    Original: {original_size:,} bytes")
                print(f"    WebP:     {webp_size:,} bytes")
                print(f"    Saved:    {savings:,} bytes ({savings_percent:.1f}%)")

    # Print summary
    print("\n" + "=" * 60)
    print("CONVERSION SUMMARY")
    print("=" * 60)
    print(f"Total files converted: {total_files}")
    print(f"Total original size:   {total_original_size:,} bytes ({total_original_size/1024:.1f} KB)")
    print(f"Total WebP size:       {total_webp_size:,} bytes ({total_webp_size/1024:.1f} KB)")
    print(f"Total space saved:     {total_original_size - total_webp_size:,} bytes ({(total_original_size - total_webp_size)/1024:.1f} KB)")
    print(f"Average compression:   {((total_original_size - total_webp_size) / total_original_size * 100):.1f}%")
    print()

    # List files with best compression
    if results:
        print("\nTop 5 files with best compression:")
        sorted_results = sorted(results, key=lambda x: x['savings'], reverse=True)[:5]
        for i, r in enumerate(sorted_results, 1):
            print(f"  {i}. {r['dir']}/{r['file']}: {r['savings']:.1f}% saved")

    print("\nConversion complete! Original PNG files are kept as fallback.")

if __name__ == "__main__":
    main()

# Media inventory (landing v3, media-curator, 2026-08-21)

Sources: `_harvest/drive/` (Google Drive mirror via `scripts/drive-sync.sh`), `_harvest/repos/` (f1tenth org clones via `scripts/harvest-org-repos.sh`, authenticated `gh`), `_harvest/platform/` (Cedric's MPPI video). Review derivatives (downscaled JPGs, contact sheets, frame strips, montages) live in `_harvest/review/` (git-ignored).

Tools used: `ffprobe`/`ffmpeg`, ImageMagick 6 `convert`/`montage`/`identify`, PIL. `cwebp`, `magick`, `heif-convert` are absent; WebP written with `convert ... -define webp:method=6` and `ffmpeg -c:v libwebp`.

## 1. Drive mirror, per folder

| folder | files | size | types | notes |
|---|---|---|---|---|
| `2026-icra/Logos` | 19 | 5.8 MB | PNG 19 | sponsor/partner logos for ICRA 2026. |
| `2026-icra/Media` | 3 | 1.1 MB | MP4 2, PNG 1 | ICRA 2026 intro.mp4 (4.5 s title animation) + Important.PNG. |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup` | 112 | 958.8 MB | HEIC 28, MOV 84 | iPhone MOV 1920x1080 (30p, some 120p slow-mo "IMG_E*" renders, 8 portrait) + HEIC. Credit "Photo: Chinmay and Tanmay Samak". |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup` | 69 | 604.1 MB | HEIC 16, JPG 2, MOV 51 | iPhone MOV + HEIC, same as above. |
| `2026-icra/Media/Chinmay-Tanmay/Organizers` | 7 | 21.6 MB | HEIC 7 | HEIC organizer portraits (portrait-mode HEIC with depth map: ImageMagick cannot decode, skipped). |
| `2026-icra/Media/Chinmay-Tanmay/Practice` | 1 | 1.7 MB | MOV 1 | one 1.5 s MOV. |
| `2026-icra/Media/Felix Jahncke` | 249 | 3821.2 MB | JPG 217, MP4 32 | DSLR (Panasonic). Best still source. 217 JPG 6000x4000 + RW2 raws + 32 MP4 (14 x 3840x2160 25p, 18 x 1920x1080 50p; 14 of them portrait). Credit "Photo: Felix Jahncke". |
| `2026-icra/Media/Teams Intro` | 18 | 2721.8 MB | MOV 18 | 18 edited team intro interviews (selfie-style wide angle, one person talking, lower-third team name, ICRA 2026 title card). No car-on-track b-roll in any of them. Usable only for team squares. |
| `2026-iv/Big Award Checks` | 1 | 0.5 MB | PNG 1 |  |
| `2026-iv/Example SIM Racing Event` | 1 | 11.3 MB | MP4 1 |  |
| `2026-iv/Orientation Example` | 2 | 73.8 MB | MP4 2 |  |
| `2026-iv/Orientation/Orientation 1/Recording` | 1 | 54.4 MB | MP4 1 |  |
| `2026-iv/Orientation/Orientation 2/Recording` | 1 | 62.6 MB | MP4 1 |  |
| `2026-iv/T Shirt Design/2025 Shirts/Big Frog` | 8 | 17.8 MB | JPG 1, PNG 7 |  |
| `2026-iv/Tentative Map` | 1 | 0.0 MB | PNG 1 |  |
| `logo` | 3 | 0.1 MB | DOCX 1, PNG 2 | brand assets. |
| `logo/For Big Check` | 1 | 0.1 MB | PNG 1 |  |
| `logo/eps` | 1 | 0.7 MB | EPS 1 |  |
| `logo/illustrator` | 1 | 0.1 MB | AI 1 |  |
| `logo/misc` | 6 | 5.3 MB | GIF 1, JPG 2, PNG 1, ZIP 2 |  |
| `logo/outdated logos` | 3 | 0.3 MB | PNG 3 |  |
| `logo/png` | 21 | 7.8 MB | PNG 21 |  |
| `logo/small-png` | 20 | 0.8 MB | PNG 20 |  |
| `logo/svg` | 19 | 0.5 MB | SVG 19 |  |
| `old-banners` | 3 | 50.3 MB | PDF 2, PNG 1 |  |
| `old-banners/Media to Use` | 16 | 14.0 MB | DOCX 1, HEIC 3, JPG 9, PNG 3 | older event photos (IMG_1731 group, IMG_7776 group, IMG_20190421 car on asphalt 2019, Picture1-8 low-res). Event/date unknown: not used. |
| `posters-2026` | 28 | 114.1 MB | PNG 28 | print posters (design drafts), not photos. |

## 2. Videos (ffprobe)

| path | WxH | fps | rot | duration s | size MB |
|---|---|---|---|---|---|
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0822.MOV` | 1920x1080 | 30/1 |  | 5.465000 | 6.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0823.MOV` | 1920x1080 | 30000/1001 |  | 8.068333 | 9.2 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0824.MOV` | 1920x1080 | 30000/1001 |  | 2.566700 | 2.9 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0825.MOV` | 1920x1080 | 30/1 |  | 3.266667 | 3.7 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0826.MOV` | 1920x1080 | 120/1 |  | 2.325000 | 7.4 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0827.MOV` | 1920x1080 | 120/1 |  | 4.560000 | 14.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0828.MOV` | 1920x1080 | 120/1 |  | 2.066700 | 6.7 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0829.MOV` | 1920x1080 | 30000/1001 |  | 3.601700 | 4.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0831.MOV` | 1920x1080 | 30000/1001 |  | 3.635000 | 4.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0832.MOV` | 1920x1080 | 30/1 |  | 4.865000 | 5.7 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0833.MOV` | 1920x1080 | 30/1 |  | 1.400000 | 1.6 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0834.MOV` | 1920x1080 | 30/1 |  | 1.798333 | 2.1 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0835.MOV` | 1920x1080 | 30/1 |  | 1.898333 | 2.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0836.MOV` | 1920x1080 | 30/1 |  | 2.031700 | 2.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0837.MOV` | 1920x1080 | 30/1 |  | 3.566667 | 4.1 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0838.MOV` | 1920x1080 | 30/1 |  | 4.400000 | 5.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0839.MOV` | 1920x1080 | 30/1 |  | 2.631700 | 3.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0840.MOV` | 1920x1080 | 30/1 | -90 | 17.600000 | 19.6 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0841.MOV` | 1920x1080 | 30/1 | -90 | 9.731700 | 11.2 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0842.MOV` | 1920x1080 | 30/1 | -90 | 3.500000 | 4.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0843.MOV` | 1920x1080 | 30/1 | -90 | 5.000000 | 5.8 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0844.MOV` | 1920x1080 | 30/1 | -90 | 2.765000 | 3.4 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0845.MOV` | 1920x1080 | 30/1 | -90 | 14.531700 | 16.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0846.MOV` | 1920x1080 | 30/1 | -90 | 28.466700 | 31.8 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0847.MOV` | 1920x1080 | 30/1 |  | 1.966667 | 2.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0848.MOV` | 1920x1080 | 30/1 |  | 27.233333 | 30.7 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0849.MOV` | 1920x1080 | 30/1 |  | 1.098333 | 1.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0850.MOV` | 1920x1080 | 30/1 |  | 2.600000 | 3.1 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0851.MOV` | 1920x1080 | 30/1 |  | 9.233333 | 10.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0852.MOV` | 1920x1080 | 30/1 |  | 1.000000 | 1.4 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0853.MOV` | 1920x1080 | 30/1 | -90 | 1.600000 | 1.8 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0854.MOV` | 1920x1080 | 30/1 | -90 | 2.500000 | 2.8 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0855.MOV` | 1920x1080 | 30/1 |  | 0.998333 | 1.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0858.MOV` | 1920x1080 | 30/1 |  | 16.966667 | 19.1 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0859.MOV` | 1920x1080 | 30/1 |  | 4.333333 | 5.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0860.MOV` | 1920x1080 | 30/1 |  | 12.298333 | 14.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0861.MOV` | 1920x1080 | 30/1 |  | 4.331700 | 5.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0862.MOV` | 1920x1080 | 30/1 |  | 9.466700 | 10.8 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0863.MOV` | 1920x1080 | 30/1 |  | 5.833333 | 6.9 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0864.MOV` | 1920x1080 | 30/1 |  | 6.100000 | 7.1 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0865.MOV` | 1920x1080 | 30/1 |  | 3.765000 | 4.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0866.MOV` | 1920x1080 | 30/1 |  | 3.531700 | 3.9 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0867.MOV` | 1920x1440 | 60/1 |  | 2.080000 | 5.1 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0868.MOV` | 1920x1440 | 120/1 |  | 1.746667 | 4.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0888.MOV` | 1920x1080 | 30/1 |  | 17.066667 | 19.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0889.MOV` | 1920x1080 | 30/1 |  | 3.665000 | 4.2 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0890.MOV` | 1920x1080 | 30/1 |  | 9.833333 | 11.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0891.MOV` | 1920x1080 | 30/1 |  | 8.066667 | 9.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0892.MOV` | 1920x1440 | 60/1 |  | 2.580000 | 6.4 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0893.MOV` | 1920x1440 | 60/1 |  | 2.546667 | 5.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0895.MOV` | 1920x1080 | 30/1 |  | 5.066667 | 5.8 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0896.MOV` | 1920x1080 | 30000/1001 |  | 4.001667 | 4.7 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0897.MOV` | 1920x1080 | 30/1 |  | 2.700000 | 3.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0898.MOV` | 1920x1080 | 30/1 |  | 4.631700 | 5.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0899.MOV` | 1920x1080 | 30/1 |  | 7.265000 | 8.6 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0900.MOV` | 1920x1080 | 30/1 |  | 6.266700 | 7.2 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0901.MOV` | 1920x1080 | 30/1 |  | 3.500000 | 4.1 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0902.MOV` | 1920x1080 | 30/1 |  | 9.733333 | 11.2 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0903.MOV` | 1920x1080 | 30/1 |  | 7.865000 | 8.9 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0904.MOV` | 1920x1080 | 30/1 |  | 15.833333 | 17.9 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0905.MOV` | 1920x1080 | 30/1 |  | 15.300000 | 17.4 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0906.MOV` | 1920x1080 | 30/1 |  | 13.765000 | 15.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0907.MOV` | 1920x1080 | 30/1 |  | 9.166667 | 10.2 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0908.MOV` | 1920x1080 | 30/1 |  | 14.900000 | 16.7 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0909.MOV` | 1920x1080 | 30/1 |  | 3.798333 | 4.6 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0910.MOV` | 1920x1080 | 30/1 |  | 4.566667 | 5.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0911.MOV` | 1920x1080 | 30/1 |  | 25.633333 | 28.4 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0912.MOV` | 1920x1080 | 30/1 |  | 8.465000 | 9.6 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0913.MOV` | 1920x1080 | 30/1 |  | 3.531700 | 3.9 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0914.MOV` | 1920x1080 | 30000/1001 |  | 2.568333 | 5.6 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0915.MOV` | 1920x1080 | 30000/1001 |  | 30.353333 | 58.7 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0916.MOV` | 1920x1080 | 30/1 |  | 5.433333 | 6.2 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_0917.MOV` | 1920x1080 | 30000/1001 |  | 79.751700 | 148.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_5593.MOV` | 1920x1080 | 30000/1001 |  | 3.833333 | 4.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_5602.MOV` | 1920x1080 | 30/1 |  | 1.731700 | 2.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_5613.MOV` | 1920x1080 | 30/1 |  | 2.266667 | 2.7 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_5614.MOV` | 1920x1080 | 30/1 |  | 1.800000 | 2.0 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_E0826.MOV` | 1920x1080 | 30/1 |  | 5.900000 | 10.3 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_E0827.MOV` | 1920x1080 | 30/1 |  | 12.833333 | 22.1 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_E0828.MOV` | 1920x1080 | 30/1 |  | 5.100000 | 8.9 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_E0829.MOV` | 1920x1080 | 30000/1001 |  | 3.601700 | 5.5 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_E0831.MOV` | 1920x1080 | 30000/1001 |  | 3.635000 | 5.6 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_E0892.MOV` | 1920x1440 | 60/1 |  | 2.581667 | 4.8 |
| `2026-icra/Media/Chinmay-Tanmay/Classic Cup/IMG_E0893.MOV` | 1920x1440 | 60/1 |  | 2.548333 | 4.9 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1048.MOV` | 1920x1080 | 30/1 |  | 4.533333 | 5.0 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1049.MOV` | 1920x1080 | 30/1 |  | 49.810000 | 68.0 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1050.MOV` | 1920x1080 | 30/1 |  | 5.433333 | 6.0 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1051.MOV` | 1920x1080 | 30/1 |  | 2.833333 | 3.4 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1052.MOV` | 1920x1080 | 30/1 |  | 30.033333 | 33.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1053.MOV` | 1920x1080 | 30/1 |  | 3.531700 | 4.1 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1054.MOV` | 1920x1080 | 30/1 |  | 5.465000 | 6.2 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1055.MOV` | 1920x1080 | 30/1 |  | 4.833333 | 5.4 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1056.MOV` | 1920x1080 | 30/1 |  | 1.766667 | 1.9 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1057.MOV` | 1920x1080 | 30/1 |  | 1.465000 | 1.8 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1062.MOV` | 1920x1080 | 30/1 |  | 3.865000 | 4.5 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1065.MOV` | 1920x1080 | 30/1 |  | 15.866700 | 17.7 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1066.MOV` | 1920x1080 | 30/1 |  | 9.800000 | 11.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1067.MOV` | 1920x1080 | 30/1 |  | 23.536700 | 32.7 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1068.MOV` | 1920x1080 | 30000/1001 |  | 5.868333 | 9.4 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1070.MOV` | 1920x1080 | 30/1 |  | 2.065000 | 2.7 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1080.MOV` | 1920x1080 | 30/1 |  | 6.800000 | 8.0 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1081.MOV` | 1920x1080 | 120/1 |  | 1.641700 | 5.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1082.MOV` | 1920x1080 | 120/1 |  | 2.525000 | 8.2 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1086.MOV` | 1920x1080 | 30/1 |  | 24.533333 | 27.8 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1087.MOV` | 1920x1080 | 30/1 |  | 2.433333 | 2.8 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1088.MOV` | 1920x1080 | 120/1 |  | 2.641700 | 8.5 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1090.MOV` | 1920x1080 | 120/1 |  | 1.750000 | 5.5 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1091.MOV` | 1920x1080 | 120/1 |  | 1.625000 | 5.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1093.MOV` | 1920x1080 | 30000/1001 |  | 5.468333 | 6.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1094.MOV` | 1920x1080 | 30000/1001 |  | 5.868333 | 6.9 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1095.MOV` | 1920x1080 | 30/1 |  | 1.833333 | 2.1 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1096.MOV` | 1920x1080 | 30/1 |  | 1.200000 | 1.5 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1097.MOV` | 1920x1080 | 30/1 |  | 4.598333 | 5.2 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1098.MOV` | 1920x1080 | 30/1 |  | 5.531700 | 6.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1099.MOV` | 1920x1080 | 30/1 |  | 8.733333 | 10.1 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1100.MOV` | 1920x1080 | 120/1 |  | 1.741700 | 5.6 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1101.MOV` | 1920x1080 | 30000/1001 |  | 3.368333 | 4.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1102.MOV` | 1920x1080 | 30000/1001 |  | 4.501700 | 5.6 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1103.MOV` | 1920x1080 | 30/1 |  | 1.865000 | 2.1 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1105.MOV` | 1920x1080 | 30/1 |  | 46.135000 | 50.7 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1106.MOV` | 1920x1080 | 30/1 |  | 4.466667 | 5.0 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_1107.MOV` | 1920x1080 | 30/1 |  | 25.233333 | 28.7 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_5662.MOV` | 1920x1080 | 30/1 |  | 6.031700 | 6.9 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_5663.MOV` | 1920x1080 | 30/1 |  | 5.933333 | 7.0 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_5664.MOV` | 1920x1080 | 30/1 |  | 7.000000 | 7.7 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_5665.MOV` | 1920x1080 | 30/1 |  | 6.833333 | 7.6 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_5668.MOV` | 1920x1080 | 30000/1001 | -90 | 20.141700 | 22.7 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_E1081.MOV` | 1920x1080 | 30/1 |  | 3.800000 | 6.9 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_E1082.MOV` | 1920x1080 | 30/1 |  | 6.533333 | 11.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_E1088.MOV` | 1920x1080 | 30/1 |  | 6.900000 | 12.2 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_E1090.MOV` | 1920x1080 | 30/1 |  | 4.133333 | 7.1 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_E1091.MOV` | 1920x1080 | 30/1 |  | 3.733333 | 6.4 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_E1100.MOV` | 1920x1080 | 30/1 |  | 4.100000 | 7.3 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_E1101.MOV` | 1920x1080 | 30000/1001 |  | 3.368333 | 5.7 |
| `2026-icra/Media/Chinmay-Tanmay/Master Cup/IMG_E1102.MOV` | 1920x1080 | 30000/1001 |  | 4.503333 | 7.4 |
| `2026-icra/Media/Chinmay-Tanmay/Practice/IMG_5542.MOV` | 1920x1080 | 30/1 |  | 1.533333 | 1.7 |
| `2026-icra/Media/Felix Jahncke/P1022614.MP4` | 3840x2160 | 25/1 |  | 9.120000 | 67.9 |
| `2026-icra/Media/Felix Jahncke/P1022646.MP4` | 3840x2160 | 25/1 |  | 16.800000 | 123.2 |
| `2026-icra/Media/Felix Jahncke/P1022671.MP4` | 3840x2160 | 25/1 |  | 16.800000 | 123.1 |
| `2026-icra/Media/Felix Jahncke/P1022672.MP4` | 3840x2160 | 25/1 |  | 17.760000 | 130.3 |
| `2026-icra/Media/Felix Jahncke/P1022750.MP4` | 3840x2160 | 25/1 |  | 6.240000 | 47.2 |
| `2026-icra/Media/Felix Jahncke/P1022751.MP4` | 3840x2160 | 25/1 |  | 11.040000 | 82.6 |
| `2026-icra/Media/Felix Jahncke/P1022753.MP4` | 3840x2160 | 25/1 |  | 3.360000 | 25.8 |
| `2026-icra/Media/Felix Jahncke/P1022758.MP4` | 3840x2160 | 25/1 | 90 | 22.080000 | 161.3 |
| `2026-icra/Media/Felix Jahncke/P1022815.MP4` | 3840x2160 | 25/1 | 90 | 4.800000 | 36.9 |
| `2026-icra/Media/Felix Jahncke/P1022817.MP4` | 3840x2160 | 25/1 | 90 | 2.880000 | 23.4 |
| `2026-icra/Media/Felix Jahncke/P1022819.MP4` | 3840x2160 | 25/1 | 90 | 3.360000 | 27.3 |
| `2026-icra/Media/Felix Jahncke/P1022871.MP4` | 3840x2160 | 25/1 | 90 | 7.680000 | 58.5 |
| `2026-icra/Media/Felix Jahncke/P1022882.MP4` | 3840x2160 | 25/1 | 90 | 2.880000 | 23.7 |
| `2026-icra/Media/Felix Jahncke/P1022903.MP4` | 3840x2160 | 25/1 | 90 | 4.320000 | 33.5 |
| `2026-icra/Media/Felix Jahncke/P1022931.MP4` | 1920x1080 | 50/1 | 90 | 7.200000 | 25.8 |
| `2026-icra/Media/Felix Jahncke/P1022941.MP4` | 1920x1080 | 50/1 | 90 | 7.200000 | 26.1 |
| `2026-icra/Media/Felix Jahncke/P1022942.MP4` | 1920x1080 | 50/1 |  | 3.360000 | 13.3 |
| `2026-icra/Media/Felix Jahncke/P1022944.MP4` | 1920x1080 | 50/1 |  | 21.600000 | 73.0 |
| `2026-icra/Media/Felix Jahncke/P1022945.MP4` | 1920x1080 | 50/1 |  | 3.360000 | 13.0 |
| `2026-icra/Media/Felix Jahncke/P1022960.MP4` | 1920x1080 | 50/1 |  | 5.760000 | 21.1 |
| `2026-icra/Media/Felix Jahncke/P1022977.MP4` | 1920x1080 | 50/1 |  | 9.600000 | 34.1 |
| `2026-icra/Media/Felix Jahncke/P1022987.MP4` | 1920x1080 | 50/1 | 90 | 12.000000 | 41.7 |
| `2026-icra/Media/Felix Jahncke/P1023010.MP4` | 1920x1080 | 50/1 |  | 9.120000 | 31.8 |
| `2026-icra/Media/Felix Jahncke/P1023022.MP4` | 1920x1080 | 50/1 | 90 | 26.400000 | 88.5 |
| `2026-icra/Media/Felix Jahncke/P1023025.MP4` | 1920x1080 | 50/1 | 90 | 2.880000 | 11.7 |
| `2026-icra/Media/Felix Jahncke/P1023026.MP4` | 1920x1080 | 50/1 |  | 17.280000 | 58.7 |
| `2026-icra/Media/Felix Jahncke/P1023030.MP4` | 1920x1080 | 50/1 | 90 | 4.320000 | 16.3 |
| `2026-icra/Media/Felix Jahncke/P1033098.MP4` | 1920x1080 | 50/1 |  | 4.800000 | 17.9 |
| `2026-icra/Media/Felix Jahncke/P1033121.MP4` | 1920x1080 | 50/1 |  | 7.200000 | 25.8 |
| `2026-icra/Media/Felix Jahncke/P1033205.MP4` | 1920x1080 | 50/1 |  | 5.280000 | 19.6 |
| `2026-icra/Media/Felix Jahncke/P1033229.MP4` | 1920x1080 | 50/1 |  | 4.800000 | 18.0 |
| `2026-icra/Media/Felix Jahncke/P1033260.MP4` | 1920x1080 | 50/1 | 90 | 4.320000 | 16.5 |
| `2026-icra/Media/ICRA 2026 intro no sound.mp4` | 1920x1080 | 30/1 |  | 4.466667 | 0.5 |
| `2026-icra/Media/ICRA 2026 intro.mp4` | 1920x1080 | 30/1 |  | 4.468005 | 0.6 |
| `2026-icra/Media/Teams Intro/arcus_edited.mov` | 1920x1080 | 30000/1001 |  | 69.002271 | 135.7 |
| `2026-icra/Media/Teams Intro/brake_check_buddies_edited.mov` | 1920x1080 | 30000/1001 |  | 83.616875 | 164.3 |
| `2026-icra/Media/Teams Intro/celeritas_edited.mov` | 1920x1080 | 30000/1001 |  | 65.899167 | 129.3 |
| `2026-icra/Media/Teams Intro/deepspeed_edited.mov` | 1920x1080 | 30000/1001 |  | 75.775708 | 148.7 |
| `2026-icra/Media/Teams Intro/hipert_modena_edited.mov` | 1920x1080 | 30000/1001 |  | 88.721967 | 174.3 |
| `2026-icra/Media/Teams Intro/ingenuity_labs_racing_edited.mov` | 1920x1080 | 30000/1001 |  | 52.419042 | 102.8 |
| `2026-icra/Media/Teams Intro/jku_its_edited.mov` | 1920x1080 | 30000/1001 |  | 106.239467 | 208.6 |
| `2026-icra/Media/Teams Intro/min_verstappen_edited.mov` | 1920x1080 | 30000/1001 |  | 62.162104 | 122.0 |
| `2026-icra/Media/Teams Intro/phoenix_racing_edited.mov` | 1920x1080 | 30000/1001 |  | 77.777708 | 152.5 |
| `2026-icra/Media/Teams Intro/quicksilver_edited.mov` | 1920x1080 | 30000/1001 |  | 73.740333 | 144.8 |
| `2026-icra/Media/Teams Intro/quickwitted_edited.mov` | 1920x1080 | 30000/1001 |  | 70.603875 | 138.8 |
| `2026-icra/Media/Teams Intro/rcv_formula_edited.mov` | 1920x1080 | 30000/1001 |  | 64.097375 | 125.6 |
| `2026-icra/Media/Teams Intro/sagol_edited.mov` | 1920x1080 | 30000/1001 |  | 68.701967 | 134.9 |
| `2026-icra/Media/Teams Intro/same_mess_again_edited.mov` | 1920x1080 | 30000/1001 |  | 116.916800 | 229.2 |
| `2026-icra/Media/Teams Intro/scuderia_segfault_edited.mov` | 1920x1080 | 30000/1001 |  | 83.450042 | 164.0 |
| `2026-icra/Media/Teams Intro/tian_racer_edited.mov` | 1920x1080 | 30000/1001 |  | 78.778708 | 154.3 |
| `2026-icra/Media/Teams Intro/unicone_racing_edited.mov` | 1920x1080 | 30000/1001 |  | 79.746333 | 156.7 |
| `2026-icra/Media/Teams Intro/upenn_autonomous_racing_edited.mov` | 1920x1080 | 30000/1001 |  | 69.069000 | 135.6 |
| `2026-iv/Example SIM Racing Event/Copy of VAUL Presentation Virtual F1Tenth CDC Competiton (1).mp4` | 1280x720 | 60/1 |  | 302.393469 | 11.3 |
| `2026-iv/Orientation Example/Copy of Orientation1.mp4` | 2560x1440 | 25/1 |  | 949.738667 | 23.5 |
| `2026-iv/Orientation Example/Copy of Orientation2.mp4` | 3440x1440 | 25/1 |  | 2124.458667 | 50.2 |
| `2026-iv/Orientation/Orientation 1/Recording/video1924944700.mp4` | 1920x1080 | 25/1 |  | 2345.685333 | 54.4 |
| `2026-iv/Orientation/Orientation 2/Recording/video1432125745.mp4` | 3440x1440 | 25/1 |  | 2927.082667 | 62.6 |

## 3. Stills (Drive)

- Felix Jahncke JPG: 217 files, 6000x4000, 8-12 MB each; reviewed as 1200 px JPGs in `_harvest/review/felix/` and 20-up montages in `_harvest/review/montage/felix_*.jpg`.
- Chinmay-Tanmay HEIC: 54 files; 33 decoded (`_harvest/review/ct/`), 21 portrait-mode HEIC (depth image reference) fail in ImageMagick/PIL and were skipped: Organizers/IMG_0819, 0887, 0920, 5572, 5670; Classic Cup/IMG_5582, 5583, 5589-5592; Master Cup/IMG_1075-1079, IMG_E1075-E1079.

## 4. Org repos (authenticated harvest)

203 repos in `f1tenth` (154 private). Race-site repos (all PRIVATE, found by name pattern; a CNAME check over every other repo via the API found no additional `*-race.*` sites):

| repo | CNAME |
|---|---|
| `bu2024_race` | bu2024-race.f1tenth.org |
| `cdc2024_race` | cdc2024-race.f1tenth.org |
| `cdc2025_race` | cdc2025-race.roboracer.ai |
| `cps2023-race_website` | cps2023-race.f1tenth.org |
| `cpsweek2024-race_website` | cpsweek2024-race.f1tenth.org |
| `esweek2022-race` | esweek2022-race.f1tenth.org |
| `icra2022-race_website` | icra2022-race.f1tenth.org |
| `icra2022_website` | icra2022.f1tenth.org |
| `icra2023-race_website` | icra2023-race.f1tenth.org |
| `icra2023_website` | icra2023.f1tenth.org |
| `icra2024-race_website` | icra2024-race.f1tenth.org |
| `icra2024_madgames_website` | icra2024-madgames.f1tenth.org |
| `icra2025_madgames_website` | icra2025-madgames.f1tenth.org |
| `icra2025_race` | icra2025-race.roboracer.ai |
| `icra2026_race` | icra2026-race.roboracer.ai |
| `iros2021_website` | iros2021.f1tenth.org |
| `iros2023-race_website` | iros2023-race.f1tenth.org |
| `iros2023_madgames_website` | iros2023-madgames.f1tenth.org |
| `iros2024_race` | iros2024-race.f1tenth.org |
| `iros2026_race` | iros2026-race.roboracer.ai |
| `itsc2024_race` | itsc2024-race.f1tenth.org |
| `iv2023_race` | iv2023-race.f1tenth.org |
| `iv2024_race` | iv2024-race.f1tenth.org |
| `iv2025_race` | iv2025-race.roboracer.ai |
| `iv2026_race` | iv2026-race.roboracer.ai |
| `korea-race` | korea-race.f1tenth.org |
| `korea_race3-website` | iros2024-race.f1tenth.org |
| `sm2024_race` | sm2024-race.f1tenth.org |
| `vtc2026-race` | vtc2026-race.roboracer.ai |

Image folders: every race-site repo carries the same template set (`images/bg3.jpg` car render or a 2023 laptop photo, `BackGroundProject.png` render, `F1TENTH/*.gif` sim gifs, organizer headshots, sponsor logos). Real photos found: `cps2023-race_website/images/bg3*.jpg` (5184x3456 laptop/RViz scene), `iv2023_race/images/IV2023/bg_car.jpg` (car on asphalt), `bu2024_race/images/participants.jpg` (1789x2054 group photo, event unlabeled), `esweek2022-race/images/main_banner.jpg`, `korea-race/images/bg3.jpg`, `roboracer-site/public/about/image-2.JPG, image-3.JPG` (6000x4000 group photos, event unlabeled). No hall-wide, podium or overtake photography in any race-site repo. No Pittsburgh 2016 material.

Footage repos: `f1tenth_coursekit/assignments/races/img/race01-04.gif` are meme GIFs (dog in a car, toy tractor), NOT race footage; `f1tenth_doc/img/buildCar.gif` (2224x1668, 4.2 s) is a rendered car with a terminal overlay, not a build video; `f1tenth_doc/getting_started/build_car/img/**` holds 90+ phone photos of the build steps (4032x3024, workbench, busy backgrounds); `f1tenth_doc/img/f1tenth_autoware_sim.jpg` is an RViz screenshot of `f1tenth_gym_ros` with a LiDAR scan (used for Learn). `iros2026_race/images/Roboracer/four_car_sim.mp4` (1920x1080, 16.9 s) is a 4-car sim top-down. `f1tenth_media` has only IFAC 2020 schedules.

## 5. Platform
- `_harvest/platform/multiple_opp_realistic.mp4`: 1920x1080, 60 fps, 11.75 s, 9.2 MB, Foxglove screen recording of the MPPI overtaking gym (UI chrome top and bottom, 3D view at x 284-1636, y 192-1037).

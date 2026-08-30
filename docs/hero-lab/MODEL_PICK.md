# Video model pick (gate G2), unattended

Measured with `scripts/hf.sh --cost-only` on 2026-08-30 02:23-02:26, the locked frame (3b's
`result.webp`, 2752x1536) as the start image, 5 s, 16:9, sound off where the schema has a flag.
Estimates only; nothing was created. Cedric asleep: this file is the notice (contract section 4).

| model | flags (all with `--prompt ... --duration 5`) | credits | start image | extra references | output |
|---|---|---|---|---|---|
| `kling2_6` | `--start-image L --sound false` | 5 | yes | no | 720p |
| `veo3_1_lite` | `--start-image L --duration 4` | 4 (4 s) | yes | no | 720p |
| `kling3_0` | `--start-image L --mode std --sound off` | 7.5 | yes | no | 720p |
| `kling3_0_turbo` | `--start-image L --resolution 720p` | 7.5 | yes | no | 720p |
| `kling3_0` | `--start-image L --mode pro --sound off` | 8.75 | yes | no | 1080p |
| `kling3_0_turbo` | `--start-image L --resolution 1080p` | 10 | yes | no | 1080p |
| `minimax_h3` | `--start-image L` | 10 | yes | no (not with a start image) | 2K |
| `veo3_1` | `--start-image L --duration 4 --quality basic --variant veo-3-1-fast` | 11 (4 s) | yes | no | 720p |
| `seedance_2_0_mini` | `--start-image L --image ref-01 --resolution 720p --generate_audio false` | 12.5 | yes | yes (9 incl. start) | 720p |
| `wan2_7` | `--start-image L --resolution 1080p` | 12.5 | yes | no | 1080p |
| `veo3_1` | `--start-image L --duration 6 --quality basic --variant veo-3-1-fast` | 16.5 (6 s) | yes | no | 720p |
| `wan2_6` | `--image L --image ref-01 --quality 1080p` | 20 | no (reference-to-video: the first frame is not the locked still) | yes | 1080p |
| `seedance_2_0` | `--start-image L --image ref-01 --resolution 720p --mode std --generate_audio false` | **22.5** | yes | yes (9 incl. start) | 720p |
| `cinematic_studio_3_0` | `--start-image L --image ref-01 --resolution 720p --speedramp slowmo --generate_audio false` | 25 | yes | yes (15) | 720p, not under 25 |
| `wan3_0` | `--start-image L --resolution 1080p --generate_audio false` | 27.5 | yes | no (not with a start image) | 1080p |
| `seedance_2_0` | `--mode std --resolution 1080p` | 45 | | | over the 40 cap |
| `cinematic_studio_3_0` | `--resolution 1080p --speedramp slowmo` | 50 | | | over the 40 cap |
| `seedance_2_0` | `--mode fast --resolution 720p` | error "Not found" (exit 3) | | | not available on this plan / build |

## Pick: `seedance_2_0`, std, 720p, 22.5 credits a clip

Selection order from the contract: (1) under 40 at 1080p or under 25 at 720p; (2) a model that
takes reference images beyond the start frame; (3) 1080p over 720p; (4) cheaper on a tie.

- No model that takes extra references is under 40 at 1080p (Seedance std 1080p is 45, Cinematic
  Studio 50), so (2) decides at 720p: Seedance 2.0 std (22.5) and Seedance 2.0 Mini (12.5) both
  qualify; Wan 2.6 takes references but has no start image, so the first frame would not be the
  locked still (fidelity bar line 4); Cinematic Studio 720p is 25, not under 25.
- Between the two Seedance modes I take the full model over Mini rather than the cheaper one: the
  contract's tie-break is for models that are otherwise equal, and Mini is the reduced version of
  the same model. The 10 extra credits a clip buy the car fidelity the whole night is about. Noted
  as a decision for Cedric (LOG.md); Mini stays the cheaper route if he wants more takes.
- Output 720p: the desktop frame set will be 1280 wide (never upscaled, CLAUDE.md rule 3), the
  same width as the hero loop Cedric approved for landing v5.

Flags for every take:

```
scripts/hf.sh seedance_2_0 --prompt "$(cat docs/hero-lab/takes/take-<L>.txt)" \
  --start-image _harvest/higgsfield/locked-frame.png \
  --image _harvest/higgsfield/refs/ref-01.jpg --image _harvest/higgsfield/refs/ref-02.jpg \
  --image _harvest/higgsfield/refs/ref-04.jpg --image _harvest/higgsfield/refs/ref-06.jpg \
  --duration 5 --aspect_ratio 16:9 --resolution 720p --mode std --generate_audio false
```

Budget: spent 20 of the 200 unattended ceiling before the first take; 180 left allows 8 clips at
22.5 (10 under the 250 cap). Planned: three takes (67.5), total 87.5; the last 50 stay untouched.

## Fallback: `kling3_0 --mode pro --sound off`, 8.75 credits a clip, 1080p

Start image only (no extra references), a different vendor, so a Seedance plan restriction does
not reach it, and 1080p (1600-wide frames). Used if the first Seedance job errors with a plan
restriction, or for take D if A to C fail the fidelity bar and the ledger allows it.

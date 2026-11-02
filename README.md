# Eclipse Evolution Wiki

A companion wiki for [Eclipse: The Last Kingdom](https://github.com/AnanthKrishnaJ/eclipse-the-last-kingdom). It covers every divine power and hidden skill in the game: what each one does, how it levels up, and what it becomes at level 5.

Open `index.html` in a browser. It is a single static file with no install step.

## What's inside

- **Divine Powers:** all 112 powers with search, filters and sorting. Each power shows its cost, cooldown, limitation, its evolved form and a level 1 to 5 evolution table.
- **Evolved Forms:** what every power becomes at level 5, such as System Interface → Administrator. Each evolved form shows its level 5 description and a table of exactly what changes from level 1: damage, healing, shields, buffs, summon health and duration, passive bonuses and cooldown.
- **Hidden Skills:** all 200 skills learned by doing, with the action that trains each one, the threshold for every level and the effect at that level. Secret skills stay blurred until you choose to show them.
- **How Growth Works:** the formulas for power growth, a chart of strength by level, points needed per level, and the caps that stop bonuses stacking.
- **Soul Planner:** plan three starting gifts under the game's rules (7 soul points, one Legendary or Divine gift), with a random valid set and the Fate's Gacha check.
- **Class Skills:** Warden, Ranger and Arcanist, the four hotbar skills and the talent tree.

On a computer the list and the details sit side by side. On a phone the details open as a sheet from the bottom.

## Keeping it in sync with the game

The data is read straight from the game's `eclipse.html`, so rebuild after changing powers or hidden skills:

```sh
git clone https://github.com/AnanthKrishnaJ/eclipse-the-last-kingdom ../eclipse-the-last-kingdom
node scripts/build.mjs ../eclipse-the-last-kingdom/eclipse.html $(git -C ../eclipse-the-last-kingdom rev-parse HEAD)
```

This writes a fresh `index.html`. Edit the page design in `src/template.html`, never in `index.html`.

| File | Purpose |
| --- | --- |
| `index.html` | The built wiki |
| `src/template.html` | Page layout, styles and scripts, with data placeholders |
| `scripts/build.mjs` | Pulls powers and hidden skills out of `eclipse.html` and fills the template |

The build reads the `D('...')` power lines and the block that starts at the `HIDDEN SKILLS: learned by doing` comment. If those move in the game file, update `scripts/build.mjs` to match.

## Deploying

The site is plain static files. On Vercel or GitHub Pages, serve the repository root and `index.html` loads automatically.

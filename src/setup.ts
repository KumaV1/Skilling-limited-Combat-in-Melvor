import '../assets/Logo.png'

export async function setup(ctx: Modding.ModContext) {
    // @ts-ignore: You can patch base class no problem
    ctx.patch(Skill, "capXPForGamemode").after(function (returnValue: void) {
        // Not relevant for non-combat skills
        if (!this.isCombat) {
            return;
        }

        // Get lowest non-combat skill level
        const level: number = 1;
        const xpCap: number = exp.level_to_xp(level + 1) - 1;
        if (this._xp > xpCap) {
            this._xp = xpCap;
            this.renderQueue.xpCap = true;
        }
    });

    // TODOs:
    // * Add a caching manager that caches the lowest skill's level, so it isn't constantly recalculated (cached value should be reevaluated whenever a skill levels up)
    // * Add a message like with adventure mode, but in the combat UI, that will inform about at least one skill having reached their cap
}
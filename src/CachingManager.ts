export class CachingManager {
    /** Hard level cap, that can never be increased, based on Gamemode settings and expansion entitlements */
    private static _gameLevelHardCap = 120; // avoid resetting anything just in case

    private static _lowestSkill = {
        skillId: "UNSET",
        level: 120, // avoid resetting anyone, if this is ever wrongfully not-updated
        xpCap: exp.level_to_xp(120 + 1) - 1 // avoid resetting anyone, if this is ever wrongfully not-updated
    };

    /** Patches methods in order to update info about current lowest non-combat skill whenever necessary */
    public static patch(ctx: Modding.ModContext): void {
    // @ts-ignore: You can patch base class no problem
        ctx.patch(Skill, "onLevelUp").after(function (returnValue: void, oldLevel: number, newLevel: number) {
            // If the levelled skill is NOT the current lowest skill,
            // then we don't actually need to do anything
            if (this.id !== CachingManager._lowestSkill.skillId) {
                return;
            }

            // Otherwise we have to check all skills, possibly update what the currently lowest non-combat skill level is
            // Also hide the potentially displayed xp cap notice
            CachingManager._lowestSkill = CachingManager.getLowestSkill();

            const noticeElement = document.getElementById('skill-capped-combat-xp-notice');
            if (noticeElement !== undefined && noticeElement !== null) {
                hideElement(noticeElement);
            }
        });
    }

    /** On character load, set initial value about lowest non-combat skill */
    public static initValue(ctx: Modding.ModContext): void {
        ctx.onCharacterLoaded(() => {
            CachingManager._lowestSkill = CachingManager.getLowestSkill();
            CachingManager._gameLevelHardCap = game.currentGamemode.overrideLevelCap !== undefined
                ? game.currentGamemode.overrideLevelCap
                : cloudManager.hasTotHEntitlement
                    ? 120
                    : 99;
        });
    }

    /** Whether all skills have been maxed */
    public static allSkillsMaxed(): boolean {
        return CachingManager._lowestSkill.level >= CachingManager._gameLevelHardCap;
    }

    /**
     * Get xp cap based on lowest non-combat skill
     * @returns
     */
    public static getXpCap(): number {
        return CachingManager._lowestSkill.xpCap;
    }

    /**
     * Retrieves the current lowest non-combat skill level
     * @returns
     */
    public static getLowestSkill(): { skillId: string; level: number; xpCap: number; } {
        const nonCombatSkills = game.skills.filter((skill) => {
            return !skill.isCombat;
        });
        const lowestSkill = nonCombatSkills.reduce((acc, current) => current.level < acc.level ? current : acc, nonCombatSkills[0] || undefined);

        return {
            skillId: lowestSkill.id,
            level: lowestSkill.level,
            xpCap: exp.level_to_xp(lowestSkill.level + 1) - 1
        };
    }
}
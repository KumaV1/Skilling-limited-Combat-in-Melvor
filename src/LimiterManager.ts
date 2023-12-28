import { CachingManager } from "./CachingManager";
import { Constants } from "./Constants";

export class LimiterManager {
    public static patch(ctx: Modding.ModContext) {
        // Note: The original method checks on "overrideLevelCap". If that resulted in an xp cap below this restriction,
        // then this restriction can't even be hit because "this._xp" has already been adjusted in that case, so there should be no worries there.
        // Due to that, our "max skill level reached" check also shouldn't have to care about gamemode specific restrictions like incremental increase of level caps

        // @ts-ignore: You can patch base class no problem
        ctx.patch(Skill, "capXPForGamemode").after(function (returnValue: void) {
            // Not relevant for non-combat skills
            if (!this.isCombat) {
                return;
            }

            // Do not set an xp cap, if all skills have been maxed
            if (CachingManager.allSkillsMaxed()) {
                return;
            }

            // Get lowest non-combat skill level
            const xpCap: number = CachingManager.getXpCap();
            if (this._xp > xpCap) {
                this._xp = this.id === Constants.HITPOINTS_SKILL_ID
                    ? Math.max(xpCap, Constants.HITPOINTS_XP_CAP)
                    : xpCap;
                this.renderQueue.xpCap = true;

                if (this.level < this.levelCap) {
                    const noticeElement = document.getElementById('skill-capped-combat-xp-notice');
                    if (noticeElement !== undefined && noticeElement !== null) {
                        showElement(noticeElement);
                    }
                }
            }
        });

        // Render a limit notice element, and display it immediately if necessary
        ctx.onInterfaceReady(() => {
            try {
                // Create element
                const noticeElement: HTMLElement = createElement("span", { id: 'skill-capped-combat-xp-notice', classList: ['d-none', 'text-danger', 'font-size-sm', 'pl-3'] });
                noticeElement.appendChild(createElement('i', { classList: ['fa', 'fa-info-circle', 'mr-1'] }));
                noticeElement.appendChild(createElement('span', { text: getLangString(`${Constants.MOD_NAMESPACE}_Skill_Capped_Combat_Exp_Notice`) }));

                const menuElement = document.getElementById('combat-top-menu');
                const parentElement = menuElement?.querySelector('div.col-12:not(#combat-event-menu) div.col-12.pointer-enabled');
                const headerElement = parentElement?.querySelector("h5");
                if (headerElement === undefined || headerElement === null) {
                    console.log("Failed to create skilling-limited combat xp cap notice, as the location to place it couldn't be found");
                    return;
                }

                parentElement?.insertBefore(noticeElement, headerElement);

                // Display it if necessary
                const combatSkills = game.skills.filter((skill) => {
                    return !skill.isCombat;
                });
                const xpCap = CachingManager.getXpCap();
                if (combatSkills.some(s => s.xp >= xpCap && s.level < s.levelCap)) {
                    showElement(noticeElement);
                }

            } catch (e) {
                console.log(`Failed to create skilling-limited combat xp cap notice. Reason: ${e}`);
            }
        });
    }
}
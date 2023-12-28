import { CachingManager } from "./CachingManager";
import { Constants } from "./Constants";

export class LimiterManager {
    // Toggles/Patches for xp limitation and corresponding notification in UI
    // ^ likely render html element on load, and just toggle visibility if necessary?

    public static patch(ctx: Modding.ModContext) {
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
                this._xp = this.id === Constants.HITPOINTS_SKILL_ID
                    ? Math.max(xpCap, Constants.HITPOINTS_XP_CAP)
                    : xpCap;
                this.renderQueue.xpCap = true;
                const noticeElement = document.getElementById('skill-capped-combat-xp-notice');
                if (noticeElement !== undefined && noticeElement !== null) {
                    showElement(noticeElement);
                }
            }
        });

        // Render a limit notice element, and display it immediately if necessary
        ctx.onInterfaceReady(() => {
            try {
                // Create element
                const noticeElement: HTMLElement = createElement("span", { id: 'skill-capped-combat-xp-notice', classList: ['d-none', 'text-danger', 'font-size-sm', 'pl-3'] });
                noticeElement.appendChild(createElement('i', { classList: ['fa', 'fa-info-circle', 'mr-1'] }));
                noticeElement.appendChild(createElement('span', { text: 'Skill Level Limit reached in at least one Combat Skill. Level up your non-Combat Skills to continue earning Combat XP in those Skills.' }));// = '<i class="fa fa-info-circle mr-1"></i> Skill Level Limit reached in at least one Combat Skill. Level up your non-Combat Skills to continue earning Combat XP in those Skills.';

                const menuElement = document.getElementById('combat-top-menu');
                const parentElement = menuElement?.querySelector('div.col-12:not(#combat-event-menu) div.col-12.pointer-enabled'); //('col-12')[1]; // 0 is the offline combat alert
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
                if (combatSkills.some(s => s.xp >= xpCap)) {
                    showElement(noticeElement);
                }

            } catch (e) {
                console.log(`Failed to create skilling-limited combat xp cap notice. Reason: ${e}`);
            }
        });
    }
}
import { CachingManager } from './CachingManager';
import { LimiterManager } from './LimiterManager';
import { TranslationManager } from './translation/TranslationManager';

import '../assets/Logo.png'

export async function setup(ctx: Modding.ModContext) {
    TranslationManager.register(ctx);
    CachingManager.patch(ctx);
    CachingManager.initValue(ctx);
    LimiterManager.patch(ctx);

    //skillingLimitedCombat_Skill_Capped_Combat_Exp_Notice
    //skillingLimitedCombat_Skill_Capped_Combat_Exp_Notice

    ctx.api({
        getXpCap: () => CachingManager.getXpCap(),
        getLowestSkill: () => CachingManager.getLowestSkill()
    });
}
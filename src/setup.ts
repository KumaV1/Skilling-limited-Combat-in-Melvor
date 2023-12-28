import { CachingManager } from './CachingManager';
import { LimiterManager } from './LimiterManager';

import '../assets/Logo.png'

export async function setup(ctx: Modding.ModContext) {
    CachingManager.patch(ctx);
    CachingManager.initValue(ctx);
    LimiterManager.patch(ctx);

    ctx.api({
        getXpCap: () => CachingManager.getXpCap(),
        getLowestSkill: () => CachingManager.getLowestSkill()
    });
}
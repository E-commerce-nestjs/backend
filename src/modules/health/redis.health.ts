import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { HealthIndicatorService } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator {
    constructor(
        private readonly redisService: RedisService,
        //  Inject the `HealthIndicatorService` provided by the `TerminusModule`
        private readonly healthIndicatorService: HealthIndicatorService,
    ) {}

    async isHealthy(key: string) {
        // Start the health indicator check for the given key
        const indicator = this.healthIndicatorService.check(key);

        try {
            const badboys = await this.getBadboys();
            const isHealthy = badboys === 'PONG';

            if (!isHealthy) {
                // Mark the indicator as "down" and add additional info to the response
                return indicator.down({ badboys: 'Redis ping failed' });
            }

            // Mark the health indicator as up
            return indicator.up({ badboys: 'Redis ping success' });
        } catch (error) {
            return indicator.down('Unable to retrieve dogs');
        }
    }

    private getBadboys() {
        return this.redisService.ping();
    }
}

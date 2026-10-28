package com.codelens.gateway.ratelimiter;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Mono;

@Service
public class RateLimiterService {

    @Value("${rate-limit.limit}")
    private int limit;

    @Value("${rate-limit.window-seconds}")
    private int windowSeconds;

    private final ReactiveRedisTemplate<String, String> redisTemplate;

    private final RedisScript<Long> rateLimitScript;

    public RateLimiterService(
            @Qualifier("reactiveRedisTemplate") ReactiveRedisTemplate<String, String> redisTemplate) {

        this.redisTemplate = redisTemplate;

        String script = """
                local count = redis.call('INCR', KEYS[1])

                if count == 1 then
                    redis.call('EXPIRE', KEYS[1], ARGV[1])
                end

                if count <= tonumber(ARGV[2]) then
                    return 1
                end

                return 0
                """;

        this.rateLimitScript =
                RedisScript.of(script, Long.class);
    }

    public Mono<Boolean> allowRequest(String key) {

        String redisKey = "rate-limit:" + key;

        return redisTemplate.execute(
                rateLimitScript,
                Collections.singletonList(redisKey),
                String.valueOf(windowSeconds),
                String.valueOf(limit)
        )
        .next()
        .map(result -> result == 1);
    }
}

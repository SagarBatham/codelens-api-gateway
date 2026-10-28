
package com.codelens.gateway.ratelimiter;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;

@ExtendWith(MockitoExtension.class)
class RateLimiterServiceTest {

    @Mock
    private ReactiveRedisTemplate<String, String> redisTemplate;

    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() throws Exception {
        rateLimiterService = new RateLimiterService(redisTemplate);

        setField(rateLimiterService, "limit", 5);
        setField(rateLimiterService, "windowSeconds", 60);
    }

    private void setField(
            Object target,
            String fieldName,
            Object value) throws Exception {

        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }

    @SuppressWarnings("unchecked")
    private void mockRedisResult(Long result) {
        when(redisTemplate.execute(
                any(RedisScript.class),
                anyList(),
                any(Object[].class)))
                .thenReturn(Flux.just(result));
    }

    @Test
    void shouldAllowRequestWhenRedisReturnsOne() {
        mockRedisResult(1L);

        StepVerifier.create(rateLimiterService.allowRequest("client-1"))
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    void shouldRejectRequestWhenRedisReturnsZero() {
        mockRedisResult(0L);

        StepVerifier.create(rateLimiterService.allowRequest("client-1"))
                .expectNext(false)
                .verifyComplete();
    }

    @Test
    void shouldCompleteEmptyWhenRedisReturnsNoResult() {
        when(redisTemplate.execute(
                any(RedisScript.class),
                anyList(),
                any(Object[].class)))
                .thenReturn(Flux.empty());

        StepVerifier.create(rateLimiterService.allowRequest("client-1"))
                .verifyComplete();
    }

    @Test
    void shouldUseClientSpecificRedisKey() {
        mockRedisResult(1L);

        StepVerifier.create(rateLimiterService.allowRequest("client-123"))
                .expectNext(true)
                .verifyComplete();

        verify(redisTemplate).execute(
                any(RedisScript.class),
                org.mockito.ArgumentMatchers.<List<String>>argThat(
                        keys -> keys.size() == 1
                                && keys.get(0).equals("rate-limit:client-123")),
                any(Object[].class));
    }
}

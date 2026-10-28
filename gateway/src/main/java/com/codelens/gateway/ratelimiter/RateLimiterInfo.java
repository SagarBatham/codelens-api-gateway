package com.codelens.gateway.ratelimiter;

public class RateLimiterInfo {
	private int count;
	private long windowStart;
	
	public int getCount() {
		return count;
	}

	public long getWindowStart() {
		return windowStart;
	}

	public void setWindowStart(long window) {
		this.windowStart = window;
	}

	public void setCount(int count) {
		this.count = count;
	}
	
	public RateLimiterInfo(long windowStart) {
		this.count=0;
		this.windowStart=windowStart;
	}
	
	public void increment() {
		count++;
	}
	
	public void reset(long newWindow) {
		this.count=0;
		this.windowStart=newWindow;
	}
	
}


type EventCallback = (data?: any) => void;

class EventEmitter {
  private events: Record<string, EventCallback[]> = {};

  // Subscribe to an event
  on(event: string, callback: EventCallback): () => void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // Return an unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  // Emit an event with optional data
  emit(event: string, data?: any): void {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      callback(data);
    });
  }
}

// Create a singleton instance
const eventEmitter = new EventEmitter();

export default eventEmitter;

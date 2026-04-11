type RealtimeEvent = {
  topic: string;
  payload?: unknown;
};

const channelName = 'student-volunteer-realtime';

function getChannel() {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  return new BroadcastChannel(channelName);
}

export function publishRealtimeEvent(topic: string, payload?: unknown) {
  const channel = getChannel();
  channel?.postMessage({ topic, payload } satisfies RealtimeEvent);
  channel?.close();
}

export function subscribeToRealtimeTopic(topic: string, callback: () => void) {
  const channel = getChannel();
  if (!channel) {
    return () => undefined;
  }

  const handler = (event: MessageEvent<RealtimeEvent>) => {
    if (event.data?.topic === topic) {
      callback();
    }
  };

  channel.addEventListener('message', handler);

  return () => {
    channel.removeEventListener('message', handler);
    channel.close();
  };
}
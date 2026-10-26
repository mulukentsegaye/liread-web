import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LiveCoReader } from '../types';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceReaderPayload {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bookTitle: string;
  bookAuthor?: string;
  startedAt?: number;
}

class CoReadingService {
  private channel: RealtimeChannel | null = null;
  private currentPresence: PresenceReaderPayload | null = null;
  private subscribers = new Set<(readers: LiveCoReader[]) => void>();
  private activePresences: LiveCoReader[] = [];
  private clientId = 'client-' + Math.random().toString(36).substring(2, 11);
  private isSubscribed = false;

  constructor() {
    this.initChannel();
  }

  private initChannel() {
    if (!isSupabaseConfigured() || typeof window === 'undefined') return;

    this.channel = supabase.channel('liread:live-co-reading', {
      config: {
        presence: {
          key: this.clientId,
        },
      },
    });

    this.channel
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      })
      .on('presence', { event: 'join' }, () => {
        this.handlePresenceSync();
      })
      .on('presence', { event: 'leave' }, () => {
        this.handlePresenceSync();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          this.isSubscribed = true;
          if (this.currentPresence) {
            await this.track(this.currentPresence);
          }
        } else {
          this.isSubscribed = false;
        }
      });
  }

  private handlePresenceSync() {
    if (!this.channel) return;
    const state = this.channel.presenceState();
    const readers: LiveCoReader[] = [];

    for (const [key, presences] of Object.entries(state)) {
      for (const p of presences as any[]) {
        if (!p || !p.bookTitle) continue;
        const fullName = p.fullName || p.username || 'Quiet Reader';
        const initials = fullName
          .split(' ')
          .filter(Boolean)
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase() || 'RD';

        const startedAt = typeof p.startedAt === 'number' ? p.startedAt : Date.now();
        const sessionStartedMinutesAgo = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

        readers.push({
          userId: p.userId || key,
          username: p.username || 'reader',
          fullName,
          initials,
          avatarUrl: p.avatarUrl || undefined,
          bookTitle: p.bookTitle,
          bookAuthor: p.bookAuthor,
          sessionStartedMinutesAgo,
          isCurrentUser: key === this.clientId,
        });
      }
    }

    this.activePresences = readers;
    this.notifySubscribers();
  }

  private notifySubscribers() {
    for (const cb of this.subscribers) {
      try {
        cb(this.activePresences);
      } catch (err) {
        console.warn('Error in co-reading subscriber:', err);
      }
    }
  }

  /**
   * Track current user presence when reading timer is active
   */
  async track(payload: PresenceReaderPayload) {
    this.currentPresence = payload;
    if (!this.channel) {
      this.initChannel();
    }
    if (!this.channel || !this.isSubscribed) return;

    try {
      await this.channel.track({
        ...payload,
        startedAt: payload.startedAt || Date.now(),
        clientId: this.clientId,
      });
    } catch (err) {
      console.warn('Failed to track co-reading presence:', err);
    }
  }

  /**
   * Untrack current user when timer is paused, stopped, or reset
   */
  async untrack() {
    this.currentPresence = null;
    if (!this.channel || !this.isSubscribed) return;

    try {
      await this.channel.untrack();
    } catch (err) {
      console.warn('Failed to untrack co-reading presence:', err);
    }
  }

  /**
   * Subscribe to live co-readers list across all active clients
   */
  subscribe(callback: (readers: LiveCoReader[]) => void): () => void {
    this.subscribers.add(callback);
    callback(this.activePresences);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  getActiveCoReaders(): LiveCoReader[] {
    return this.activePresences;
  }
}

export const coReadingService = new CoReadingService();

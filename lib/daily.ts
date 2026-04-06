import Daily from '@daily-co/daily-js'

export interface CallRoom {
  url: string
  token: string
}

/** Subset of Daily iframe API used by this service (library may not ship full types). */
type DailyFrameClient = {
  createRoom: (args: {
    properties: Record<string, boolean>
  }) => Promise<{ url: string; token: string }>
  join: (roomUrl: string, options: Record<string, string>) => Promise<unknown>
  leave: () => Promise<void>
  setLocalVideo: (enabled: boolean) => Promise<void>
  setLocalAudio: (enabled: boolean) => Promise<void>
  startScreenShare: () => Promise<void>
  stopScreenShare: () => Promise<void>
  on: (event: string, callback: (...args: unknown[]) => void) => void
  destroy: () => void
}

export class DailyService {
  private daily: DailyFrameClient | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.daily = Daily.createFrame() as DailyFrameClient
    }
  }

  async createCallRoom(): Promise<CallRoom> {
    if (!this.daily) {
      throw new Error('Daily not initialized')
    }

    try {
      const room = await this.daily.createRoom({
        properties: {
          enable_chat: true,
          enable_screenshare: true,
          enable_knocking: true,
          start_video_off: false,
          start_audio_off: false,
        },
      })

      return {
        url: room.url,
        token: room.token,
      }
    } catch (error) {
      console.error('Error creating Daily call room:', error)
      throw error
    }
  }

  async joinCall(roomUrl: string, options: {
    video?: boolean
    audio?: boolean
  } = {}): Promise<unknown> {
    if (!this.daily) {
      throw new Error('Daily not initialized')
    }

    try {
      const call = await this.daily.join(roomUrl, {
        videoSource: options.video !== false ? 'camera' : 'none',
        audioSource: options.audio !== false ? 'mic' : 'none',
      })

      return call
    } catch (error) {
      console.error('Error joining Daily call:', error)
      throw error
    }
  }

  async leaveCall(): Promise<void> {
    if (!this.daily) {
      return
    }

    try {
      await this.daily.leave()
    } catch (error) {
      console.error('Error leaving Daily call:', error)
    }
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    if (!this.daily) {
      return
    }

    try {
      if (enabled) {
        await this.daily.setLocalVideo(true)
      } else {
        await this.daily.setLocalVideo(false)
      }
    } catch (error) {
      console.error('Error toggling video:', error)
    }
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (!this.daily) {
      return
    }

    try {
      if (enabled) {
        await this.daily.setLocalAudio(true)
      } else {
        await this.daily.setLocalAudio(false)
      }
    } catch (error) {
      console.error('Error toggling audio:', error)
    }
  }

  async startScreenShare(): Promise<void> {
    if (!this.daily) {
      return
    }

    try {
      await this.daily.startScreenShare()
    } catch (error) {
      console.error('Error starting screen share:', error)
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.daily) {
      return
    }

    try {
      await this.daily.stopScreenShare()
    } catch (error) {
      console.error('Error stopping screen share:', error)
    }
  }

  onCallJoined(callback: (call: unknown) => void): void {
    if (this.daily) {
      this.daily.on('joined-meeting', callback)
    }
  }

  onCallLeft(callback: () => void): void {
    if (this.daily) {
      this.daily.on('left-meeting', callback)
    }
  }

  onParticipantJoined(callback: (participant: unknown) => void): void {
    if (this.daily) {
      this.daily.on('participant-joined', callback)
    }
  }

  onParticipantLeft(callback: (participant: unknown) => void): void {
    if (this.daily) {
      this.daily.on('participant-left', callback)
    }
  }

  destroy(): void {
    if (this.daily) {
      this.daily.destroy()
      this.daily = null
    }
  }
}

export const dailyService = new DailyService()

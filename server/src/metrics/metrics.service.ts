// src/metrics/metrics.service.ts

// Nest js
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

// Models
import { Note } from '../notes/models/note-model';
import { Owner } from '../owner/models/owner-model';

// Other packages
import { Op } from 'sequelize';
import { NOTIFICATIONS_QUEUE_NAME } from '../queue/queues/notifications.queue';
import Redis from 'ioredis';

@Injectable()
export class MetricsService {
  private lastCpuUsage = process.cpuUsage();
  private lastCpuTime = Date.now();

  constructor(
    @InjectModel(Note)
    private readonly noteModel: typeof Note,
    @InjectModel(Owner)
    private readonly ownerModel: typeof Owner,
    @InjectQueue(NOTIFICATIONS_QUEUE_NAME)
    private readonly telegramQueue: Queue,
    @Inject('REAL_REDIS')
    private readonly redisClient: Redis,
  ) {}

  /**
   * Get comprehensive system metrics
   */
  async getMetrics() {
    const [serverStats, databaseStats, queueStats, redisStats] =
      await Promise.all([
        this.getServerStats(),
        this.getDatabaseStats(),
        this.getQueueStats(),
        this.getRedisStats(),
      ]);

    return {
      timestamp: new Date().toISOString(),
      server: serverStats,
      database: databaseStats,
      queues: queueStats,
      redis: redisStats,
    };
  }

  /**
   * Get server statistics
   */
  private getServerStats() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const cpuPercent = this.getCpuUsagePercent();

    return {
      uptime: this.formatUptime(uptime),
      uptimeSeconds: Math.floor(uptime),
      cpu: {
        usage: `${cpuPercent.toFixed(2)}%`,
        usagePercent: cpuPercent,
      },
      memory: {
        used: this.formatBytes(memoryUsage.heapUsed),
        usedBytes: memoryUsage.heapUsed,
        total: this.formatBytes(memoryUsage.heapTotal),
        totalBytes: memoryUsage.heapTotal,
        rss: this.formatBytes(memoryUsage.rss),
        rssBytes: memoryUsage.rss,
        external: this.formatBytes(memoryUsage.external),
        externalBytes: memoryUsage.external,
        arrayBuffers: this.formatBytes(memoryUsage.arrayBuffers),
        arrayBuffersBytes: memoryUsage.arrayBuffers,
        percentUsed:
          ((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2) +
          '%',
      },
      nodeVersion: process.version,
      platform: process.platform,
      pid: process.pid,
    };
  }

  /**
   * Get database statistics
   */
  private async getDatabaseStats() {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [
      totalNotes,
      activeNotes,
      notesWithPassword,
      expiredNotes,
      createdToday,
      readToday,
      totalOwners,
    ] = await Promise.all([
      this.noteModel.count(),
      this.noteModel.count({ where: { readAt: null } }), // isRead = false means readAt is null
      this.noteModel.count({ where: { passwordHash: { [Op.ne]: null } } }),
      this.noteModel.count({
        where: {
          expiresAt: { [Op.ne]: null, [Op.lt]: now },
        },
      }),
      this.noteModel.count({
        where: {
          createdAt: { [Op.gte]: todayStart },
        },
      }),
      this.noteModel.count({
        where: {
          readAt: { [Op.gte]: todayStart },
        },
      }),
      this.ownerModel.count(),
    ]);

    return {
      notes: {
        total: totalNotes,
        active: activeNotes,
        withPassword: notesWithPassword,
        expired: expiredNotes,
        createdToday,
        readToday,
      },
      owners: {
        total: totalOwners,
      },
    };
  }

  /**
   * Get queue statistics
   */
  private async getQueueStats() {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.telegramQueue.getWaitingCount(),
        this.telegramQueue.getActiveCount(),
        this.telegramQueue.getCompletedCount(),
        this.telegramQueue.getFailedCount(),
        this.telegramQueue.getDelayedCount(),
      ]);

      const total = waiting + active + completed + failed + delayed;
      const isOverloaded = waiting > 100 || active > 50; // Thresholds for warning

      return {
        telegramNotifications: {
          waiting,
          active,
          completed,
          failed,
          delayed,
          total,
          status: isOverloaded ? 'overloaded' : 'healthy',
          health: {
            waitingOk: waiting < 100,
            activeOk: active < 50,
          },
        },
      };
    } catch (error) {
      return {
        telegramNotifications: {
          error: 'Failed to fetch queue stats',
          message: error.message,
        },
      };
    }
  }

  /**
   * Get Redis statistics
   */
  private async getRedisStats() {
    try {
      if (!this.redisClient) {
        return {
          status: 'unavailable',
          error: 'Redis client not found',
        };
      }

      // Get Redis INFO
      const info = await this.redisClient.info('memory');
      const infoLines = info.split('\r\n');
      const memoryStats: any = {};

      infoLines.forEach(line => {
        const [key, value] = line.split(':');
        if (key && value) {
          memoryStats[key] = value;
        }
      });

      // Get database size
      const dbSize = await this.redisClient.dbsize();

      // Get used memory
      const usedMemoryBytes = parseInt(memoryStats.used_memory || '0', 10);
      const usedMemoryHuman = memoryStats.used_memory_human || 'N/A';
      const maxMemoryBytes = parseInt(memoryStats.maxmemory || '0', 10);

      return {
        status: 'connected',
        keys: dbSize,
        memory: {
          used: usedMemoryHuman,
          usedBytes: usedMemoryBytes,
          max:
            maxMemoryBytes > 0 ? this.formatBytes(maxMemoryBytes) : 'unlimited',
          maxBytes: maxMemoryBytes,
          fragmentation: memoryStats.mem_fragmentation_ratio || 'N/A',
        },
      };
    } catch (error) {
      return {
        status: 'error',
        error: 'Failed to fetch Redis stats',
        message: error.message,
      };
    }
  }

  /**
   * Calculate CPU usage percentage
   */
  private getCpuUsagePercent(): number {
    const currentCpuUsage = process.cpuUsage(this.lastCpuUsage);
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastCpuTime;

    // Calculate total CPU time in microseconds
    const totalCpuTime = currentCpuUsage.user + currentCpuUsage.system;

    // Calculate percentage (time diff is in ms, cpu time is in microseconds)
    const cpuPercent = (totalCpuTime / (timeDiff * 1000)) * 100;

    // Update last values
    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = currentTime;

    return cpuPercent;
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    const mb = bytes / 1024 / 1024;
    return `${mb.toFixed(2)} MB`;
  }

  /**
   * Format uptime to human readable format
   */
  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}

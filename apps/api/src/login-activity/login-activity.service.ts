import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../common/dto/paginated-response.dto';
import {
  LoginActivity,
  LoginActorType,
} from './entities/login-activity.entity';
import { isPrivateOrLocalIp } from './ip.util';

const IP_LOOKUP_TIMEOUT_MS = 3000;

type IpGeo = {
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type LoginActivityResponse = {
  id: number;
  actorType: LoginActorType;
  actorName: string | null;
  actorEmail: string | null;
  method: string;
  ipAddress: string;
  userAgent: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  locationSource: string | null;
  createdAt: Date;
};

function toResponse(activity: LoginActivity): LoginActivityResponse {
  const actorName =
    activity.actorType === LoginActorType.CUSTOMER
      ? activity.user
        ? `${activity.user.firstName} ${activity.user.lastName}`
        : null
      : (activity.adminUser?.name ?? null);
  const actorEmail =
    activity.actorType === LoginActorType.CUSTOMER
      ? (activity.user?.email ?? null)
      : (activity.adminUser?.email ?? null);

  return {
    id: activity.id,
    actorType: activity.actorType,
    actorName,
    actorEmail,
    method: activity.method,
    ipAddress: activity.ipAddress,
    userAgent: activity.userAgent,
    city: activity.city,
    region: activity.region,
    country: activity.country,
    latitude: activity.latitude ? Number(activity.latitude) : null,
    longitude: activity.longitude ? Number(activity.longitude) : null,
    locationSource: activity.locationSource,
    createdAt: activity.createdAt,
  };
}

@Injectable()
export class LoginActivityService {
  private readonly logger = new Logger(LoginActivityService.name);

  constructor(
    @InjectRepository(LoginActivity)
    private readonly loginActivityRepository: Repository<LoginActivity>,
  ) {}

  /**
   * Called right after a login/register/sign-in succeeds. Resolves an
   * approximate city/region/country from the IP address as the baseline —
   * a GPS fix can arrive later and upgrade this same row (see
   * attachGpsLocation) once/if the browser grants location permission.
   * The IP lookup is best-effort: a slow or failing third-party call must
   * never fail (or even delay) the login it's just auditing.
   */
  async record(params: {
    actorType: LoginActorType;
    userId?: number | null;
    adminUserId?: number | null;
    method: string;
    ipAddress: string;
    userAgent: string | null;
  }): Promise<LoginActivity> {
    const geo = await this.lookupIpGeo(params.ipAddress);
    return this.loginActivityRepository.save(
      this.loginActivityRepository.create({
        actorType: params.actorType,
        userId: params.userId ?? null,
        adminUserId: params.adminUserId ?? null,
        method: params.method,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        city: geo?.city ?? null,
        region: geo?.region ?? null,
        country: geo?.country ?? null,
        latitude: geo?.latitude != null ? geo.latitude.toFixed(6) : null,
        longitude: geo?.longitude != null ? geo.longitude.toFixed(6) : null,
        locationSource: geo ? 'ip' : null,
      }),
    );
  }

  /** Upgrades a just-created row with a precise GPS fix, once the browser/app grants permission. */
  async attachGpsLocation(
    id: number,
    actor: {
      actorType: LoginActorType;
      userId?: number | null;
      adminUserId?: number | null;
    },
    coords: { latitude: number; longitude: number },
  ): Promise<void> {
    const activity = await this.loginActivityRepository.findOne({
      where: { id },
    });
    if (!activity) {
      throw new NotFoundException(`Login activity ${id} not found`);
    }
    const owns =
      activity.actorType === actor.actorType &&
      (actor.actorType === LoginActorType.CUSTOMER
        ? activity.userId === actor.userId
        : activity.adminUserId === actor.adminUserId);
    if (!owns) {
      throw new ForbiddenException('That login event does not belong to you');
    }

    await this.loginActivityRepository.update(id, {
      latitude: coords.latitude.toFixed(6),
      longitude: coords.longitude.toFixed(6),
      locationSource: 'gps',
    });
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<LoginActivityResponse>> {
    const [data, total] = await this.loginActivityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.adminUser', 'adminUser')
      .orderBy('activity.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return new PaginatedResponse(data.map(toResponse), total, page, limit);
  }

  private async lookupIpGeo(ip: string): Promise<IpGeo | null> {
    if (isPrivateOrLocalIp(ip)) return null;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        IP_LOOKUP_TIMEOUT_MS,
      );
      const res = await fetch(
        `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,country,lat,lon`,
        { signal: controller.signal },
      );
      clearTimeout(timeout);
      const data = (await res.json()) as {
        status: 'success' | 'fail';
        city?: string;
        regionName?: string;
        country?: string;
        lat?: number;
        lon?: number;
      };
      if (data.status !== 'success') return null;
      return {
        city: data.city ?? null,
        region: data.regionName ?? null,
        country: data.country ?? null,
        latitude: data.lat ?? null,
        longitude: data.lon ?? null,
      };
    } catch (error) {
      // Never let a slow/unreachable geo-IP service affect a login.
      this.logger.warn(
        `IP geolocation lookup failed for ${ip}: ${String(error)}`,
      );
      return null;
    }
  }
}

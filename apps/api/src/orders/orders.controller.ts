import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../auth/decorators/current-user.decorator';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { OptionalJwtAccessGuard } from '../auth/guards/optional-jwt-access.guard';
import { OrdersService } from './orders.service';
import { TrackOrderDto } from './dto/track-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAccessGuard)
  findMine(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.findForUser(
      user.userId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Post('track')
  track(@Body() dto: TrackOrderDto) {
    return this.ordersService.track(dto.orderNumber, dto.email);
  }

  @Get(':orderNumber')
  @UseGuards(JwtAccessGuard)
  findOne(
    @CurrentUser() user: CurrentUserPayload,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.ordersService.findDetailForUser(user.userId, orderNumber);
  }

  // Optional auth so both a signed-in customer and a guest (identified by
  // the email they check out with) can cancel their own order.
  @Post(':orderNumber/cancel')
  @UseGuards(OptionalJwtAccessGuard)
  cancel(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Param('orderNumber') orderNumber: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancel(
      orderNumber,
      user?.userId ?? null,
      dto.email,
    );
  }
}

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { CreateReturnRequestDto } from './dto/create-return-request.dto';

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

  // Optional auth, same reasoning as cancel above — a guest checkout has no
  // account to authenticate with, so email is the ownership proof instead.
  @Post(':orderNumber/items/:orderItemId/return-request')
  @UseGuards(OptionalJwtAccessGuard)
  requestReturn(
    @CurrentUser() user: CurrentUserPayload | undefined,
    @Param('orderNumber') orderNumber: string,
    @Param('orderItemId', ParseIntPipe) orderItemId: number,
    @Body() dto: CreateReturnRequestDto,
  ) {
    return this.ordersService.requestReturn(
      orderNumber,
      orderItemId,
      user?.userId ?? null,
      dto,
    );
  }
}

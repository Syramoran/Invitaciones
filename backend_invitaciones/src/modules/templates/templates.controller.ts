// src/modules/templates/templates.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto, TemplateResponseDto, TemplatePublicDto } from './dto/template.dto';
import { Public } from '../auth/decorators/public.decorator';
import { RequireAdmin } from '../auth/decorators/require-admin.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // ─────────────────────────────────────────
  // Endpoints públicos (sin JWT obligatorio)
  // ─────────────────────────────────────────

  // Público para cualquier visitante, pero si quien llama está logueado
  // como ADMIN también recibe los templates privados (hechos a medida para
  // un cliente puntual, no deben aparecer en el catálogo general).
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(
    @Query() query: TemplateQueryDto,
    @Req() req: Request,
  ): Promise<TemplateResponseDto[]> {
    const usuario = req.user as AuthenticatedUser | undefined;
    const esAdmin = usuario?.role === 'ADMIN';
    return this.templatesService.findAll(query, esAdmin);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) : Promise<TemplateResponseDto> {
    return this.templatesService.findById(id);
  }

  @Public()
  @Get(':id/preview')
  preview(@Param('id', ParseIntPipe) id: number) : Promise<TemplatePublicDto> {
    return this.templatesService.findPreview(id);
  }

  // ─────────────────────────────────────────
  // Endpoints admin (protegidos por JwtAuthGuard global)
  // ─────────────────────────────────────────

  @Post()
  @RequireAdmin()
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Put(':id')
  @RequireAdmin()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, dto);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.templatesService.toggle(id);
  }
}
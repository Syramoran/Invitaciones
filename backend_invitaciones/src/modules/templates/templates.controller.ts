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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto, TemplateResponseDto, TemplatePublicDto } from './dto/template.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // ─────────────────────────────────────────
  // Endpoints públicos (sin JWT)
  // ─────────────────────────────────────────

  @Public()
  @Get()
  findAll(@Query() query: TemplateQueryDto) : Promise<TemplateResponseDto[]> {
    return this.templatesService.findAll(query);
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
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Put(':id')
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